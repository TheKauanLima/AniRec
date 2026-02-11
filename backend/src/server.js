require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./interfaces/routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded(
{
  extended: true
}));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) =>
{
  res.json(
  {
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) =>
{
  res.status(404).json(
  {
    error: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) =>
{
  console.error(err.stack);
  res.status(500).json(
  {
    error: 'Something went wrong!'
  });
});

app.listen(PORT, () =>
{
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
});

module.exports = app;
