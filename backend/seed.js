import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/Project.js';
import connectDB from './config/db.js';

dotenv.config();

// The static data adapted for MongoDB seeding
// Notice we changed `image` to a string path relative to the public folder
const projectsData = [
  { projectId: "01", title: "Afterimage", category: "Fashion Film", client: "Independent", year: "2026", image: "/projects/project-01.webp", video: null, url: null, alt: "A solitary pedestrian crossing beneath monumental concrete ramps", position: "50% 68%" },
  { projectId: "02", title: "Body Language", category: "Music Video", client: "Studio Archive", year: "2026", image: "/projects/project-02.webp", video: null, url: null, alt: "Motion-blurred profile of a seated fashion model", position: "50% 50%" },
  { projectId: "03", title: "Soft Focus", category: "Brand Story", client: "Studio Archive", year: "2026", image: "/projects/project-03.webp", video: null, url: null, alt: "Close-up portrait crossed by a narrow beam of dramatic light", position: "52% 50%" },
  { projectId: "04", title: "Cut / Repeat", category: "Campaign Film", client: "Independent", year: "2026", image: "/projects/project-04.webp", video: null, url: null, alt: "Illuminated ornate architecture framing a glass tower at night", position: "50% 84%" },
  { projectId: "05", title: "Between Frames", category: "Short Film", client: "Studio Archive", year: "2026", image: "/projects/project-05.webp", video: null, url: null, alt: "Distant human silhouettes walking through dense fog", position: "50% 69%" },
  { projectId: "06", title: "Memory Study", category: "Visual Study", client: "MO-CUT-MOTION", year: "2026", image: "/projects/project-06.webp", video: null, url: null, alt: "A ghostlike blurred hand suspended above a dark textured surface", position: "48% 52%" },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Project.deleteMany();
    console.log('Cleared existing projects from DB');

    // Insert data
    await Project.insertMany(projectsData);
    console.log('Successfully seeded database with original projects!');

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
