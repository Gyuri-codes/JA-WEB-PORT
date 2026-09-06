import { ExperienceItem, CertificationItem, ThemeId } from '../types';

export const PERSONAL_INFO = {
  name: "Jeric Abestano",
  title: "Hospitality Management & Digital Experience Creator",
  email: "jericni.official@gmail.com",
  phone: "+63 9369044541",
  location: "Dumaguete City, Negros Oriental, Philippines",
  birthplace: "Parañaque City",
  birthDate: "February 1, 1997",
  education: {
    degree: "Bachelor of Science in Hospitality Management",
    status: "Currently 4th Year",
    institution: "Asian College",
    location: "Dumaguete City, Negros Oriental",
  },
  centralIdea: "Hospitality meets creativity, technology, and AI.",
  positioningHeadline: "I create experiences people remember.",
  positioningSupport: "Hospitality Management student with hands-on guest service experience and a growing passion for creative technology, AI-powered projects, and digital experiences.",
  humblePositioning: "A hospitality professional in the making who is exploring how technology and AI can be used to create memorable digital experiences.",
  currentProject: {
    name: "Mind Meld",
    label: "Currently building → Mind Meld",
    subtitle: "An experiment in building a game with AI-assisted tools",
    link: "https://weiwei-97.github.io/MIND-MELD-2.0/",
    statement: "Mind Meld is an experimental game project developed with the assistance of AI tools."
  },
  careerObjective: "Seeking an opportunity to apply my strong guest service skills, positive attitude, adaptability, and growing digital creativity to help deliver memorable, high-standard customer experiences.",
  languages: ["Filipino", "English"]
};

export const UNEXPECTED_PILLARS = [
  {
    id: "human-connection",
    title: "Human Connection",
    subtitle: "The Soul of Hospitality",
    description: "Deep foundation in hospitality, guest service, communication, active listening, and understanding real human emotions and needs.",
    tags: ["Guest Empathy", "Warm Service", "Active Listening"]
  },
  {
    id: "hands-on-experience",
    title: "Hands-On Experience",
    subtitle: "Real-World Grounding",
    description: "Rigorous food service internships (SIL) and hands-on exposure to high-pressure hospitality environments where precision and teamwork matter.",
    tags: ["Food & Beverage", "Front Office", "Attention to Detail"]
  },
  {
    id: "digital-curiosity",
    title: "Digital Curiosity",
    subtitle: "The Creative Edge",
    description: "AI-assisted experimentation, creative technology exploration, and the active development of interactive web games like Mind Meld.",
    tags: ["AI Workflows", "Interactive Prototyping", "Curiosity-Driven"]
  }
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: "tooties-kitchen",
    company: "Tootie's Kitchen",
    role: "Food Service Intern (SIL)",
    period: "July 2026",
    verifiedYear: "2026",
    location: "Dumaguete City",
    responsibilities: [
      "Assisted in preparing and serving orders with precision and care",
      "Maintained strict cleanliness and hygiene in all work stations",
      "Followed comprehensive food safety standards and station protocols"
    ],
    skillsDemonstrated: ["Food Safety", "Order Prep", "Cleanliness", "Workplace Safety"]
  },
  {
    id: "overdose-coffee",
    company: "Overdose Coffee",
    role: "Food Service Intern (SIL)",
    period: "July 2025",
    verifiedYear: "2025",
    location: "Dumaguete City",
    responsibilities: [
      "Ensured careful preparation of customer orders with craft and speed",
      "Delivered orders politely, warmly, and professionally to all guests",
      "Focused directly on guest satisfaction, loyalty, and positive ambiance"
    ],
    skillsDemonstrated: ["Customer Service", "Guest Satisfaction", "Friendly Demeanor", "Multitasking"]
  },
  {
    id: "gabbys-bistro",
    company: "Gabby's Bistro",
    role: "Food Service Intern (SIL)",
    period: "July – August 2024",
    verifiedYear: "2024",
    location: "Dumaguete City",
    responsibilities: [
      "Contributed actively to a vibrant and positive dining atmosphere",
      "Communicated effectively with diners to ensure expectations were exceeded",
      "Provided informed menu recommendations tailored to guest preferences"
    ],
    skillsDemonstrated: ["Effective Communication", "Menu Consultation", "Dining Ambiance", "Teamwork"]
  }
];

