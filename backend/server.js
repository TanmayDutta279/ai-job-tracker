require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
console.log("ENV TEST:", JSON.stringify(process.env.OPENROUTER_API_KEY));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'JobFlow AI Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
