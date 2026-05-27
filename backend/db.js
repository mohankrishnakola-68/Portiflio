import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.VERCEL ? '/tmp/data' : path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create DATA_DIR:', err);
  }
}

const fallbackFiles = {
  projects: path.join(DATA_DIR, 'projects.json'),
  skills: path.join(DATA_DIR, 'skills.json'),
  messages: path.join(DATA_DIR, 'messages.json'),
};

// Seed default data for fallbacks if they don't exist
const DEFAULT_PROJECTS = [
  {
    id: "1",
    title: "EcoSphere E-Commerce",
    description: "A full-featured sustainable online marketplace with real-time cart updates, secure checkout with Stripe, and an automated vendor panel.",
    technologies: ["React.js", "Node.js", "Express.js", "MongoDB", "Tailwind CSS"],
    githubLink: "https://github.com/example/ecosphere",
    liveLink: "https://ecosphere-marketplace.example.com",
    category: "Full Stack",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&auto=format&fit=crop&q=80",
    featured: true
  },
  {
    id: "2",
    title: "AI Canvas Creator",
    description: "An intuitive web application integrating OpenAI's DALL-E and Midjourney API for automated art generation, sharing, and custom printing integrations.",
    technologies: ["React.js", "Node.js", "Express.js", "MongoDB", "OpenAI API"],
    githubLink: "https://github.com/example/ai-canvas",
    liveLink: "https://ai-canvas.example.com",
    category: "Full Stack",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    featured: true
  },
  {
    id: "3",
    title: "CyberPulse SRM Dashboard",
    description: "A high-fidelity Security Radar and Monitoring dashboard featuring WebSockets, canvas-based radar sweeps, and live system diagnostic analytics.",
    technologies: ["React.js", "Chart.js", "WebSockets", "CSS Grid"],
    githubLink: "https://github.com/example/cyberpulse",
    liveLink: "https://cyberpulse-srm.example.com",
    category: "Frontend",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
    featured: false
  }
];

const DEFAULT_SKILLS = [
  { id: "1", name: "React.js", category: "Frontend", proficiency: 92, iconName: "Code" },
  { id: "2", name: "JavaScript (ES6+)", category: "Frontend", proficiency: 95, iconName: "Cpu" },
  { id: "3", name: "CSS / Grid / Flexbox", category: "Frontend", proficiency: 88, iconName: "Layers" },
  { id: "4", name: "Node.js", category: "Backend", proficiency: 85, iconName: "Terminal" },
  { id: "5", name: "Express.js", category: "Backend", proficiency: 87, iconName: "Server" },
  { id: "6", name: "MongoDB", category: "Database", proficiency: 80, iconName: "Database" },
  { id: "7", name: "PostgreSQL", category: "Database", proficiency: 75, iconName: "Database" },
  { id: "8", name: "Git & GitHub", category: "Tools", proficiency: 90, iconName: "GitBranch" },
  { id: "9", name: "Docker", category: "Tools", proficiency: 70, iconName: "Trello" }
];

const initializeFallbackFiles = () => {
  try {
    if (!fs.existsSync(fallbackFiles.projects)) {
      fs.writeFileSync(fallbackFiles.projects, JSON.stringify(DEFAULT_PROJECTS, null, 2));
    }
    if (!fs.existsSync(fallbackFiles.skills)) {
      fs.writeFileSync(fallbackFiles.skills, JSON.stringify(DEFAULT_SKILLS, null, 2));
    }
    if (!fs.existsSync(fallbackFiles.messages)) {
      fs.writeFileSync(fallbackFiles.messages, JSON.stringify([], null, 2));
    }
  } catch (err) {
    console.error('Failed to initialize fallback files:', err);
  }
};

try {
  initializeFallbackFiles();
} catch (err) {
  console.error('Failed running initializeFallbackFiles:', err);
}

let useLocalFallback = false;

// Define Schemas for Mongoose
const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [String],
  githubLink: String,
  liveLink: String,
  category: { type: String, default: 'Full Stack' },
  image: String,
  featured: { type: Boolean, default: false }
});

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  proficiency: { type: Number, min: 0, max: 100, required: true },
  iconName: { type: String, default: 'Code' }
});

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: String,
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const MongoProject = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
const MongoSkill = mongoose.models.Skill || mongoose.model('Skill', SkillSchema);
const MongoMessage = mongoose.models.Message || mongoose.model('Message', MessageSchema);

