import mongoose from 'mongoose';
const testimonialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  video: { type: String, required: true },
}, { timestamps: true });
export default mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema);
