// ── Types ──────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  oneLiner: string;
  description: string;
  myRole: string;
  techStack: string[];
  tags: string[];
  highlights: string[];
  repoUrl?: string;
  demoUrl?: string;
  evidenceIds: string[];
}

export interface EvidenceItem {
  id: string;
  title: string;
  type: "pdf" | "image" | "link";
  url?: string;
  notes: string;
  tags: string[];
  projectId?: string;
}

export interface Competence {
  id: string;
  title: string;
  description: string;
  icon: string;
  skills: string[];
}

export interface DeveloperProfile {
  name: string;
  title: string;
  shortBio: string;
  longBio: string;
  strengths: string[];
  learningGoals: string[];
  technologiesSummary: string;
  portfolioHowBuilt: string;
  links: {
    github?: string;
    linkedin?: string;
    email?: string;
    cvUrl?: string;
  };
}

// ── In-memory store ────────────────────────────────────
let projects: Project[] = [];
let evidence: EvidenceItem[] = [];

const developerProfile: DeveloperProfile = {
  name: "Cristian Mihail Măgureanu",
  title: "ICT Student – Software Engineering & AI",
  shortBio:
    "I'm Cristian, an ICT student with a strong interest in software engineering, AI, and full-stack development. I enjoy building complete solutions and learning new technologies quickly.",
  longBio:
    "I'm Cristian, an ICT student originally from Bucharest and currently studying in Eindhoven. I'm most motivated when I can work on challenging, real-world projects—from scientific data processing to interactive installations. So far I've worked on a tennis scoring app, a ride-sharing platform for festival visitors, a Euclid astrophysics data pipeline, a large LED-based GLOW installation, and an extension that improves how PDF annotations are handled in Portflow. I like to understand the full picture: requirements, constraints in time and budget, modular design, and how software fits into real users' lives.",
  strengths: [
    "Picking up new technologies and concepts quickly when a project needs them.",
    "Designing and implementing complete solutions instead of isolated exercises.",
    "Working within strict time and budget constraints without losing quality.",
    "Applying modular design and SOLID principles to keep codebases maintainable.",
    "Integrating into new teams and communicating clearly with stakeholders.",
  ],
  learningGoals: [
    "Deepen my backend experience with C#, ASP.NET Core, and modern architectural patterns.",
    "Grow from introductory to advanced frontend skills in React and full-stack web development.",
    "Explore more AI and data projects, especially around scientific data and image analysis.",
  ],
  technologiesSummary:
    "On the backend I work mainly with C#, ASP.NET Core, Entity Framework Core, and SQL. For frontend I have introductory experience with React. On the data side I use Python for basic machine learning and image analysis. I also care about modular design, SOLID principles, and working effectively with teams under real constraints.",
  portfolioHowBuilt:
    "I built this portfolio as a Next.js app that presents my projects, competences, and evidence in a structured way. The 'Ask my CV' chatbot reads from the same structured data and from my CV, so when I update my projects or skills the virtual version of me can answer in first person using those details.",
  links: {
    linkedin: "https://www.linkedin.com/in/magureanu-cristian",
    email: "cristianmihailmagureanu@gmail.com",
    cvUrl: "/CV.pdf",
  },
};

const competences: Competence[] = [
  {
    id: "backend",
    title: "Backend (C# / ASP.NET Core)",
    description:
      "Building backend services with C#, ASP.NET Core, Entity Framework Core, and SQL, with a focus on clean modular design and SOLID principles.",
    icon: "Server",
    skills: ["C#", "ASP.NET Core", "EF Core", "SQL", "SOLID"],
  },
  {
    id: "frontend",
    title: "Frontend (React – Introductory)",
    description:
      "Creating interactive user interfaces using React at an introductory level, with a growing focus on UX and responsiveness.",
    icon: "Monitor",
    skills: ["React (intro)"],
  },
  {
    id: "testing",
    title: "Testing",
    description:
      "Understanding the importance of testing, code quality, and clear structure in software projects.",
    icon: "TestTube",
    skills: ["Code quality", "Modular design", "SOLID"],
  },
  {
    id: "data-ml",
    title: "Data / ML",
    description:
      "Working with Python for basic machine learning, data pipelines, and image analysis, especially in scientific and astrophysics contexts.",
    icon: "Brain",
    skills: ["Python", "Image analysis", "Basic ML"],
  },
  {
    id: "collaboration",
    title: "Collaboration",
    description:
      "Integrating into new teams, handling real-world constraints in time and budget, and communicating clearly with supervisors and teammates.",
    icon: "Users",
    skills: ["Teamwork", "Communication", "Working under constraints"],
  },
];

