require('dotenv').config();

const required = ['MONGO_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`[server] Missing env var: ${key}`);
    process.exit(1);
  }
});

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const helmet = require('helmet');

const User = require('./models/User');
const startWorker = require('./worker');
const monitorsRouter = require('./routes/monitors');
const logsRouter = require('./routes/logs');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max:30, // limit each IP to 30 requests per windowMs
  message:{ error: 'Too many requests, slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
})

//  Trust proxy
app.set('trust proxy', 1);

app.use('/api', limiter);

//  Security headers 
app.use(helmet());

//  CORS 
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

//  Body parsing 
app.use(express.json({ limit: '10kb' })); // reject oversized payloads

//  Request timeout — drop hung requests after 15s 
app.use((req, res, next) => {
  res.setTimeout(15000, () => {
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

//  Passport Google OAuth 
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/auth/google/callback`,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value || null,
        });
        console.log(`[auth] New user created: ${user.email}`);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

app.use(passport.initialize());

//  Routes 
app.use('/auth', authRouter);
app.use('/api/monitors', monitorsRouter);
app.use('/api/logs', logsRouter);

//  Health check 
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

//  404 handler 
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

//  Global error handler 
app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

//  Graceful shutdown 
async function shutdown(signal) {
  console.log(`[server] ${signal} received — shutting down gracefully`);
  try {
    await mongoose.connection.close();
    console.log('[server] MongoDB connection closed');
    process.exit(0);
  }
  catch (err) {
    console.error('[server] Error during shutdown:', err.message);
    process.exit(1);
  }
  setTimeout(()=> process.exit(1),8000); // force exit if shutdown takes too long
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

//  Bootstrap 
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pingwatch')
  .then(() => {
    console.log('[server] Connected to MongoDB');
    app.listen(PORT, () => console.log(`[server] Running on port ${PORT}`));
    startWorker();
  })
  .catch((err) => {
    console.error('[server] MongoDB connection failed:', err.message);
    process.exit(1);
  });