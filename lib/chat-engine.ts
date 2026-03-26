import {
  getProjects,
  getEvidence,
  getCompetences,
  getDeveloperProfile,
} from "./data";

interface ChatResponse {
  answer: string;
  citations: { title: string; url?: string }[];
}

const INTERVIEW_QUESTIONS = [
  "Tell me about yourself and your background in software development.",
  "Can you walk me through a technically challenging project you've worked on?",
  "How do you approach system architecture and design decisions?",
  "Describe a time when you had to debug a complex production issue.",
  "How do you ensure code quality in your projects?",
  "Tell me about your experience with machine learning and data pipelines.",
  "How do you handle disagreements within a development team?",
  "What's your approach to learning new technologies?",
  "Describe how you would design a scalable real-time messaging system.",
  "Where do you see yourself in 3-5 years?",
];

export function getNextInterviewQuestion(questionIndex: number): string {
  return INTERVIEW_QUESTIONS[questionIndex % INTERVIEW_QUESTIONS.length];
}

export function scoreInterviewAnswer(answer: string): {
  clarity: number;
  technicalDepth: number;
  ownership: number;
  suggestedAnswer: string;
} {
  const wordCount = answer.split(/\s+/).length;
  const hasTechTerms = /(?:api|database|architecture|algorithm|deploy|test|pipeline|component|server|client)/i.test(answer);
  const hasFirstPerson = /\b(?:I|my|me)\b/i.test(answer);
  const hasSpecifics = /\b(?:reduced|improved|built|designed|implemented|led|created|increased)\b/i.test(answer);

  const clarity = Math.min(10, Math.max(3, Math.round(wordCount / 8 + (hasSpecifics ? 2 : 0))));
  const technicalDepth = Math.min(10, Math.max(3, Math.round(wordCount / 10 + (hasTechTerms ? 3 : 0))));
  const ownership = Math.min(10, Math.max(3, Math.round((hasFirstPerson ? 4 : 1) + (hasSpecifics ? 3 : 0) + wordCount / 15)));

  return {
    clarity,
    technicalDepth,
    ownership,
    suggestedAnswer:
      "A strong answer would include specific examples from your projects, quantifiable outcomes (e.g., 'reduced latency by 40%'), and a clear narrative showing your personal contribution and the technical decisions you made.",
  };
}

async function callLocalLlm(prompt: string): Promise<string | null> {
  if (!process.env.USE_LOCAL_LLM) return null;

  try {
    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.LOCAL_LLM_MODEL || "llama3.2",
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "You are a digital version of Cristian Mihail Măgureanu. Always answer in first person. Never say you are an AI or language model. Use only the provided context about Cristian's background, skills, and projects.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const content = data?.message?.content;
    if (typeof content === "string" && content.trim()) {
      return content.trim();
    }
    return null;
  } catch {
    return null;
  }
}