export const CERTIFICATIONS: CertificationItem[] = [
  {
    id: "cert-front-office",
    title: "NC II – Front Office Services",
    issuer: "Asian College",
    date: "March 26, 2026",
    badgeLevel: "National Certificate Level II",
    description: "Certified proficiency in guest registration, reservations, front desk operations, and professional guest communication."
  },
  {
    id: "cert-bread-pastry",
    title: "NC II – Bread and Pastry Production",
    issuer: "Asian College",
    date: "March 21, 2025",
    badgeLevel: "National Certificate Level II",
    description: "Certified competence in baking techniques, confectionery production, portion control, and bakery hygiene."
  },
  {
    id: "cert-cookery",
    title: "NC II – Cookery",
    issuer: "Asian College",
    date: "July 23, 2024",
    badgeLevel: "National Certificate Level II",
    description: "Certified skills in professional culinary preparations, hot and cold kitchen handling, and plating standards."
  },
  {
    id: "cert-fb-services",
    title: "NC II – Food and Beverage Services",
    issuer: "Asian College",
    date: "July 17, 2024",
    badgeLevel: "National Certificate Level II",
    description: "Certified mastery of dining room setup, formal table service, beverage presentation, and client relations."
  },
  {
    id: "cert-housekeeping",
    title: "NC II – Housekeeping",
    issuer: "TESDA",
    date: "January 23, 2024",
    badgeLevel: "National Certificate Level II",
    description: "TESDA-certified excellence in guest room maintenance, linen care, sanitation, and institutional housekeeping standards."
  }
];

export const SKILLS_DATA = {
  humanCentered: [
    { name: "Active Listening", level: 95, context: "Understanding unspoken guest expectations and requirements with empathy" },
    { name: "Multitasking", level: 92, context: "Balancing fast-paced floor operations, order prep, and client attention" },
    { name: "Adaptability", level: 94, context: "Effortlessly navigating dynamic shifts, unexpected situations, and new tools" },
    { name: "Service Mindset", level: 96, context: "Delivering proactive warmth and hospitality across every guest touchpoint" },
    { name: "Team Collaboration", level: 90, context: "Communicating smoothly across kitchen, service, and front-desk units" }
  ],
  digitalCuriosity: [
    { name: "AI-Assisted Creation", level: 88, context: "Using modern AI tools to accelerate ideation, logic structuring, and creative outputs" },
    { name: "Creative Technology", level: 85, context: "Bridging human interaction concepts into interactive digital prototypes" },
    { name: "Experimental Digital Projects", level: 87, context: "Hands-on browser builds including interactive mechanics and web games" },
    { name: "Prompt Engineering & Workflows", level: 86, context: "Structuring iterative prompts to produce functional code and visual concepts" },
    { name: "Iterative Problem Solving", level: 90, context: "Testing, discovering bugs, and refining experiences through real building" }
  ]
};

export const MIND_MELD_CASE_STUDY = {
  title: "MIND MELD",
  tagline: "An experiment in building a game with AI-assisted tools.",
  overview: "Mind Meld is an experimental interactive web game created by Jeric Abestano. Developed through rapid AI-assisted workflows, it demonstrates curiosity, creative direction, and the eagerness to build interactive digital experiences that delight users.",
  officialUrl: "https://weiwei-97.github.io/MIND-MELD-2.0/",
  sections: [
    {
      id: "idea",
      title: "The Idea",
      subtitle: "Why Mind Meld was created",
      content: "Jeric wanted to step outside traditional hospitality coursework to test whether someone passionate about guest service could craft an engaging digital entertainment experience. The spark was simple: explore how human curiosity and emerging AI capabilities can combine to build a real, functioning game."
    },
    {
      id: "experiment",
      title: "The Experiment",
      subtitle: "Integrating AI into the creative process",
      content: "Rather than treating AI as a substitute for thought, Jeric utilized AI tools as collaborative assistants—iterating on game mechanics, debugging logic, refining interaction loops, and solving creative roadblocks. Human judgment guided every aesthetic and experiential decision."
    },
    {
      id: "result",
      title: "The Result",
      subtitle: "A playable digital experience",
      content: "A live, playable browser-based game published to GitHub Pages that proves Jeric's willingness to learn, experiment, and deliver tangible projects beyond traditional hospitality boundaries."
    },
    {
      id: "learned",
      title: "What I Learned",
      subtitle: "Growth through building",
      content: "Building Mind Meld solidified the value of rapid prototyping, persistent problem solving, and iterative refinement. It taught Jeric how to break down complex challenges into testable components and confirmed that hospitality's focus on user delight translates directly into digital experiences."
    }
  ]
};

