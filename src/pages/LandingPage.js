import React from "react";
import "../css/LandingPage.css";
import programmer from "../assets/images/programmer.svg";
import jsFramework from "../assets/images/jsFramework.svg";
import skill from "../assets/images/skill.svg";

function LandingPage() {
  const projects = [
    {
      title: "E-Commerce Platform",
      description: "A full-stack e-commerce solution with React and Node.js",
      image: jsFramework,
      tech: ["React", "Node.js", "MongoDB"]
    },
    {
      title: "Task Management App",
      description: "Collaborative task management with real-time updates",
      image: skill,
      tech: ["React", "Firebase", "Material-UI"]
    },
    {
      title: "Portfolio Website",
      description: "Modern and responsive portfolio website template",
      image: programmer,
      tech: ["React", "CSS3", "Animation"]
    }
  ];

  const skills = [
    { name: "Frontend Development", icon: "💻" },
    { name: "React.js", icon: "⚛️" },
    { name: "Node.js", icon: "🚀" },
    { name: "Database Design", icon: "🗄️" },
    { name: "UI/UX Design", icon: "🎨" },
    { name: "API Development", icon: "🔌" }
  ];

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="logo">
          <span className="logo-text">Showcase Project</span>
        </div>
        <ul className="nav-links">
          <li><a href="#projects">Projects</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <header className="header-landing">
        <div className="header-content">
          <h1>Creative Developer & Problem Solver</h1>
          <p>
            Transforming ideas into elegant, functional applications. 
            Specialized in building modern web applications with cutting-edge technologies.
          </p>
          <div className="cta-buttons">
            <a href="/userhome" className="primary-btn">View Projects</a>
            <a href="#contact" className="secondary-btn">Get in Touch</a>
          </div>
        </div>
        <div className="header-image">
          <img src={programmer} alt="Developer illustration" />
        </div>
      </header>

      <section id="projects" className="projects-section">
        <h2>Featured Projects</h2>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <div className="project-image">
                <img src={project.image} alt={project.title} />
              </div>
              <div className="project-content">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-tech">
                  {project.tech.map((tech, i) => (
                    <span key={i} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="skills" className="skills-section">
        <h2>Skills & Expertise</h2>
        <div className="skills-grid">
          {skills.map((skill, index) => (
            <div key={index} className="skill-card">
              <div className="skill-icon">{skill.icon}</div>
              <h3>{skill.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="contact-section">
        <h2>Let's Work Together</h2>
        <p>Have a project in mind? Let's create something amazing.</p>
        <a href="mailto:contact@example.com" className="primary-btn">Get in Touch</a>
      </section>
    </div>
  );
}

export default LandingPage;
