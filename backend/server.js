require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const monitorsRouter = require('./routes/monitors');
const logsRouter = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/monitors', monitorsRouter);
app.use('/api/logs', logsRouter);

// Health check — Phase 9 Prometheus will scrape this
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pingwatch')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
