// Connects to MongoDB using the address stored in the MONGODB_URI environment variable.
const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Check your server/.env file.');
  }
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

module.exports = connectDB;
