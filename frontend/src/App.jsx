import React, { useState, useEffect, useRef } from 'react';
import { 
  Code, Server, Database, Cpu, Wrench, Plus, Trash, Edit, Mail, 
  ExternalLink, Lock, Unlock, Terminal, Check, AlertCircle, 
  X, Layers, GitBranch, FileText, Send, Inbox, Calendar, Globe, MapPin, Phone
} from 'lucide-react';
import './App.css';

const API_URL = 'http://localhost:5000/api';

// Custom Brand Icon SVGs as Lucide brand icons are removed in newer v1.x versions
const Github = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const iconMap = {
  Code: Code,
  Server: Server,
  Database: Database,
  Cpu: Cpu,
  Layers: Layers,
  GitBranch: GitBranch,
  Terminal: Terminal
};

function App() {
  // Core States
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('connecting');
  const [adminMode, setAdminMode] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [toasts, setToasts] = useState([]);

  // Filter/Search States
  const [projectFilter, setProjectFilter] = useState('All');
  const [projectSearch, setProjectSearch] = useState('');
  const [skillCategory, setSkillCategory] = useState('Frontend');

  // Modals & Forms State
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    technologies: '',
    githubLink: '',
    liveLink: '',
    category: 'Full Stack',
    image: '',
    featured: false
  });

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'Frontend',
    proficiency: 80,
    iconName: 'Code'
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sendingContact, setSendingContact] = useState(false);

  // Typewriter effect
  const [typewriterText, setTypewriterText] = useState('');
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const phrases = ["Full-Stack Developer", "CSE Undergrad", "MERN Stack Specialist"];
  const typingSpeed = isDeleting ? 40 : 100;

  // Track scroll position for header styling
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Simple active link detection
      const sections = ['home', 'about', 'skills', 'projects', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Typewriter effect logic
  useEffect(() => {
    let timer;
    const currentPhrase = phrases[typewriterIndex % phrases.length];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setTypewriterText(currentPhrase.substring(0, typewriterText.length - 1));
      }, typingSpeed);
    } else {
      timer = setTimeout(() => {
        setTypewriterText(currentPhrase.substring(0, typewriterText.length + 1));
      }, typingSpeed);
    }

    if (!isDeleting && typewriterText === currentPhrase) {
      timer = setTimeout(() => setIsDeleting(true), 1500); // Wait before deleting
    } else if (isDeleting && typewriterText === '') {
      setIsDeleting(false);
      setTypewriterIndex(prev => prev + 1);
    }

    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, typewriterIndex]);

  // Load Initial Data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await checkStatus();
      await fetchProjects();
      await fetchSkills();
      setLoading(false);
    };
    initializeData();
  }, []);

  // Monitor Admin Mode changes to fetch Inbox
  useEffect(() => {
    if (adminMode) {
      fetchMessages();
      addToast('success', 'Admin mode enabled: CRUD permissions granted.');
    }
  }, [adminMode]);

  // Toast Helper
  const addToast = (type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // API Call Helpers
  const checkStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/status`);
      const data = await res.json();
      if (data.status === 'online') {
        setApiStatus(data.database === 'mongodb' ? 'online_mongo' : 'online_fallback');
      } else {
        setApiStatus('offline');
      }
    } catch (err) {
      setApiStatus('offline');
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      addToast('error', 'Could not fetch projects from backend API.');
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await fetch(`${API_URL}/skills`);
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    } catch (err) {
      addToast('error', 'Could not fetch skills from backend API.');
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      addToast('error', 'Could not fetch inbox messages.');
    }
  };

  // Create or Update Project
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const parsedTech = projectForm.technologies
        .split(',')
        .map(t => t.trim())
        .filter(t => t !== '');

      const payload = {
        ...projectForm,
        technologies: parsedTech
      };

      let res;
      if (isEditingProject) {
        res = await fetch(`${API_URL}/projects/${editingProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        addToast('success', isEditingProject ? 'Project updated successfully.' : 'Project created successfully.');
        setIsProjectModalOpen(false);
        resetProjectForm();
        fetchProjects();
      } else {
        const err = await res.json();
        addToast('error', `Failed: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      addToast('error', 'Connection error saving project.');
    }
  };

  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      description: '',
      technologies: '',
      githubLink: '',
      liveLink: '',
      category: 'Full Stack',
      image: '',
      featured: false
    });
    setIsEditingProject(false);
    setEditingProjectId(null);
  };

  const openEditProject = (proj, e) => {
    e.stopPropagation();
    setProjectForm({
      title: proj.title,
      description: proj.description,
      technologies: proj.technologies.join(', '),
      githubLink: proj.githubLink || '',
      liveLink: proj.liveLink || '',
      category: proj.category || 'Full Stack',
      image: proj.image || '',
      featured: proj.featured || false
    });
    setEditingProjectId(proj.id || proj._id);
    setIsEditingProject(true);
    setIsProjectModalOpen(true);
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        addToast('success', 'Project deleted successfully.');
        fetchProjects();
      } else {
        addToast('error', 'Failed to delete project.');
      }
    } catch (err) {
      addToast('error', 'Connection error deleting project.');
    }
  };

  // Add Skill
  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillForm)
      });
      if (res.ok) {
        addToast('success', 'Skill added successfully.');
        setIsSkillModalOpen(false);
        setSkillForm({ name: '', category: 'Frontend', proficiency: 80, iconName: 'Code' });
        fetchSkills();
      } else {
        const err = await res.json();
        addToast('error', `Failed: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      addToast('error', 'Connection error adding skill.');
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm("Delete this skill?")) return;
    try {
      const res = await fetch(`${API_URL}/skills/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        addToast('success', 'Skill deleted successfully.');
        fetchSkills();
      } else {
        addToast('error', 'Failed to delete skill.');
      }
    } catch (err) {
      addToast('error', 'Connection error deleting skill.');
    }
  };

  // Contact Form Submit
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      addToast('error', 'Please fill in all required fields.');
      return;
    }
    setSendingContact(true);
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      if (res.ok) {
        addToast('success', 'Thank you! Your message was sent successfully.');
        setContactForm({ name: '', email: '', subject: '', message: '' });
        if (adminMode) fetchMessages(); // reload admin inbox
      } else {
        addToast('error', 'Failed to send message. Try again later.');
      }
    } catch (err) {
      addToast('error', 'Network error. Please check your connection.');
    } finally {
      setSendingContact(false);
    }
  };

  // Delete Contact Message
  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Delete this inbox message?")) return;
    try {
      const res = await fetch(`${API_URL}/messages/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        addToast('success', 'Message deleted from inbox.');
        fetchMessages();
      } else {
        addToast('error', 'Failed to delete message.');
      }
    } catch (err) {
      addToast('error', 'Connection error deleting message.');
    }
  };

  // Filter project calculations
  const filteredProjects = projects.filter(p => {
    const matchesCategory = projectFilter === 'All' || p.category === projectFilter;
    const matchesSearch = p.title.toLowerCase().includes(projectSearch.toLowerCase()) || 
                          p.description.toLowerCase().includes(projectSearch.toLowerCase()) ||
                          p.technologies.some(t => t.toLowerCase().includes(projectSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const skillsByCategory = skills.filter(s => s.category === skillCategory);

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast glass ${t.type}`}>
            {t.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Navigation Header */}
      <header className={scrolled ? 'glass-nav shadow-lg' : 'glass-nav'}>
        <div className="header-container">
          <a href="#home" className="logo cyan-glow-text">
            MOHAN<span>.KRISHNA</span>
          </a>

          <nav>
            <ul className="nav-links">
              <li><a href="#home" className={activeSection === 'home' ? 'active' : ''}>Home</a></li>
              <li><a href="#about" className={activeSection === 'about' ? 'active' : ''}>About</a></li>
              <li><a href="#skills" className={activeSection === 'skills' ? 'active' : ''}>Skills</a></li>
              <li><a href="#projects" className={activeSection === 'projects' ? 'active' : ''}>Projects</a></li>
              <li><a href="#contact" className={activeSection === 'contact' ? 'active' : ''}>Contact</a></li>
            </ul>
          </nav>

          <div className="header-actions">
            {/* Live API Status */}
            <div className="status-badge glass">
              <span className={`pulse-led ${apiStatus === 'online_fallback' ? 'fallback' : ''}`} />
              <span style={{ color: 'var(--text-muted)' }}>
                {apiStatus === 'online_mongo' && 'API: Live (Mongo)'}
                {apiStatus === 'online_fallback' && 'API: Live (JSON)'}
                {apiStatus === 'offline' && 'API: Offline'}
                {apiStatus === 'connecting' && 'API: Connecting...'}
              </span>
            </div>

            {/* Admin Toggle */}
            <button 
              className={`admin-toggle ${adminMode ? 'active' : 'inactive'}`}
              onClick={() => setAdminMode(prev => !prev)}
            >
              {adminMode ? <Unlock size={14} /> : <Lock size={14} />}
              <span>{adminMode ? 'Admin Active' : 'Admin Lock'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-content">
          <h3>Welcome to my Sandbox</h3>
          <h1>Kola Mohan Krishna</h1>
          <div className="typewriter">
            <span>&gt; {typewriterText}</span>
            <span style={{ animation: 'pulse-cyan 1s infinite' }}>|</span>
          </div>
          <p className="hero-desc">
            A CSE student dedicated to building highly-performant web projects, integrating backend logic, radar monitoring systems, and dynamic databases. Let's create something functional.
          </p>

          <div className="hero-actions">
            <a href="#projects" className="btn-cyber-solid">View Projects</a>
            <a href="#contact" className="btn-cyber">Let's Connect</a>
          </div>

          <div className="social-links">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="social-btn"><Github size={20} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-btn"><Linkedin size={20} /></a>
            <a href="#contact" className="social-btn"><Mail size={20} /></a>
          </div>
        </div>

        <div className="hero-graphic-container">
          <div className="hero-hex-grid">
            <div className="hero-avatar-box">
              <Cpu />
            </div>
            {/* Animated Orbiting Nodes */}
            <div className="hero-orbit-node node-1"><Code size={20} /></div>
            <div className="hero-orbit-node node-2"><Server size={20} /></div>
            <div className="hero-orbit-node node-3"><Database size={20} /></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about">
        <h2 className="section-title gradient-text cyan-glow-text">About Me</h2>
        <p className="section-subtitle">A brief overview of my credentials, educational track, and focus.</p>

        <div className="about-grid">
          <div className="about-card glass">
            <h3><Code size={20} /> Candidate Profile</h3>
            <p style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>
              I am a Computer Science & Engineering undergrad specialized in full-stack web applications. I enjoy creating seamless interactions on the frontend, combined with secure, structured backend APIs and database schemas.
            </p>
            <p style={{ color: 'var(--text-muted)' }}>
              With an active interest in microservices, sensor integrations (like my Arduino security radar setup), and cloud deployments, I approach projects from a systems perspective, ensuring durability and code cleanlines.
            </p>
          </div>

          <div className="about-card glass">
            <h3><Calendar size={20} /> Education & Timeline</h3>
            <div className="about-timeline">
              <div className="timeline-item">
                <div className="timeline-date">2026 - Present</div>
                <div className="timeline-title">App Development Intern</div>
                <div className="timeline-sub">Thiranex Development</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Working on core full-stack initiatives, integrating databases (MongoDB, PostgreSQL) and deploying live instances.</p>
              </div>

              <div className="timeline-item">
                <div className="timeline-date">2023 - Present</div>
                <div className="timeline-title">B.Tech - Computer Science & Engineering</div>
                <div className="timeline-sub">CSE Department</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Focusing on Algorithm Design, Database Systems, Computer Networks, and Full-Stack Project Architectures.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills">
        <h2 className="section-title gradient-text cyan-glow-text">Tech Stack</h2>
        <p className="section-subtitle">Proficiencies and core technologies categorized by domain.</p>

        {/* Skill Category Tabs */}
        <div className="skills-tabs">
          {['Frontend', 'Backend', 'Database', 'Tools'].map(cat => (
            <button 
              key={cat} 
              className={`tab-btn ${skillCategory === cat ? 'active' : ''}`}
              onClick={() => setSkillCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="skills-grid">
          {skillsByCategory.map(s => {
            const IconComp = iconMap[s.iconName] || Code;
            return (
              <div key={s.id || s._id} className="skill-card glass">
                {adminMode && (
                  <div 
                    className="skill-delete-btn" 
                    onClick={() => handleDeleteSkill(s.id || s._id)}
                    title="Delete Skill"
                  >
                    <Trash size={16} />
                  </div>
                )}
                <div className="skill-header">
                  <div className="skill-info">
                    <span className="skill-icon"><IconComp size={20} /></span>
                    <span className="skill-name">{s.name}</span>
                  </div>
                  <span className="skill-value">{s.proficiency}%</span>
                </div>
                <div className="skill-bar-bg">
                  <div className="skill-bar-fill" style={{ width: `${s.proficiency}%` }} />
                </div>
              </div>
            );
          })}

          {adminMode && (
            <div className="add-skill-card" onClick={() => setIsSkillModalOpen(true)}>
              <Plus size={24} />
              <span>Add New Skill</span>
            </div>
          )}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects">
        <h2 className="section-title gradient-text cyan-glow-text">Portfolio Projects</h2>
        <p className="section-subtitle">A collection of full-stack, frontend, and systems projects connected to a live database.</p>

        {/* Search & Filter Bar */}
        <div className="projects-filter-bar">
          <div className="projects-pills">
            {['All', 'Full Stack', 'Frontend', 'Backend'].map(p => (
              <button 
                key={p} 
                className={`pill-btn ${projectFilter === p ? 'active' : ''}`}
                onClick={() => setProjectFilter(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="Search tech or titles..." 
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="glass"
            />
            <Code size={18} className="search-icon" />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {filteredProjects.map(proj => (
            <div 
              key={proj.id || proj._id} 
              className="project-card glass"
              onClick={() => setSelectedProject(proj)}
              style={{ cursor: 'pointer' }}
            >
              <div className="project-image-box">
                <img src={proj.image} alt={proj.title} />
                <span className="project-category">{proj.category}</span>
                
                {adminMode && (
                  <div className="project-admin-actions">
                    <div 
                      className="project-admin-btn edit" 
                      onClick={(e) => openEditProject(proj, e)}
                      title="Edit Project"
                    >
                      <Edit size={14} />
                    </div>
                    <div 
                      className="project-admin-btn delete" 
                      onClick={(e) => handleDeleteProject(proj.id || proj._id, e)}
                      title="Delete Project"
                    >
                      <Trash size={14} />
                    </div>
                  </div>
                )}
              </div>

              <div className="project-body">
                <h3 className="project-title">{proj.title}</h3>
                <p className="project-desc">{proj.description}</p>
                <div className="project-tech">
                  {proj.technologies.map(t => (
                    <span key={t} className="tech-tag">{t}</span>
                  ))}
                </div>

                <div className="project-links" onClick={(e) => e.stopPropagation()}>
                  {proj.githubLink && (
                    <a href={proj.githubLink} target="_blank" rel="noreferrer" className="project-link">
                      <Github size={14} /> GitHub
                    </a>
                  )}
                  {proj.liveLink && (
                    <a href={proj.liveLink} target="_blank" rel="noreferrer" className="project-link">
                      <ExternalLink size={14} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {adminMode && (
            <div 
              className="add-project-card" 
              onClick={() => {
                resetProjectForm();
                setIsProjectModalOpen(true);
              }}
            >
              <Plus size={32} />
              <h3 style={{ fontSize: '1.1rem' }}>Add New Project</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Publish to live database</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact">
        <h2 className="section-title gradient-text cyan-glow-text">Get In Touch</h2>
        <p className="section-subtitle">Reach out for collaborations, project review, or inquiries.</p>

        <div className="contact-container">
          <div className="contact-info-card glass">
            <div>
              <h3 style={{ marginBottom: '24px', color: 'var(--accent-cyan)' }}>Contact Details</h3>
              
              <div className="contact-info-item">
                <div className="contact-info-icon"><Mail size={18} /></div>
                <div className="contact-info-text">
                  <h4>Email Address</h4>
                  <p>k.mohan.krishna@example.com</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon"><Globe size={18} /></div>
                <div className="contact-info-text">
                  <h4>Location</h4>
                  <p>Andhra Pradesh, India</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon"><Cpu size={18} /></div>
                <div className="contact-info-text">
                  <h4>Specialization</h4>
                  <p>MERN Full Stack, IoT-Integrations</p>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              &gt; Status: Accepting Internship projects & full-stack roles.
            </div>
          </div>

          <div className="contact-form-card glass">
            <h3>Send Message</h3>
            <form onSubmit={handleContactSubmit}>
              <div className="grid-cols-2" style={{ marginBottom: '20px' }}>
                <div className="form-group">
                  <label htmlFor="form-name">Name *</label>
                  <input 
                    id="form-name"
                    type="text" 
                    placeholder="Your name" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="form-email">Email Address *</label>
                  <input 
                    id="form-email"
                    type="email" 
                    placeholder="name@email.com" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="form-subject">Subject</label>
                <input 
                  id="form-subject"
                  type="text" 
                  placeholder="What is this about?" 
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="form-message">Message *</label>
                <textarea 
                  id="form-message"
                  rows="4" 
                  placeholder="Your message details..." 
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-cyber-solid" 
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={sendingContact}
              >
                {sendingContact ? 'Transmitting Message...' : <><Send size={16} /> Send Encryption Message</>}
              </button>
            </form>
          </div>
        </div>

        {/* Visitor Messages Admin Inbox (Visible to Admin only) */}
        {adminMode && (
          <div className="admin-inbox-section">
            <h3 style={{ fontSize: '1.6rem', marginBottom: '20px', color: 'var(--accent-indigo)', display: 'flex', alignPosition: 'center', gap: '10px' }}>
              <Inbox /> Visitor Inbox ({messages.length})
            </h3>
            
            {messages.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Inbox is clean. No messages received yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map(msg => (
                  <div key={msg.id || msg._id} className="message-card glass">
                    <div className="message-header">
                      <div>
                        <span className="message-sender">{msg.name}</span>{' '}
                        <span className="message-email">&lt;{msg.email}&gt;</span>
                      </div>
                      <span className="message-date">{new Date(msg.date).toLocaleString()}</span>
                    </div>
                    <div className="message-subject">Subject: {msg.subject}</div>
                    <div className="message-text">{msg.message}</div>
                    
                    <button 
                      className="message-delete-btn"
                      onClick={() => handleDeleteMessage(msg.id || msg._id)}
                    >
                      <Trash size={12} /> Delete Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer>
        <p>&copy; {new Date().getFullYear()} Kola Mohan Krishna. All rights reserved. Created for Thiranex Internship Evaluation.</p>
        <p style={{ fontSize: '0.75rem', marginTop: '6px', color: 'var(--text-muted)' }}>MERN Stack App &bull; Secure API Backend &bull; DB Fallback Matrix</p>
      </footer>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProject(null)}><X size={18} /></button>
            <div style={{ maxHeight: '250px', overflow: 'hidden', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <img src={selectedProject.image} alt={selectedProject.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span className="project-category" style={{ position: 'static', display: 'inline-block', marginBottom: '12px' }}>{selectedProject.category}</span>
            <h3 className="modal-title">{selectedProject.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.6' }}>{selectedProject.description}</p>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Technologies Used:</h4>
              <div className="project-tech">
                {selectedProject.technologies.map(t => (
                  <span key={t} className="tech-tag" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>{t}</span>
                ))}
              </div>
            </div>

            <div className="project-links" style={{ paddingHeight: '20px' }}>
              {selectedProject.githubLink && (
                <a href={selectedProject.githubLink} target="_blank" rel="noreferrer" className="btn-cyber">
                  <Github size={14} /> Repository
                </a>
              )}
              {selectedProject.liveLink && (
                <a href={selectedProject.liveLink} target="_blank" rel="noreferrer" className="btn-cyber-solid">
                  <ExternalLink size={14} /> Live Site
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Project Modal */}
      {isProjectModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <button 
              className="modal-close-btn" 
              onClick={() => {
                setIsProjectModalOpen(false);
                resetProjectForm();
              }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', color: 'var(--accent-cyan)' }}>
              {isEditingProject ? 'Edit Project Schema' : 'Create New Project'}
            </h3>
            
            <form onSubmit={handleProjectSubmit}>
              <div className="form-group">
                <label>Project Title *</label>
                <input 
                  type="text" 
                  value={projectForm.title}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  rows="3"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Technologies (Comma separated) *</label>
                <input 
                  type="text" 
                  placeholder="React, Express, Node, MongoDB"
                  value={projectForm.technologies}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, technologies: e.target.value }))}
                  required 
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label>GitHub Repository URL</label>
                  <input 
                    type="url" 
                    value={projectForm.githubLink}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, githubLink: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Live Demo URL</label>
                  <input 
                    type="url" 
                    value={projectForm.liveLink}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, liveLink: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={projectForm.category}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Full Stack">Full Stack</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Systems / IoT">Systems / IoT</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cover Image URL</label>
                  <input 
                    type="text" 
                    placeholder="https://images.unsplash.com/..."
                    value={projectForm.image}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  id="featured-check"
                  type="checkbox" 
                  checked={projectForm.featured}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, featured: e.target.checked }))}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="featured-check" style={{ marginBottom: 0 }}>Highlight as Featured Project</label>
              </div>

              <button 
                type="submit" 
                className="btn-cyber-solid" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              >
                {isEditingProject ? 'Commit Edit Changes' : 'Publish Project to Database'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add Skill Modal */}
      {isSkillModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <button className="modal-close-btn" onClick={() => setIsSkillModalOpen(false)}><X size={18} /></button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', color: 'var(--accent-cyan)' }}>Add Skill Node</h3>
            
            <form onSubmit={handleSkillSubmit}>
              <div className="form-group">
                <label>Skill Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Docker, Python, Next.js"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={skillForm.category}
                    onChange={(e) => setSkillForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="Tools">Tools</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Display Icon</label>
                  <select 
                    value={skillForm.iconName}
                    onChange={(e) => setSkillForm(prev => ({ ...prev, iconName: e.target.value }))}
                  >
                    <option value="Code">Code</option>
                    <option value="Server">Server</option>
                    <option value="Database">Database</option>
                    <option value="Cpu">Processor</option>
                    <option value="Layers">Layers</option>
                    <option value="GitBranch">Git / VCS</option>
                    <option value="Terminal">Terminal</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ marginBottom: 0 }}>Proficiency Level</label>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{skillForm.proficiency}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={skillForm.proficiency}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, proficiency: Number(e.target.value) }))}
                />
              </div>

              <button 
                type="submit" 
                className="btn-cyber-solid" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              >
                Inject Skill Node
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