// ── Seed data ──────────────────────────────────────────
const seedProjects: Project[] = [
  {
    id: "proj-1",
    name: "Tennis Match App",
    oneLiner: "A complete tennis scoring system with realistic rules and live scoring.",
    description:
      "The Tennis Match App is a scoring system that lets users track tennis matches with realistic rules, live scoring, and an interactive interface. It focuses on correctly modelling tennis scoring logic and making it easy to follow a match in real time.",
    myRole:
      "I implemented the scoring logic and user flows so that the app follows real tennis rules. I focused on keeping the design modular and easy to extend with new features.",
    techStack: ["C#", "ASP.NET Core", "EF Core", "SQL"],
    tags: ["Backend", "C#", "Full-stack"],
    highlights: [
      "Implements realistic tennis scoring, including sets and matches.",
      "Provides live updates for ongoing matches.",
      "Structured using modular design and SOLID principles.",
    ],
    evidenceIds: [],
  },
  {
    id: "proj-2",
    name: "Festival Go – Ride-sharing Platform",
    oneLiner: "A platform connecting festival visitors who need a ride with drivers offering seats.",
    description:
      "Festival Go is a ride-sharing platform that matches festival visitors needing a ride with drivers who have spare seats. The goal is to make it easier for people to get to events together, improve communication, and reduce friction around planning trips.",
    myRole:
      "I worked on the core features that allow users to offer and request rides, as well as the basic matching logic between drivers and passengers.",
    techStack: ["C#", "ASP.NET Core", "SQL", "React (intro)"],
    tags: ["Full-stack", "Collaboration"],
    highlights: [
      "Improves convenience and communication for festival visitors.",
      "Models real constraints like available seats and routes.",
      "Helped me practice combining backend services with a simple frontend.",
    ],
    evidenceIds: [],
  },
  {
    id: "proj-3",
    name: "Euclid Astrophysics Pipeline",
    oneLiner: "A research pipeline for cleaning and analysing ESA Euclid telescope images.",
    description:
      "The Euclid Astrophysics Pipeline is a research-oriented project that processes images from the ESA Euclid telescope. The focus is on data cleaning, gravitational lens detection, and clustering analysis on astrophysical data.",
    myRole:
      "I worked with Python to clean and analyse Euclid images, exploring gravitational lens detection and clustering techniques on real scientific data.",
    techStack: ["Python", "Image analysis", "Basic ML"],
    tags: ["Data", "Astrophysics", "AI/ML"],
    highlights: [
      "Processed real telescope images from the ESA Euclid mission.",
      "Explored gravitational lens detection techniques.",
      "Applied clustering analysis to astrophysical datasets.",
    ],
    evidenceIds: [],
  },
  {
    id: "proj-4",
    name: "GLOW25 – Echoes of Tomorrow",
    oneLiner: "A large LED-based interactive installation for the Eindhoven GLOW Festival.",
    description:
      "Echoes of Tomorrow is a large LED-based installation created for the Eindhoven GLOW Festival. The project explored lighting options, mechanical constraints, and overall system design under limited time and budget.",
    myRole:
      "I contributed to exploring lighting options, understanding mechanical constraints, and helping shape the system design so that the installation was feasible within the available time and budget.",
    techStack: ["Embedded / Lighting systems", "Team collaboration"],
    tags: ["Installation", "Collaboration", "System design"],
    highlights: [
      "Worked as part of a larger team on a public installation.",
      "Balanced technical ideas with mechanical and budget constraints.",
      "Gained experience working towards a fixed event deadline.",
    ],
    evidenceIds: [],
  },
  {
    id: "proj-5",
    name: "Portflow Modular PDF Extension",
    oneLiner: "An extension that improves how PDF annotations are handled in Portflow.",
    description:
      "The Portflow Modular PDF Extension improves how PDF annotations are handled and reviewed inside Portflow, making it easier to comment on documents and keep feedback organised.",
    myRole:
      "I helped extend the PDF handling so that annotations are easier to work with, focusing on making reviews and comments more structured.",
    techStack: ["C#", "ASP.NET Core", "PDF tooling"],
    tags: ["Backend", "Productivity"],
    highlights: [
      "Improved the workflow for reviewing and commenting on PDFs.",
      "Made annotations more structured and easier to navigate.",
    ],
    evidenceIds: [],
  },
];

const seedEvidence: EvidenceItem[] = [
  {
    id: "ev-cv",
    title: "Curriculum Vitae – Cristian Mihail Măgureanu",
    type: "pdf",
    url: "/CV.pdf",
    notes: "My up-to-date CV with profile, technical skills, project experience, education, and recommendation.",
    tags: ["CV", "Overview", "Profile"],
  },
];

// ── Store operations ───────────────────────────────────
export function getProjects(): Project[] {
  return [...projects];
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function addProject(project: Project): void {
  projects.push(project);
}

export function updateProject(id: string, data: Partial<Project>): void {
  const idx = projects.findIndex((p) => p.id === id);
  if (idx !== -1) {
    projects[idx] = { ...projects[idx], ...data };
  }
}

export function getEvidence(): EvidenceItem[] {
  return [...evidence];
}

export function getEvidenceById(id: string): EvidenceItem | undefined {
  return evidence.find((e) => e.id === id);
}

export function searchEvidence(query: string): EvidenceItem[] {
  const q = query.toLowerCase();
  return evidence.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.notes.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function addEvidence(item: EvidenceItem): void {
  evidence.push(item);
}

export function updateEvidence(id: string, data: Partial<EvidenceItem>): void {
  const idx = evidence.findIndex((e) => e.id === id);
  if (idx !== -1) {
    evidence[idx] = { ...evidence[idx], ...data };
  }
}

export function getCompetences(): Competence[] {
  return competences;
}

export function getDeveloperProfile(): DeveloperProfile {
  return developerProfile;
}

export function seedData(): void {
  projects = [...seedProjects];
  evidence = [...seedEvidence];
}

export function resetData(): void {
  projects = [];
  evidence = [];
}

// Auto-seed on first import
seedData();
