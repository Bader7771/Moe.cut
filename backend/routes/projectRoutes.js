import express from 'express';
import multer from 'multer';
import path from 'path';
import Project from '../models/Project.js';
import { fallbackProjects } from '../data/projects.js';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// @route   GET /api/projects
// @desc    Get all projects
router.get('/', async (req, res) => {
  try {
    // Sort by projectId to maintain order from the original static file if needed
    const projects = await Project.find({}).sort({ projectId: 1 });
    res.json(projects);
  } catch (error) {
    res.set('X-Data-Source', 'fallback');
    res.json(fallbackProjects);
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project by ObjectId
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/projects
// @desc    Create a project
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const projectData = {
      ...req.body,
    };
    
    // Automatically generate a projectId if not provided
    if (!projectData.projectId) {
      projectData.projectId = `PROJ-${Date.now()}`;
    }

    if (req.file) {
      projectData.image = `/uploads/${req.file.filename}`;
    }

    const project = new Project(projectData);
    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (project) {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }
      
      Object.assign(project, updateData);
      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project) {
      await project.deleteOne();
      res.json({ message: 'Project removed' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
