import mongoose from 'mongoose';
let pending;
export default async function connectDB() {
  if (process.env.DATA_STORE === 'file' && !process.env.VERCEL) return;
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!pending) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is required for MongoDB storage.');
    mongoose.set('bufferCommands', false);
    pending = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5,
    }).finally(() => { pending = undefined; });
  }
  return pending;
}
