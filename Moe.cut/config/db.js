import mongoose from 'mongoose';
export default async function connectDB() {
  mongoose.set('bufferCommands', false);
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mo-cut-motion', { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB connected');
}
