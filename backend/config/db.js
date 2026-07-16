import mongoose from 'mongoose';

export let dbMode = 'mongodb';

export const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hive';
    console.log(`Connecting to MongoDB at ${connUri}...`);
    // Connect with a short timeout so we don't hang if MongoDB is not running
    await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 2000,
    });
    dbMode = 'mongodb';
    console.log('MongoDB Connected successfully.');
  } catch (error) {
    dbMode = 'json';
    console.warn('MongoDB connection failed. Falling back to JSON database mode for local development.');
  }
};