export const HORROR_GAME_CASE_STUDY = {
  id: "the-house-that-remembers",
  title: "THE HOUSE THAT REMEMBERS",
  tagline: "An immersive first-person psychological horror web game inspired by classic browser horror experiences like Hotel 626.",
  overview: "Step inside a chilling atmospheric narrative where rooms shift, memories echo, and tension builds through sound design and first-person exploration. Built as a browser experience paying homage to classic psychological horror games.",
  officialUrl: "https://gyuri-codes.github.io/The-House-That-Remembers/",
  genre: "Psychological Horror / Interactive Narrative",
  inspiration: "Classic browser horror (Hotel 626) & modern psychological thrillers",
  features: [
    {
      title: "Atmospheric Soundscapes",
      description: "Positional audio cues, whispering echoes, and sudden dynamic sound design that heighten tension."
    },
    {
      title: "First-Person Exploration",
      description: "Navigate darkened hallways, examine haunted artifacts, and piece together fragmented memories."
    },
    {
      title: "Psychological Suspense",
      description: "Subtle environmental distortions, shifting light, and psychological dread that keep players on edge."
    },
    {
      title: "Instant Browser Play",
      description: "Zero installation required—fully optimized for modern web browsers on GitHub Pages."
    }
  ]
};

export const HOW_I_THINK_STEPS = [
  {
    worldA: "Hospitality",
    arrow: "→",
    worldB: "Understanding people",
    insight: "Service begins with reading subtle cues, active listening, and genuine empathy."
  },
  {
    worldA: "Service",
    arrow: "→",
    worldB: "Designing experiences",
    insight: "Every moment a guest or user encounters should be intentional, seamless, and reassuring."
  },
  {
    worldA: "AI",
    arrow: "→",
    worldB: "Expanding creative possibilities",
    insight: "AI tools lower barriers, enabling curious minds to build concepts previously out of reach."
  },
  {
    worldA: "Technology",
    arrow: "→",
    worldB: "Building something interactive",
    insight: "Ideas only matter when they are made real and accessible for others to explore."
  },
  {
    worldA: "Creativity",
    arrow: "→",
    worldB: "Making it memorable",
    insight: "The intersection of unexpected fields is where distinct, unforgettable impressions happen."
  }
];

export const SERVICES = [
  {
    id: "guest-experience",
    title: "Guest & Customer Experience",
    description: "Designing thoughtful front-line service flows, dining ambiance, and empathetic customer journeys grounded in authentic hospitality.",
    icon: "HeartHandshake"
  },
  {
    id: "ai-prototyping",
    title: "AI-Assisted Digital Prototyping",
    description: "Transforming ideas into interactive web prototypes and creative digital experiments using modern AI tools and iterative testing.",
    icon: "Cpu"
  },
  {
    id: "creative-operations",
    title: "Operational Hospitality Support",
    description: "Hands-on expertise across food & beverage service, kitchen coordination, food safety standards, and front office operations.",
    icon: "Utensils"
  },
  {
    id: "interactive-concepts",
    title: "Creative Concept Development",
    description: "Bridging human-centered service principles with fresh interactive digital concepts, gamified mechanics, and storytelling.",
    icon: "Sparkles"
  }
];

