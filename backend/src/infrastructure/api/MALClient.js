const axios = require('axios');
const crypto = require('crypto');

class MALClient {
    constructor() {
        this.clientId = process.env.MAL_CLIENT_ID;
        this.clientSecret = process.env.MAL_CLIENT_SECRET;
        this.redirectUri = process.env.MAL_REDIRECT_URI || 'http://localhost:3000/auth/mal/callback';

        this.authBaseURL = 'https://myanimelist.net/v1/oauth2';
        this.apiBaseURL = 'https://api.myanimelist.net/v2';

        this.apiClient = axios.create({
            baseURL: this.apiBaseURL,
            timeout: 10000,
        });
    }

    // Generate a PKCE code verifier (random 128-char string)
    generateCodeVerifier() {
        return crypto.randomBytes(64).toString('hex');
    }

    // Build the authorization URL for the user to visit
    getAuthorizationUrl(codeVerifier, state) {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            code_challenge: codeVerifier,
            code_challenge_method: 'plain',
            state: state,
        });

        return `${this.authBaseURL}/authorize?${params.toString()}`;
    }

    // Exchange authorization code for access + refresh tokens
    async exchangeCodeForTokens(code, codeVerifier) {
        const params = new URLSearchParams({
            client_id: this.clientId,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
            code_verifier: codeVerifier,
        });

        if (this.clientSecret) {
            params.append('client_secret', this.clientSecret);
        }

        const response = await axios.post(
            `${this.authBaseURL}/token`,
            params.toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        return {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            expiresIn: response.data.expires_in,
            tokenType: response.data.token_type,
        };
    }

    // Refresh an expired access token
    async refreshAccessToken(refreshToken) {
        const params = new URLSearchParams({
            client_id: this.clientId,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        });

        if (this.clientSecret) {
            params.append('client_secret', this.clientSecret);
        }

        const response = await axios.post(
            `${this.authBaseURL}/token`,
            params.toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        return {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            expiresIn: response.data.expires_in,
        };
    }

    // Get the authenticated user's MAL profile
    async getUserProfile(accessToken) {
        const response = await this.apiClient.get('/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        return {
            id: response.data.id,
            name: response.data.name,
            picture: response.data.picture,
        };
    }

    // Get the user's anime list with scores
    async getUserAnimeList(accessToken, { status, limit = 100, offset = 0 } = {}) {
        const params = {
            fields: 'list_status,num_episodes,genres,mean,media_type,status',
            limit,
            offset,
            nsfw: 'false',
        };

        if (status) {
            params.status = status;
        }

        const response = await this.apiClient.get('/users/@me/animelist', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params,
        });

        return {
            data: response.data.data.map(item => ({
                malId: item.node.id,
                title: item.node.title,
                mainPicture: item.node.main_picture,
                numEpisodes: item.node.num_episodes,
                mean: item.node.mean,
                mediaType: item.node.media_type,
                genres: item.node.genres,
                listStatus: {
                    status: item.list_status.status,
                    score: item.list_status.score,
                    numEpisodesWatched: item.list_status.num_episodes_watched,
                    updatedAt: item.list_status.updated_at,
                },
            })),
            hasNext: !!response.data.paging?.next,
        };
    }

    // Fetch all pages of the user's anime list
    async getFullUserAnimeList(accessToken) {
        const allAnime = [];
        let offset = 0;
        const limit = 100;

        while (true) {
            const result = await this.getUserAnimeList(accessToken, { limit, offset });
            allAnime.push(...result.data);

            if (!result.hasNext) {
                break;
            }

            offset += limit;
        }

        return allAnime;
    }
}

module.exports = MALClient;
