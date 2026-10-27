// Builds the Express app (middleware + routes). server.js starts it.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const shotRoutes = require('./routes/shotRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet()); // adds safe HTTP headers

// CORS: only our React app may call the API, and it may send cookies ("credentials").
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' })); // reads JSON request bodies
app.use(cookieParser()); // reads cookies (we need the login cookie)

// Health check: open http://localhost:5000/api/health in the browser
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/shots', shotRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