export const CREATIVE_PROCESS = [
  { step: "01", name: "Discover", label: "Listen to the guest or user needs with complete presence" },
  { step: "02", name: "Plan", label: "Outline the journey, standards, and desired emotional outcome" },
  { step: "03", name: "Create", label: "Brainstorm creative solutions and leverage AI tools for rapid ideation" },
  { step: "04", name: "Build", label: "Hands-on execution, prototyping, testing, and crafting details" },
  { step: "05", name: "Refine", label: "Iterate based on feedback, ensure safety, quality, and smooth flow" },
  { step: "06", name: "Launch", label: "Deliver a memorable experience that exceeds every expectation" }
];

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  emoji: string;
  subtitle: string;
  vibe: string;
  fontHeadline: string;
  fontBody: string;
  borderStyle: string;
  badgeStyle: string;
  accentColor: string;
  terms: {
    heroTag: string;
    skills: string;
    projects: string;
    experience: string;
    certifications: string;
    contactCta: string;
    services: string;
    process: string;
  };
}

export const THEME_CONFIGS: Record<ThemeId, ThemeConfig> = {
  artistic: {
    id: 'artistic',
    name: 'Artistic Flair',
    emoji: '✒️',
    subtitle: 'Editorial Noir & Architectural Gold',
    vibe: 'Refined, architectural precision, high-fidelity dark obsidian with champagne gold accents',
    fontHeadline: "'Playfair Display', 'Cormorant Garamond', 'Newsreader', serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    borderStyle: 'border-[#333333] bg-[#1A1A1A] shadow-[0_10px_30px_rgba(0,0,0,0.6)]',
    badgeStyle: 'bg-[#1A1A1A] border border-[#C5A059]/50 text-[#C5A059] tracking-[0.25em] uppercase',
    accentColor: '#C5A059',
    terms: {
      heroTag: 'Hospitality × Creative Direction',
      skills: 'Core Competencies & Disciplines',
      projects: 'Selected Works & Case Studies',
      experience: 'Supervised Industry Experience',
      certifications: 'National Credentials & Accreditations',
      contactCta: 'Initiate Inquiry',
      services: 'Service Architecture & Experience Design',
      process: 'Creative Execution Framework'
    }
  },
  immortal: {
    id: 'immortal',
    name: 'Immortal Realm',
    emoji: '☯',
    subtitle: 'Donghua & Xianxia Celestial Fantasy',
    vibe: 'Mysterious, artistic, cinematic, and magical celestial energy',
    fontHeadline: "'Cinzel Decorative', 'Cinzel', serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    borderStyle: 'border-cyan-500/25 bg-slate-950/70 shadow-[0_0_30px_rgba(6,182,212,0.12)]',
    badgeStyle: 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300',
    accentColor: '#06b6d4',
    terms: {
      heroTag: 'Cultivator of Experiences',
      skills: 'Spiritual Abilities & Disciplines',
      projects: 'Legendary Artifacts & Techniques',
      experience: 'Mundane Trials & Practical Training',
      certifications: 'Heavenly Credentials & Seals',
      contactCta: 'Transmit Divine Message',
      services: 'Sacred Services & Craft',
      process: 'Path of Creation (Dao)'
    }
  },
  pixel: {
    id: 'pixel',
    name: 'Pixel Frontier',
    emoji: '⛏',
    subtitle: 'Voxel & 8-Bit Adventure World',
    vibe: 'Playful, nostalgic, creative, blocky, and adventurous',
    fontHeadline: "'Silkscreen', monospace",
    fontBody: "'Outfit', sans-serif",
    borderStyle: 'border-emerald-500/40 bg-zinc-900/90 shadow-[4px_4px_0px_#10b981]',
    badgeStyle: 'bg-emerald-950/70 border-2 border-emerald-500 text-emerald-400 font-mono',
    accentColor: '#10b981',
    terms: {
      heroTag: 'World Builder & Explorer',
      skills: 'Upgradeable Abilities & Stats',
      projects: 'Completed Builds & Worlds',
      experience: 'Adventure Progression & Quests',
      certifications: 'Achievement Trophies & Badges',
      contactCta: 'Send Chat Packet',
      services: 'Crafting Recipes & Services',
      process: 'Build Blueprint Protocol'
    }
  },
  tactical: {
    id: 'tactical',
    name: 'Mission: Jeric',
    emoji: '🎯',
    subtitle: 'Cyber Tactical & HUD Interface',
    vibe: 'Futuristic, professional, tactical, sharp, and confident',
    fontHeadline: "'Chakra Petch', 'Rajdhani', sans-serif",
    fontBody: "'Rajdhani', sans-serif",
    borderStyle: 'border-rose-500/40 bg-neutral-950/85 clip-corners shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    badgeStyle: 'bg-rose-950/40 border border-rose-500/50 text-rose-400 tracking-wider uppercase',
    accentColor: '#f43f5e',
    terms: {
      heroTag: 'Active Tactical Operative',
      skills: 'Combat & Operational Protocols',
      projects: 'Executed Missions & Deployments',
      experience: 'Field Service Log & Deployment History',
      certifications: 'Verified Clearance & Authorizations',
      contactCta: 'INITIATE CONTRACT',
      services: 'Field Capabilities & Support',
      process: 'Mission Execution Sequence'
    }
  },
  legendary: {
    id: 'legendary',
    name: 'Legendary Chronicle',
    emoji: '⚔',
    subtitle: 'MOBA Epic & Regal Fantasy',
    vibe: 'Heroic, luxurious, dramatic, gold filigree, and powerful',
    fontHeadline: "'Marcellus', 'Cinzel', serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    borderStyle: 'border-amber-500/40 bg-slate-950/80 shadow-[0_0_25px_rgba(245,158,11,0.18)]',
    badgeStyle: 'bg-amber-950/40 border border-amber-400/40 text-amber-300',
    accentColor: '#f59e0b',
    terms: {
      heroTag: 'Champion of Hospitality',
      skills: 'Hero Talents & Masteries',
      projects: 'Legendary Deeds & Artifacts',
      experience: 'Chronicle of Heroic Quests',
      certifications: 'Royal Accreditations & Honors',
      contactCta: 'Forge Heroic Alliance',
      services: 'Guild Offerings & Blessings',
      process: 'Chronicle of Triumph'
    }
  },
  clash: {
    id: 'clash',
    name: 'Clash Kingdom',
    emoji: '🏰',
    subtitle: 'Cartoon Strategy & Clan Kingdom',
    vibe: 'Friendly, energetic, approachable, dimensional, and fun',
    fontHeadline: "'Fredoka', cursive, sans-serif",
    fontBody: "'Outfit', sans-serif",
    borderStyle: 'border-yellow-400/40 bg-stone-900/85 rounded-2xl shadow-[0_8px_0_#ca8a04]',
    badgeStyle: 'bg-yellow-950/60 border-2 border-yellow-500 text-yellow-300 font-bold',
    accentColor: '#eab308',
    terms: {
      heroTag: 'Town Hall Master Builder',
      skills: 'Upgraded Buildings & Stats',
      projects: 'Completed Constructions',
      experience: 'Village Progression & Defense',
      certifications: 'Trophy Cabinet & Medals',
      contactCta: 'JOIN THE CLAN',
      services: 'Clan Perks & Assistance',
      process: 'Village Upgrade Path'
    }
  },
  mythic: {
    id: 'mythic',
    name: 'Mythic Dynasty',
    emoji: '🐉',
    subtitle: 'Imperial Chinese Mythological Elegance',
    vibe: 'Regal, sophisticated, jade & celestial crimson, legendary',
    fontHeadline: "'Cinzel', serif",
    fontBody: "'Outfit', sans-serif",
    borderStyle: 'border-red-600/30 bg-neutral-950/85 shadow-[0_0_30px_rgba(220,38,38,0.18)]',
    badgeStyle: 'bg-red-950/50 border border-red-500/40 text-amber-200',
    accentColor: '#dc2626',
    terms: {
      heroTag: 'Dynasty Master Craftsman',
      skills: 'Imperial Disciplines & Arts',
      projects: 'Mythic Treasures & Chronicles',
      experience: 'Imperial Service & Provenance',
      certifications: 'Imperial Mandates & Seals',
      contactCta: 'Answer Royal Summons',
      services: 'Imperial Decrees & Works',
      process: 'Six Principles of Harmony'
    }
  }
};
