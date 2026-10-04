import { Trophy, Award, Star, Flame, Sparkles, CheckCircle2, Gamepad2, ShieldAlert } from 'lucide-react';
import { ThemeId } from '../types';
import { THEME_CONFIGS } from '../data/portfolioData';

interface AchievementsSectionProps {
  currentTheme: ThemeId;
  onNavigateToProjects?: () => void;
  onNavigateToCertifications?: () => void;
}

export function AchievementsSection({ 
  currentTheme, 
  onNavigateToProjects,
  onNavigateToCertifications 
}: AchievementsSectionProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  const statMetrics = [
    { number: "6", label: "National Certifications", note: "TESDA NC II & NC III" },
    { number: "4", label: "Shipped Digital Projects", note: "Interactive Games & 3D Web" },
    { number: "100%", label: "Assessment Pass Rate", note: "First-attempt TVET mastery" },
    { number: "1,000+", label: "Service Hours", note: "Hands-on hospitality floor operations" }
  ];

  const distinctions = [
    {
      id: "tesda-suite",
      category: "Accreditation & Technical Mastery",
      title: "Six-Tier National Competency Credential Suite",
      issuer: "TESDA & Asian College Dumaguete",
      date: "2024 – 2026",
      desc: "Earned 6 accredited qualifications spanning Front Office Services, Housekeeping, Food and Beverage Services, Bread and Pastry Production, Commercial Cookery, and Events Management Services.",
      actionLabel: "View Certifications →",
      action: onNavigateToCertifications,
      badge: "TESDA NC II & NC III"
    },
    {
      id: "sil-excellence",
      category: "Hospitality Industry Practicum",
      title: "Supervised Industry Learning (SIL) Practicum Commendation",
      issuer: "Tootie's Kitchen / Hospitality Faculty",
      date: "2024",
      desc: "Recognized for operational diligence, rapid order expediting, uncompromising kitchen hygiene compliance, and empathetic customer communication under high-volume dinner rushes.",
      badge: "Practicum Honor"
    },
    {
      id: "digital-innovation",
      category: "Creative Technology & Digital Creation",
      title: "Cross-Disciplinary AI & Web Game Development Milestones",
      issuer: "Independent Creative Technology Projects",
      date: "2024 – 2026",
      desc: "Conceptualized, engineered, and published 4 distinct interactive browser experiences—translating hospitality guest empathy into playful engagement, tower defense strategy, psychological thriller narratives, and 3D WebGL.",
      actionLabel: "Explore Projects →",
      action: onNavigateToProjects,
      badge: "4 Web Experiences"
    },
    {
      id: "board-mastery",
      category: "Competency Standards",
      title: "Flawless First-Attempt Board Assessment Record",
      issuer: "Philippine TVET Competency Assessment System",
      date: "Verified Record",
      desc: "Achieved unblemished 100% competency qualification on every TESDA assessment panel without need for re-evaluation or remedial testing.",
      badge: "100% Passing"
    }
  ];

  const digitalShowcase = [
    {
      name: "Mind Meld 2.0",
      tag: "AI-Assisted Web Game",
      desc: "Playable live on GitHub Pages, merging rapid AI-collaborative logic structuring with human aesthetic direction."
    },
    {
      name: "The House That Remembers",
      tag: "First-Person Atmospheric Horror",
      desc: "Browser-based psychological narrative inspired by classic horror experiences with positional audio cue design."
    },
    {
      name: "Emberfall",
      tag: "Cultivator Guardian Tower Defense",
      desc: "Multi-wave strategic lane defense game featuring elemental affinities and mythical protector units."
    },
    {
      name: "RURU (流々)",
      tag: "Cinematic 3D WebGL Night Journey",
      desc: "Interactive nocturnal scroll meditation rendered in real-time procedural Three.js with spatial Web Audio."
    }
  ];

  return (
    <section id="achievements" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] block mb-3 font-medium">
            Milestones & Distinctions
          </span>
          <h2 
            className="text-3xl sm:text-5xl font-serif italic font-light text-white tracking-tight"
            style={{ fontFamily: themeConfig.fontHeadline }}
          >
            Achievements
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#999999] max-w-2xl mx-auto font-light leading-relaxed">
            Tangible distinctions earned across accredited hospitality qualification boards, industry internships, and experimental digital projects.
          </p>
        </div>

        {/* High-Impact Stat Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {statMetrics.map((stat, idx) => (
            <div 
              key={idx}
              className="p-6 sm:p-8 bg-[#161616] border border-[#2a2a2a] hover:border-[#C5A059]/60 transition-all text-center relative overflow-hidden group shadow-lg"
            >
              <div className="absolute inset-0 bg-[#C5A059] opacity-0 group-hover:opacity-5 transition-opacity" />
              <div 
                className="text-3xl sm:text-5xl font-serif italic text-[#C5A059] mb-2"
                style={{ fontFamily: themeConfig.fontHeadline }}
              >
                {stat.number}
              </div>
              <div className="text-xs uppercase font-mono tracking-wider text-white font-medium mb-1">
                {stat.label}
              </div>
              <div className="text-[11px] text-[#777777] font-mono">
                {stat.note}
              </div>
            </div>
          ))}
        </div>

        {/* Primary Distinctions Grid */}
        <div className="space-y-6 mb-16">
          {distinctions.map((item) => (
            <div
              key={item.id}
              className="p-8 bg-[#161616] border border-[#2a2a2a] hover:border-[#C5A059]/60 transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 group shadow-xl"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] bg-[#1F1F1F] px-2.5 py-1 border border-[#333333]">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-mono text-[#777777]">
                    {item.issuer} • {item.date}
                  </span>
                </div>

                <h3 
                  className="text-xl sm:text-2xl font-serif italic text-white group-hover:text-[#C5A059] transition-colors"
                  style={{ fontFamily: themeConfig.fontHeadline }}
                >
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#999999] font-light leading-relaxed">
                  {item.desc}
                </p>

                {item.action && (
                  <button
                    onClick={item.action}
                    className="inline-block mt-2 text-xs font-mono text-[#C5A059] hover:underline cursor-pointer tracking-wider"
                  >
                    {item.actionLabel}
                  </button>
                )}
              </div>

              <div className="shrink-0 self-start md:self-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 border border-[#C5A059]/40 bg-[#121212] text-xs font-mono text-[#C5A059]">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{item.badge}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Digital Creations Achievement Spotlight */}
        <div className="p-8 sm:p-10 bg-[#131313] border border-[#262626]">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-[#262626] mb-8">
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-5 h-5 text-[#C5A059]" />
              <div>
                <h3 className="text-base sm:text-lg font-serif italic text-white">
                  Creative Technology Portfolio Distinctions
                </h3>
                <p className="text-xs text-[#777777] font-mono">
                  Self-directed interactive browser builds published on GitHub Pages
                </p>
              </div>
            </div>

            {onNavigateToProjects && (
              <button
                onClick={onNavigateToProjects}
                className="px-4 py-2 border border-[#C5A059] text-[10px] uppercase font-mono tracking-widest text-[#C5A059] hover:bg-[#C5A059] hover:text-black transition-all cursor-pointer"
              >
                Open Full Projects Page →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {digitalShowcase.map((item, idx) => (
              <div 
                key={idx}
                className="p-5 bg-[#181818] border border-[#2a2a2a] hover:border-[#C5A059]/50 transition-colors"
              >
                <div className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider mb-1">
                  {item.tag}
                </div>
                <h4 className="text-sm font-serif italic text-white mb-2">
                  {item.name}
                </h4>
                <p className="text-[11px] text-[#888888] font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
