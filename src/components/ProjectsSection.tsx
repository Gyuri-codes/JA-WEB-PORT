import { ExternalLink, Gamepad2, Utensils, Hotel, ArrowUpRight, Sparkles, Ghost } from 'lucide-react';
import { ThemeId } from '../types';
import { PERSONAL_INFO, THEME_CONFIGS, HORROR_GAME_CASE_STUDY } from '../data/portfolioData';

interface ProjectsSectionProps {
  currentTheme: ThemeId;
}

export function ProjectsSection({ currentTheme }: ProjectsSectionProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  const projects = [
    {
      id: "the-house-that-remembers",
      title: "The House That Remembers",
      category: "Psychological Horror Web Game",
      tagline: "An immersive first-person psychological horror browser experience inspired by classic browser horror like Hotel 626.",
      tools: ["Web Audio", "Interactive Horror", "Atmospheric 3D", "GitHub Pages"],
      isFeatured: true,
      badgeText: "New Game",
      badgeColor: "text-[#ff6b6b] bg-[#ff6b6b]/10 border-[#ff6b6b]/40",
      accentBorder: "border-[#ff6b6b]/80",
      link: HORROR_GAME_CASE_STUDY.officialUrl,
      actionText: "Play Horror Game"
    },
    {
      id: "mind-meld",
      title: "Mind Meld 2.0",
      category: "AI-Assisted Web Game",
      tagline: "An interactive browser-based game built through human-AI creative collaboration.",
      tools: ["Web Tech", "AI-Assisted Workflows", "GitHub Pages", "Game Mechanics"],
      isFeatured: true,
      badgeText: "Featured Game",
      badgeColor: "text-[#C5A059] bg-[#C5A059]/10 border-[#C5A059]/40",
      accentBorder: "border-[#C5A059]",
      link: PERSONAL_INFO.currentProject.link,
      actionText: "Play Live Game"
    },
    {
      id: "hospitality-service-flow",
      title: "Supervised Industry Learning Service Guide",
      category: "Hospitality Framework",
      tagline: "Standardized table-service, customer communication, and food safety protocols synthesized during SIL internships.",
      tools: ["Food Safety", "Table Etiquette", "Guest Care", "Workflow Standards"],
      isFeatured: false,
      badgeText: "Operational",
      badgeColor: "text-[#888888] bg-[#141414] border-[#333333]",
      accentBorder: "border-[#333333]",
      link: "#experience",
      actionText: "View Internship Experience"
    },
    {
      id: "front-office-blueprint",
      title: "Front Office Guest Journey System",
      category: "Hospitality Management",
      tagline: "Comprehensive front desk workflow mapping guest arrival, reservations, and swift conflict resolution.",
      tools: ["Front Office", "NC II Standards", "Active Listening", "Problem Solving"],
      isFeatured: false,
      badgeText: "Certified",
      badgeColor: "text-[#888888] bg-[#141414] border-[#333333]",
      accentBorder: "border-[#333333]",
      link: "#certifications",
      actionText: "View NC II Credentials"
    }
  ];

  return (
    <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] block mb-3 font-medium">
            Creative Portfolio Index
          </span>
          <h2 
            className="text-3xl sm:text-5xl font-serif italic font-light text-white tracking-tight"
            style={{ fontFamily: themeConfig.fontHeadline }}
          >
            Featured Works & Initiatives
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#999999] max-w-xl mx-auto font-light leading-relaxed">
            Tangible outcomes bridging hospitality service precision with digital experimentation and game development.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className={`p-8 flex flex-col justify-between transition-all duration-300 relative bg-[#1A1A1A] group shadow-2xl overflow-hidden border ${
                proj.accentBorder || 'border-[#333333]'
              } hover:border-[#C5A059]`}
            >
              <div className="absolute inset-0 bg-[#C5A059] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#262626]">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A059]">
                    {proj.category}
                  </span>
                  <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border ${proj.badgeColor}`}>
                    {proj.badgeText}
                  </span>
                </div>

                <h3 
                  className="text-xl font-serif italic text-white mb-2 leading-snug group-hover:text-[#C5A059] transition-colors"
                  style={{ fontFamily: themeConfig.fontHeadline }}
                >
                  {proj.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#999999] leading-relaxed mb-6 font-light">
                  {proj.tagline}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {proj.tools.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#141414] text-[#888888] border border-[#2a2a2a]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#262626] flex items-center justify-between relative z-10">
                <a
                  href={proj.link}
                  target={proj.link.startsWith('http') ? '_blank' : '_self'}
                  rel={proj.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-xs uppercase tracking-[0.2em] font-semibold text-[#C5A059] hover:text-white flex items-center gap-1.5 transition-colors group"
                >
                  <span>{proj.actionText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>

                {proj.isFeatured && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Live Browser</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
