import mongoose from 'mongoose';
const collaboratorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  image: { type: String, required: true },
  followers: { type: String, required: true, trim: true, maxlength: 100 },
}, { timestamps: true });
export default mongoose.models.Collaborator || mongoose.model('Collaborator', collaboratorSchema);
