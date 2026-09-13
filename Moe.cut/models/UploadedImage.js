// Shared binary upload storage for project images and testimonial videos.
// Keep the existing collection name so deployed images remain accessible.
import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true },
}, { timestamps: true });
export default mongoose.models.UploadedImage || mongoose.model('UploadedImage', schema);
