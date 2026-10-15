/**
 * Centralized content source of truth for Sijin Agasthi's 3D Open-World Portfolio.
 * Edit this file to modify any textual information, links, or section details.
 */

export const content = {
  profile: {
    name: "Sijin Agasthi",
    role: "Software Developer & AI Engineer",
    tagline: "Welcome to my world",
    location: "Kannur, Kerala",
    email: "sijinagsthi111@gmail.com",
    github: "https://github.com/sijinagsthi111-netizen",
    linkedin: "TODO_LINKEDIN_URL",
    education: {
      degree: "B.Tech",
      school: "Vimal Jyothi Engineering College",
    },
    bio: "Software Developer & AI Engineer building .NET applications, machine learning and generative AI solutions. B.Tech graduate from Vimal Jyothi Engineering College, based in Kannur, Kerala.",
  },

  skills: [
    { name: "Python", category: "Language", level: "Expert" },
    { name: "C#", category: "Language", level: "Advanced" },
    { name: ".NET", category: "Framework", level: "Advanced" },
    { name: "ASP.NET", category: "Framework", level: "Advanced" },
    { name: "Java", category: "Language", level: "Proficient" },
    { name: "C", category: "Language", level: "Proficient" },
    { name: "C++", category: "Language", level: "Proficient" },
    { name: "Power BI", category: "Data Viz", level: "Advanced" },
    { name: "Matplotlib", category: "Data Viz", level: "Proficient" },
    { name: "R", category: "Data Viz", level: "Proficient" },
    { name: "Raspberry Pi", category: "Hardware/IoT", level: "Hands-on" },
    { name: "Generative AI / LLMs", category: "AI & ML", level: "Advanced" },
  ],

  projects: [
    {
      id: "visionaid",
      title: "VisionAid",
      subtitle: "Personalized Voice Assistant for the Visually Impaired",
      description: "Smart glasses system using a Raspberry Pi and camera that delivers real-time voice assistance. Uses generative AI for multi-modal processing (real-time object detection and scene-to-text from a live camera feed) and a lightweight database to send enriched prompts to an LLM, turning personalised text responses into speech.",
      tags: ["Raspberry Pi", "Generative AI", "LLM", "Computer Vision", "Text-to-Speech"],
      metric: "Real-Time Scene-to-Speech",
      link: "https://github.com/sijinagsthi111-netizen",
    },
    {
      id: "drowsiness-detection",
      title: "Driver Drowsiness Monitoring & Detection",
      subtitle: "Machine Learning Based Safety Monitoring",
      description: "Drowsiness detection system using LSTM-KNN for face detection and Eye Aspect Ratio (EAR) analysis to identify eye closure, with an alarm trigger on fatigue detection for real-time driver safety monitoring.",
      tags: ["Python", "LSTM-KNN", "Eye Aspect Ratio (EAR)", "Safety Alarm", "ML"],
      metric: "81.5% Detection Accuracy",
      link: "https://github.com/sijinagsthi111-netizen",
    },
  ],

  timeline: [
    {
      year: "2023",
      title: "Foundations & Robotics",
      items: [
        "Data analytics with Python and R programming",
        "CUSAT Humanoid Robotics workshop",
        "IIT Delhi Cyber Security & Ethical Hacking workshop",
      ],
    },
    {
      year: "2024",
      title: "Business Intelligence",
      items: [
        "Power BI certification (data visualization, data modeling, Power Query)",
      ],
    },
    {
      year: "2025",
      title: "Advanced Data Science",
      items: [
        "Python for Data Science (IIT Madras NPTEL)",
      ],
    },
    {
      year: "2026",
      title: "Industry & Engineering",
      items: [
        "Software Developer & AI Engineer at Distinct Infotech Solutions (Aug 2026 – Present)",
        "Freelance Software Tester at AI Fire Lab (Bug finding, QA, pre-release testing)",
      ],
    },
  ],

  contact: {
    heading: "Let's Connect",
    subheading: "Contact Hub in the Open World",
    email: "sijinagsthi111@gmail.com",
    github: "https://github.com/sijinagsthi111-netizen",
    linkedin: "TODO_LINKEDIN_URL",
    note: "Feel free to reach out for software engineering, .NET applications, or generative AI projects.",
  },

  finalRoom: {
    title: "Thank You for Visiting",
    subtitle: "Walk through the glowing portal door to loop back to the start of the sunset world.",
    quote: "Building intelligent, scalable software and real-world AI solutions.",
  },
};
