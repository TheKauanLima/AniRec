const jwt = require('jsonwebtoken');
const MALClient = require('../../infrastructure/api/MALClient');
const UserRepository = require('../../infrastructure/database/repositories/UserRepository');

class MALAuthController {
    constructor() {
        this.malClient = new MALClient();
        this.userRepository = new UserRepository();
    }

    // Step 1: Generate the MAL authorization URL + PKCE verifier
    async getAuthUrl(req, res) {
        try {
            const codeVerifier = this.malClient.generateCodeVerifier();
            const state = require('crypto').randomBytes(16).toString('hex');

            const authUrl = this.malClient.getAuthorizationUrl(codeVerifier, state);

            // Return verifier and state so the frontend can store them and send back on callback
            res.json({
                authUrl,
                codeVerifier,
                state,
            });
        }
        catch (error) {
            console.error('MAL auth URL error:', error);
            res.status(500).json({ error: 'Failed to generate MAL authorization URL' });
        }
    }

    // Step 2: Handle the callback — exchange code for tokens, create/link user
    async handleCallback(req, res) {
        try {
            const { code, codeVerifier, state } = req.body;

            if (!code || !codeVerifier) {
                return res.status(400).json({ error: 'Authorization code and code verifier are required' });
            }

            // Exchange code for tokens
            const tokens = await this.malClient.exchangeCodeForTokens(code, codeVerifier);

            // Get the user's MAL profile
            const malProfile = await this.malClient.getUserProfile(tokens.accessToken);

            const tokenExpires = new Date(Date.now() + tokens.expiresIn * 1000);

            // Check if a user with this MAL ID already exists
            let user = await this.userRepository.findByMalId(malProfile.id);

            if (user) {
                // Update tokens for existing user
                await this.userRepository.updateMalTokens(user.id, {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    tokenExpires,
                });
            }
            else if (req.body.linkToUserId) {
                // Link MAL to an existing AniRec account
                const existingUser = await this.userRepository.findById(req.body.linkToUserId);
                if (!existingUser) {
                    return res.status(404).json({ error: 'User not found' });
                }

                await this.userRepository.linkMalAccount(existingUser.id, {
                    malId: malProfile.id,
                    malUsername: malProfile.name,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    tokenExpires,
                });

                user = await this.userRepository.findById(existingUser.id);
            }
            else {
                // Create a new user from MAL profile (no password needed)
                user = await this.userRepository.createFromMal({
                    username: malProfile.name,
                    malId: malProfile.id,
                    malUsername: malProfile.name,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    tokenExpires,
                });
            }

            // Issue a JWT for the app
            const appToken = jwt.sign(
                {
                    userId: user.id,
                    username: user.username,
                    isVerified: true,
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: 'MAL login successful',
                token: appToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    isVerified: true,
                    malUsername: user.malUsername,
                    malConnected: true,
                },
            });
        }
        catch (error) {
            console.error('MAL callback error:', error.response?.data || error.message);
            res.status(500).json({ error: 'MAL authentication failed' });
        }
    }

    // Import the user's MAL anime list into their AniRec ratings
    async importAnimeList(req, res) {
        try {
            const userId = req.user.userId;
            const user = await this.userRepository.findById(userId);

            if (!user || !user.malAccessToken) {
                return res.status(400).json({ error: 'MAL account not connected' });
            }

            // Refresh token if expired
            let accessToken = user.malAccessToken;
            if (user.malTokenExpires && new Date(user.malTokenExpires) < new Date()) {
                const refreshed = await this.malClient.refreshAccessToken(user.malRefreshToken);
                accessToken = refreshed.accessToken;

                await this.userRepository.updateMalTokens(userId, {
                    accessToken: refreshed.accessToken,
                    refreshToken: refreshed.refreshToken,
                    tokenExpires: new Date(Date.now() + refreshed.expiresIn * 1000),
                });
            }

            // Fetch the user's full anime list from MAL
            const animeList = await this.malClient.getFullUserAnimeList(accessToken);

            // Import rated anime into our ratings table
            let imported = 0;
            let skipped = 0;

            for (const anime of animeList) {
                if (anime.listStatus.score > 0) {
                    await this.userRepository.upsertRating(
                        userId,
                        anime.malId,
                        anime.listStatus.score,
                        `Imported from MAL`
                    );
                    imported++;
                }
                else {
                    skipped++;
                }
            }

            // Also import watchlist status
            let watchlistImported = 0;
            for (const anime of animeList) {
                const statusMap = {
                    watching: 'watching',
                    completed: 'completed',
                    on_hold: 'watching',
                    dropped: 'dropped',
                    plan_to_watch: 'plan_to_watch',
                };

                const status = statusMap[anime.listStatus.status] || 'plan_to_watch';
                await this.userRepository.upsertWatchlistItem(userId, anime.malId, status);
                watchlistImported++;
            }

            res.json({
                message: 'MAL anime list imported successfully',
                stats: {
                    totalAnime: animeList.length,
                    ratingsImported: imported,
                    ratingsSkipped: skipped,
                    watchlistImported,
                },
            });
        }
        catch (error) {
            console.error('MAL import error:', error.response?.data || error.message);
            res.status(500).json({ error: 'Failed to import MAL anime list' });
        }
    }
}

module.exports = MALAuthController;
