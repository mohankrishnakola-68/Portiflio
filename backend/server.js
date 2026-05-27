import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, db } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads

// Database Connection
connectDB(MONGODB_URI);

// Status API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    database: db.isFallback() ? 'local_json_fallback' : 'mongodb',
    timestamp: new Date()
  });
});

// PROJECTS API
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.getProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving projects', details: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { title, description, technologies, githubLink, liveLink, category, image, featured } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and Description are required' });
    }
    const newProject = await db.addProject({
      title,
      description,
      technologies: technologies || [],
      githubLink: githubLink || '',
      liveLink: liveLink || '',
      category: category || 'Full Stack',
      image: image || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=600&auto=format&fit=crop&q=80',
      featured: !!featured
    });
    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (err) {
    res.status(500).json({ error: 'Server error creating project', details: err.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProject = await db.updateProject(id, req.body);
    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project updated successfully', project: updatedProject });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating project', details: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteProject(id);
    if (!success) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting project', details: err.message });
  }
});

// SKILLS API
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await db.getSkills();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving skills', details: err.message });
  }
});

app.post('/api/skills', async (req, res) => {
  try {
    const { name, category, proficiency, iconName } = req.body;
    if (!name || !category || proficiency === undefined) {
      return res.status(400).json({ error: 'Name, Category, and Proficiency are required' });
    }
    const newSkill = await db.addSkill({
      name,
      category,
      proficiency: Number(proficiency),
      iconName: iconName || 'Code'
    });
    res.status(201).json({ message: 'Skill added successfully', skill: newSkill });
  } catch (err) {
    res.status(500).json({ error: 'Server error adding skill', details: err.message });
  }
});

app.delete('/api/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteSkill(id);
    if (!success) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    res.json({ message: 'Skill deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting skill', details: err.message });
  }
});

// CONTACT MESSAGE API
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, Email, and Message are required' });
    }
    const newMessage = await db.addMessage({
      name,
      email,
      subject: subject || 'General Inquiry',
      message
    });
    res.status(201).json({ message: 'Message sent successfully', contact: newMessage });
  } catch (err) {
    res.status(500).json({ error: 'Server error saving contact message', details: err.message });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await db.getMessages();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving messages', details: err.message });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteMessage(id);
    if (!success) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting message', details: err.message });
  }
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`Backend server running in Node.js ES Module mode.`);
    console.log(`API URL: http://localhost:${PORT}/api`);
    console.log(`Status Check: http://localhost:${PORT}/api/status`);
    console.log(`======================================================\n`);
  });
}

export default app;
