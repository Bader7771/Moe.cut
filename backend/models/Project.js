import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 250,
    },
    category: {
      type: String,
      required: true,
    },
    client: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    image: {
      type: String, // Storing path or URL
      required: true,
    },
    video: {
      type: String,
      default: null,
    },
    url: {
      type: String,
      default: null,
    },
    alt: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
      default: '50% 50%',
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