export async function generateChatResponse(
  message: string,
  mode: "normal" | "interview"
): Promise<ChatResponse> {
  const lowerMsg = message.toLowerCase();
  const projects = getProjects();
  const allEvidence = getEvidence();
  const competences = getCompetences();
  const profile = getDeveloperProfile();

  // Try local LLM first (if enabled); fall back to rule-based.
  if (mode === "normal" && process.env.USE_LOCAL_LLM) {
    const context = JSON.stringify(
      {
        profile,
        projects,
        competences,
        evidence: allEvidence.slice(0, 12),
      },
      null,
      2
    );

    const prompt =
      `Context:\n${context}\n\n` +
      "Use this context to answer as Cristian.\n\n" +
      `User question:\n${message}`;

    const llmAnswer = await callLocalLlm(prompt);
    if (llmAnswer) {
      return {
        answer: llmAnswer,
        citations: [],
      };
    }
  }

  // For now the interview mode just reuses the same knowledge but nudges toward reflective answers.
  if (mode === "interview") {
    return {
      answer:
        "In interview mode I focus on structured, reflective answers. Feel free to ask me to walk through a specific project, describe a challenge I faced, or explain how I design systems—I’ll answer in first person and connect it back to my real projects.",
      citations: projects.slice(0, 2).map((p) => ({ title: p.name, url: p.repoUrl })),
    };
  }

  // 30-second pitch
  if (lowerMsg.includes("pitch") || lowerMsg.includes("30s") || lowerMsg.includes("elevator") || lowerMsg.includes("introduce")) {
    return {
      answer:
        "Hey, I'm Cristian! " +
        profile.shortBio +
        " So far I’ve worked on a tennis scoring app, a ride-sharing platform for festival visitors, an Euclid astrophysics data pipeline, an LED-based GLOW installation, and a Portflow PDF extension. I like taking on challenging, real-world projects where I can learn quickly and deliver something complete.",
      citations: projects.map((p) => ({ title: p.name, url: p.demoUrl || p.repoUrl })),
    };
  }

  // Deep dive
  if (lowerMsg.includes("deep dive") || lowerMsg.includes("detail") || lowerMsg.includes("more about") || lowerMsg.includes("experience")) {
    return {
      answer:
        "Sure! " +
        profile.longBio +
        " Across these projects I’ve strengthened my backend skills in C# and ASP.NET Core, my introductory React experience, and my ability to work with Python for data and image analysis. I also learned a lot about working under real deadlines and constraints, especially on the GLOW installation.",
      citations: [
        ...competences.map((c) => ({ title: `Competence: ${c.title}` })),
        ...projects.slice(0, 2).map((p) => ({ title: p.name, url: p.repoUrl })),
      ],
    };
  }

  // Direct questions about projects
  if (lowerMsg.includes("what projects") || lowerMsg.includes("which projects") || lowerMsg.includes("projects have you worked on")) {
    const summaryLines = projects.map(
      (p) => `- ${p.name}: ${p.oneLiner}`
    );
    return {
      answer:
        "I've worked on several portfolio projects that show different sides of how I build software:\n\n" +
        summaryLines.join("\n") +
        "\n\nOn the Projects page you can dive into my role, architecture decisions, and evidence for each one.",
      citations: projects.map((p) => ({ title: p.name, url: p.repoUrl })),
    };
  }

  // Show evidence
  if (lowerMsg.includes("evidence") || lowerMsg.includes("proof") || lowerMsg.includes("portfolio") || lowerMsg.includes("show me")) {
    const evidenceList = allEvidence
      .slice(0, 5)
      .map((e) => `- ${e.title} (${e.type}): ${e.notes}`)
      .join("\n");
    return {
      answer: `Here's a selection of evidence from my portfolio:\n\n${evidenceList}\n\nI have ${allEvidence.length} evidence items in total, covering architecture diagrams, audit reports, user research, and technical write-ups. You can browse all of them in the Evidence section.`,
      citations: allEvidence.slice(0, 5).map((e) => ({ title: e.title, url: e.url })),
    };
  }

  // Project-specific
  for (const project of projects) {
    if (lowerMsg.includes(project.name.toLowerCase())) {
      const projectEvidence = allEvidence.filter((e) => project.evidenceIds.includes(e.id));
      return {
        answer: `${project.name} is one of my favorite projects! ${project.description}\n\nMy role: ${project.myRole}\n\nKey highlights:\n${project.highlights.map((h) => `- ${h}`).join("\n")}`,
        citations: [
          { title: project.name, url: project.repoUrl },
          ...projectEvidence.map((e) => ({ title: e.title, url: e.url })),
        ],
      };
    }
  }

  // Competence-specific
  for (const comp of competences) {
    if (lowerMsg.includes(comp.title.toLowerCase()) || comp.skills.some((s) => lowerMsg.includes(s.toLowerCase()))) {
      const relatedEvidence = allEvidence.filter((e) => e.tags.some((t) => t.toLowerCase().includes(comp.title.toLowerCase())));
      return {
        answer: `${comp.description} My key skills in this area include ${comp.skills.join(", ")}. I've applied these across multiple projects in my portfolio.`,
        citations: relatedEvidence.map((e) => ({ title: e.title, url: e.url })),
      };
    }
  }

  // Tech stack questions
  if (lowerMsg.includes("tech") || lowerMsg.includes("stack") || lowerMsg.includes("language") || lowerMsg.includes("tool")) {
    const allTech = [...new Set(projects.flatMap((p) => p.techStack))];
    return {
      answer:
        "I work with a focused but growing tech stack. " +
        profile.technologiesSummary +
        ` In this portfolio, you’ll mainly see: ${allTech.join(", ")}.`,
      citations: projects.map((p) => ({ title: `${p.name}: ${p.techStack.join(", ")}` })),
    };
  }

  // Strengths
  if (lowerMsg.includes("strength") || lowerMsg.includes("strong at") || lowerMsg.includes("what are you good at")) {
    return {
      answer:
        "My main strengths as a developer are:\n\n" +
        profile.strengths.map((s) => `- ${s}`).join("\n") +
        "\n\nYou can see these play out in my projects—for example, SmartSched shows system design and ML skills, DevPulse highlights frontend and data visualization, and SecureChat focuses on security and architecture.",
      citations: projects.map((p) => ({ title: p.name, url: p.repoUrl })),
    };
  }

  // Learning goals
  if (lowerMsg.includes("learning goal") || lowerMsg.includes("learn next") || lowerMsg.includes("see yourself") || lowerMsg.includes("3-5 years")) {
    return {
      answer:
        "In terms of learning goals and where I see myself in the next few years, I'm focusing on:\n\n" +
        profile.learningGoals.map((g) => `- ${g}`).join("\n") +
        "\n\nI’m looking for environments where I can keep growing in these directions while still shipping real features and taking ownership.",
      citations: [],
    };
  }

  // How the portfolio itself was built
  if (lowerMsg.includes("build your portfolio") || lowerMsg.includes("how did you build your portfolio") || lowerMsg.includes("this website")) {
    return {
      answer: profile.portfolioHowBuilt,
      citations: [],
    };
  }

  // Default
  return {
    answer:
      "Thanks for the question! I'm Cristian, an ICT student interested in software engineering, AI, and full-stack development. I’ve worked on projects like a tennis scoring app, a festival ride-sharing platform, an Euclid astrophysics pipeline, a GLOW installation, and a Portflow PDF extension. Feel free to ask me about my projects, competences, strengths, or learning goals—or about details from my CV.",
    citations: [
      { title: "SmartSched", url: projects[0]?.repoUrl },
      { title: "DevPulse", url: projects[1]?.repoUrl },
      { title: "SecureChat", url: projects[2]?.repoUrl },
    ],
  };
}
