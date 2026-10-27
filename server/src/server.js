// Entry point: load .env, connect to MongoDB, then start listening.
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing. Check your server/.env file.');
    process.exit(1);
  }

  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`ShotList API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    console.error('Is the MongoDB server running? Is MONGODB_URI correct?');
    process.exit(1);
  }
}

start();