// Connect to MongoDB
export const connectDB = async (uri) => {
  try {
    // Set 2 seconds timeout to prevent long hangs if MongoDB service is not running
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('>>> Successfully connected to MongoDB database!');
    useLocalFallback = false;
  } catch (err) {
    console.warn('\n======================================================');
    console.warn('WARNING: Failed to connect to MongoDB database.');
    console.warn('Reason:', err.message);
    console.warn('System will fall back to using Local JSON Storage.');
    console.warn('Files will be saved in:', DATA_DIR);
    console.warn('======================================================\n');
    useLocalFallback = true;
  }
};

// Helper methods for Local JSON fallback
const readLocal = (fileKey) => {
  try {
    const data = fs.readFileSync(fallbackFiles[fileKey], 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading local fallback file ${fileKey}:`, err);
    return [];
  }
};

const writeLocal = (fileKey, data) => {
  try {
    fs.writeFileSync(fallbackFiles[fileKey], JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing local fallback file ${fileKey}:`, err);
    return false;
  }
};

// Unified DB CRUD methods
export const db = {
  isFallback: () => useLocalFallback,

  // PROJECTS CRUD
  getProjects: async () => {
    if (useLocalFallback) {
      return readLocal('projects');
    }
    return await MongoProject.find();
  },

  addProject: async (projectData) => {
    if (useLocalFallback) {
      const projects = readLocal('projects');
      const newProj = {
        id: Date.now().toString(),
        ...projectData
      };
      projects.push(newProj);
      writeLocal('projects', projects);
      return newProj;
    }
    const newProj = new MongoProject(projectData);
    return await newProj.save();
  },

  updateProject: async (id, projectData) => {
    if (useLocalFallback) {
      const projects = readLocal('projects');
      const idx = projects.findIndex(p => p.id === id);
      if (idx !== -1) {
        projects[idx] = { ...projects[idx], ...projectData };
        writeLocal('projects', projects);
        return projects[idx];
      }
      return null;
    }
    return await MongoProject.findByIdAndUpdate(id, projectData, { new: true });
  },

  deleteProject: async (id) => {
    if (useLocalFallback) {
      let projects = readLocal('projects');
      const beforeLength = projects.length;
      projects = projects.filter(p => p.id !== id);
      writeLocal('projects', projects);
      return projects.length < beforeLength;
    }
    const result = await MongoProject.findByIdAndDelete(id);
    return result !== null;
  },

  // SKILLS CRUD
  getSkills: async () => {
    if (useLocalFallback) {
      return readLocal('skills');
    }
    return await MongoSkill.find();
  },

  addSkill: async (skillData) => {
    if (useLocalFallback) {
      const skills = readLocal('skills');
      const newSkill = {
        id: Date.now().toString(),
        ...skillData
      };
      skills.push(newSkill);
      writeLocal('skills', skills);
      return newSkill;
    }
    const newSkill = new MongoSkill(skillData);
    return await newSkill.save();
  },

  deleteSkill: async (id) => {
    if (useLocalFallback) {
      let skills = readLocal('skills');
      const beforeLength = skills.length;
      skills = skills.filter(s => s.id !== id);
      writeLocal('skills', skills);
      return skills.length < beforeLength;
    }
    const result = await MongoSkill.findByIdAndDelete(id);
    return result !== null;
  },

  // MESSAGES CRUD
  getMessages: async () => {
    if (useLocalFallback) {
      return readLocal('messages');
    }
    return await MongoMessage.find().sort({ date: -1 });
  },

  addMessage: async (msgData) => {
    if (useLocalFallback) {
      const messages = readLocal('messages');
      const newMsg = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        ...msgData
      };
      messages.unshift(newMsg);
      writeLocal('messages', messages);
      return newMsg;
    }
    const newMsg = new MongoMessage(msgData);
    return await newMsg.save();
  },

  deleteMessage: async (id) => {
    if (useLocalFallback) {
      let messages = readLocal('messages');
      const beforeLength = messages.length;
      messages = messages.filter(m => m.id !== id);
      writeLocal('messages', messages);
      return messages.length < beforeLength;
    }
    const result = await MongoMessage.findByIdAndDelete(id);
    return result !== null;
  }
};
