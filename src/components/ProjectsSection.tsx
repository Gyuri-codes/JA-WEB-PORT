import { useState } from 'react';
import { ExternalLink, Gamepad2, Utensils, Hotel, ArrowUpRight, Sparkles, Ghost, Compass, Eye, X, Maximize2, Moon, Flame, Palmtree } from 'lucide-react';
import { ThemeId } from '../types';
import { PERSONAL_INFO, THEME_CONFIGS, HORROR_GAME_CASE_STUDY, RURU_PROJECT_DATA, EMBERFALL_PROJECT_DATA, ALON_ANINAG_PROJECT_DATA } from '../data/portfolioData';

interface ProjectsSectionProps {
  currentTheme: ThemeId;
}

export function ProjectsSection({ currentTheme }: ProjectsSectionProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];
  const [activeFilter, setActiveFilter] = useState<'all' | 'interactive' | 'hospitality'>('all');
  const [previewProject, setPreviewProject] = useState<{ title: string; url: string } | null>(null);

  const projects = [
    {
      id: "alon-aninag",
      title: "Alon Aninag Boutique Beach Resort",
      category: "Boutique Beach Resort Web Concept",
      filterCategory: ['hospitality', 'interactive'],
      tagline: "Boutique beachfront sanctuary in Poblacion Beach, Sipalay City, Negros Occidental. \"Where Waves Rest and Souls Glow.\"",
      tools: ["Hospitality Branding", "Boutique Resort UI", "Tailwind CSS", "React / Web", "GitHub Pages"],
      isFeatured: true,
      badgeText: "Boutique Resort",
      badgeColor: "text-[#2dd4bf] bg-[#2dd4bf]/10 border-[#2dd4bf]/40",
      accentBorder: "border-[#2dd4bf]/80",
      link: ALON_ANINAG_PROJECT_DATA.officialUrl,
      actionText: "Explore Resort Site",
      canPreview: true
    },
    {
      id: "emberfall-guardians",
      title: "EMBERFALL: GUARDIANS OF THE LAST REALM",
      category: "Donghua Cultivator Tower Defense",
      filterCategory: "interactive",
      tagline: "An epic Donghua-inspired Tower Defense web game featuring legendary cultivator guardians, elemental abilities, deep cultivation skill trees, and cinematic boss battles.",
      tools: ["React", "TypeScript", "Canvas / WebGL", "Donghua Art", "Skill Trees", "GitHub Pages"],
      isFeatured: true,
      badgeText: "Featured Game",
      badgeColor: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/40",
      accentBorder: "border-[#f59e0b]/80",
      link: EMBERFALL_PROJECT_DATA.officialUrl,
      actionText: "Play Emberfall Live",
      canPreview: true
    },
    {
      id: "ruru-night-journey",
      title: "RURU (流々) — Interactive Night Journey",
      category: "Cinematic 3D Web Experience",
      filterCategory: "interactive",
      tagline: "A five-chapter nocturnal meditation through an ancient Japanese mountain sanctuary, rendered in real-time procedural Three.js.",
      tools: ["Three.js", "WebGL", "TypeScript", "Spatial Web Audio", "Cinematic Scroll"],
      isFeatured: true,
      badgeText: "New · 3D Experience",
      badgeColor: "text-[#88c0d0] bg-[#88c0d0]/10 border-[#88c0d0]/40",
      accentBorder: "border-[#88c0d0]/80",
      link: RURU_PROJECT_DATA.officialUrl,
      actionText: "Launch Night Journey",
      canPreview: true
    },
    {
      id: "the-house-that-remembers",
      title: "The House That Remembers",
      category: "Psychological Horror Web Game",
      filterCategory: "interactive",
      tagline: "An immersive first-person psychological horror browser experience inspired by classic browser horror like Hotel 626.",
      tools: ["Web Audio", "Interactive Horror", "Atmospheric 3D", "GitHub Pages"],
      isFeatured: true,
      badgeText: "Horror Game",
      badgeColor: "text-[#ff6b6b] bg-[#ff6b6b]/10 border-[#ff6b6b]/40",
      accentBorder: "border-[#ff6b6b]/80",
      link: HORROR_GAME_CASE_STUDY.officialUrl,
      actionText: "Play Horror Game",
      canPreview: true
    },
    {
      id: "mind-meld",
      title: "Mind Meld 2.0",
      category: "AI-Assisted Web Game",
      filterCategory: "interactive",
      tagline: "An interactive browser-based game built through human-AI creative collaboration.",
      tools: ["Web Tech", "AI-Assisted Workflows", "GitHub Pages", "Game Mechanics"],
      isFeatured: true,
      badgeText: "Featured Game",
      badgeColor: "text-[#C5A059] bg-[#C5A059]/10 border-[#C5A059]/40",
      accentBorder: "border-[#C5A059]",
      link: PERSONAL_INFO.currentProject.link,
      actionText: "Play Live Game",
      canPreview: false
    },
    {
      id: "hospitality-service-flow",
      title: "Supervised Industry Learning Service Guide",
      category: "Hospitality Framework",
      filterCategory: "hospitality",
      tagline: "Standardized table-service, customer communication, and food safety protocols synthesized during SIL internships.",
      tools: ["Food Safety", "Table Etiquette", "Guest Care", "Workflow Standards"],
      isFeatured: false,
      badgeText: "Operational",
      badgeColor: "text-[#888888] bg-[#141414] border-[#333333]",
      accentBorder: "border-[#333333]",
      link: "#experience",
      actionText: "View Internship Experience",
      canPreview: false
    },
    {
      id: "front-office-blueprint",
      title: "Front Office Guest Journey System",
      category: "Hospitality Management",
      filterCategory: "hospitality",
      tagline: "Comprehensive front desk workflow mapping guest arrival, reservations, and swift conflict resolution.",
      tools: ["Front Office", "NC II Standards", "Active Listening", "Problem Solving"],
      isFeatured: false,
      badgeText: "Certified",
      badgeColor: "text-[#888888] bg-[#141414] border-[#333333]",
      accentBorder: "border-[#333333]",
      link: "#certifications",
      actionText: "View NC II Credentials",
      canPreview: false
    }
  ];

  const filteredProjects = projects.filter((p) => {
    if (activeFilter === 'all') return true;
    if (Array.isArray(p.filterCategory)) {
      return p.filterCategory.includes(activeFilter);
    }
    return p.filterCategory === activeFilter;
  });

  const interactiveCount = projects.filter((p) =>
    Array.isArray(p.filterCategory) ? p.filterCategory.includes('interactive') : p.filterCategory === 'interactive'
  ).length;
  const hospitalityCount = projects.filter((p) =>
    Array.isArray(p.filterCategory) ? p.filterCategory.includes('hospitality') : p.filterCategory === 'hospitality'
  ).length;

  return (
    <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
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
            Tangible outcomes bridging hospitality service precision with real-time 3D web experiences, boutique resort concepts, and interactive games.
          </p>

          {/* Filter Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium border transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#C5A059] text-[#0F0F0F] border-[#C5A059] font-semibold'
                  : 'bg-[#141414] text-[#888888] border-[#2A2A2A] hover:border-[#444] hover:text-white'
              }`}
            >
              All Works ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('interactive')}
              className={`px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium border transition-colors cursor-pointer ${
                activeFilter === 'interactive'
                  ? 'bg-[#88c0d0] text-[#0F0F0F] border-[#88c0d0] font-semibold'
                  : 'bg-[#141414] text-[#888888] border-[#2A2A2A] hover:border-[#444] hover:text-white'
              }`}
            >
              Interactive & Web ({interactiveCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('hospitality')}
              className={`px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium border transition-colors cursor-pointer ${
                activeFilter === 'hospitality'
                  ? 'bg-[#2dd4bf] text-[#0F0F0F] border-[#2dd4bf] font-semibold'
                  : 'bg-[#141414] text-[#888888] border-[#2A2A2A] hover:border-[#444] hover:text-white'
              }`}
            >
              Hospitality & Resorts ({hospitalityCount})
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className={`p-7 flex flex-col justify-between transition-all duration-300 relative bg-[#1A1A1A] group shadow-2xl overflow-hidden border ${
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
                  className="text-lg font-serif italic text-white mb-2 leading-snug group-hover:text-[#C5A059] transition-colors"
                  style={{ fontFamily: themeConfig.fontHeadline }}
                >
                  {proj.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#999999] leading-relaxed mb-5 font-light">
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

              <div className="pt-4 border-t border-[#262626] flex flex-wrap items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2">
                  <a
                    href={proj.link}
                    target={proj.link.startsWith('http') ? '_blank' : '_self'}
                    rel={proj.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-xs uppercase tracking-[0.2em] font-semibold text-[#C5A059] hover:text-white flex items-center gap-1.5 transition-colors group"
                  >
                    <span>{proj.actionText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>

                {proj.canPreview && (
                  <button
                    type="button"
                    onClick={() => setPreviewProject({ title: proj.title, url: proj.link })}
                    className="text-[10px] font-mono uppercase tracking-wider text-[#888888] hover:text-white flex items-center gap-1 px-2 py-1 bg-[#141414] border border-[#2A2A2A] hover:border-[#444] transition-colors cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                )}

                {!proj.canPreview && proj.isFeatured && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Live Browser</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Live Preview Modal */}
      {previewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-5xl bg-[#0e1015] border border-[#333333] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#141418]">
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 text-[#88c0d0]" />
                <span className="text-sm font-serif italic text-white">{previewProject.title}</span>
                <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 bg-[#88c0d0]/10 text-[#88c0d0] border border-[#88c0d0]/30 hidden sm:inline-block">
                  Live Interactive Frame
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewProject.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#C5A059] border border-[#333] hover:border-[#C5A059] transition-colors flex items-center gap-1.5"
                >
                  <span>Open Fullscreen</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewProject(null)}
                  className="p-1.5 text-[#888888] hover:text-white border border-transparent hover:border-[#333] transition-colors cursor-pointer"
                  aria-label="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Iframe Body */}
            <div className="relative w-full flex-1 min-h-[500px] sm:min-h-[620px] bg-black">
              <iframe
                src={previewProject.url}
                title={previewProject.title}
                className="w-full h-full border-0 absolute inset-0"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
