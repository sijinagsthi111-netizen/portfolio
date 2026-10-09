export interface Education {
  degree: string;
  school: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  bullets: string[];
  chips: string[];
}

export interface ProjectItem {
  title: string;
  subtitle: string;
  description: string;
  stack: string[];
  metric?: string;
  liveUrl?: string;
  codeUrl?: string;
  image?: string;
}

export interface CertificationItem {
  title: string;
  issuer: string;
  year: string;
  note?: string;
}

export interface ProfileData {
  brand: string;
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  photo: string;
  heroTagline: string;
  subTagline: string;
  about: string;
  education: Education;
  skills: {
    languages: string[];
    frameworks: string[];
    dataViz: string[];
    domains: string[];
  };
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
}

export const profile: ProfileData = {
  brand: "SIJIN",                       // navbar + footer wordmark, followed by a "."
  name: "Sijin Agasthi",
  role: "Software Developer & AI Engineer",
  location: "Kannur, Kerala",
  email: "sijinagsthi111@gmail.com",
  phone: "8593990351",
  linkedin: "https://linkedin.com/in/sijinagasthi",
  github: "https://github.com/sijinagsthi111-netizen",
  photo: "/images/profile-grayscale.jpg",   // placeholder, I will replace
  heroTagline: "Welcome to my portfolio, a space dedicated to building intelligent, scalable software and real-world AI solutions.",
  subTagline: "Explore projects featuring Python, .NET, machine learning and generative AI.",
  about: "Motivated and detail-oriented B.Tech graduate, Software Developer, and AI Engineer with hands-on experience building .NET applications, machine learning, and generative AI solutions. I bring strong problem-solving skills and a growth mindset to deliver real-world software and AI solutions.",
  education: {
    degree: "Bachelor of Technology (B.Tech)",
    school: "Vimal Jyothi Engineering College",
  },
  skills: {
    languages: ["Python", "C#", "Java", "C", "C++"],
    frameworks: [".NET", "ASP.NET"],
    dataViz: ["Power BI", "Matplotlib", "R Programming"],
    domains: [
      "Software Development",
      "Machine Learning",
      "Generative AI",
      "Data Analysis",
      "Software Testing"
    ],
  },
  experience: [
    {
      role: "Software Developer & AI Engineer",
      company: "Distinct Infotech Solutions",
      period: "Aug 2026 - Present",
      bullets: [
        "Building applications using .NET.",
        "Contributing to the design, development, and deployment of AI-driven solutions.",
      ],
      chips: [".NET", "AI Solutions", "Deployment"],
    },
    {
      role: "Software Tester (Freelance)",
      company: "AI Fire Lab",
      period: "Freelance",
      bullets: [
        "Performed software testing to identify bugs, verify functionality, and ensure product quality prior to release.",
      ],
      chips: ["Bug Finding", "QA", "Pre-release Testing"],
    },
  ],
  projects: [
    {
      title: "VisionAid",
      subtitle: "Personalized Voice Assistant for the Visually Impaired",
      description: "Smart glasses system using a Raspberry Pi and camera that delivers real-time voice assistance. Uses generative AI for multi-modal processing (real-time object detection and scene-to-text from a live camera feed) and a lightweight database to send enriched prompts to an LLM, turning personalised text responses into speech.",
      stack: ["Raspberry Pi", "Generative AI", "LLM", "Computer Vision", "Text-to-Speech"],
      liveUrl: "",
      codeUrl: "https://github.com/sijinagsthi111-netizen",
      image: "/images/visionaid.jpg",
    },
    {
      title: "Driver Drowsiness Detection",
      subtitle: "Machine Learning based safety monitoring",
      description: "Drowsiness detection system using LSTM-KNN for face detection and Eye Aspect Ratio (EAR) analysis to identify eye closure, with an alarm trigger on fatigue detection for real-time driver safety monitoring.",
      stack: ["Python", "LSTM", "KNN", "EAR Analysis"],
      metric: "81.5% detection accuracy",
      liveUrl: "",
      codeUrl: "https://github.com/sijinagsthi111-netizen",
      image: "/images/drowsiness.jpg",
    },
  ],
  certifications: [
    { title: "Python for Data Science", issuer: "IIT Madras (NPTEL)", year: "2025" },
    { title: "Power BI", issuer: "White Track Technologies", year: "2024", note: "Data visualization, data modelling, Power Query" },
    { title: "Data Analytics using R Programming", issuer: "", year: "2023", note: "Statistical analysis, data visualization, predictive modeling" },
    { title: "Humanoid Robotics Workshop", issuer: "CUSAT", year: "2023" },
    { title: "Cyber Security & Ethical Hacking Workshop", issuer: "IIT Delhi", year: "2023", note: "Network security and ethical hacking concepts" },
  ],
};
