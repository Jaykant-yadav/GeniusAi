import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn("MONGO_URI is not set. Skipping database connection.");
    return null;
  }

  try {
    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    return null;
  }
};

export default connectDB;