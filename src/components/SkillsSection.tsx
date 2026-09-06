import { useState } from 'react';
import { Ear, Layers, RefreshCw, Cpu, Sparkles, Code2, BrainCircuit, HeartHandshake } from 'lucide-react';
import { ThemeId } from '../types';
import { SKILLS_DATA, THEME_CONFIGS } from '../data/portfolioData';

interface SkillsSectionProps {
  currentTheme: ThemeId;
}

export function SkillsSection({ currentTheme }: SkillsSectionProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'hospitality' | 'technology'>('all');
  const themeConfig = THEME_CONFIGS[currentTheme];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Active Listening':
        return <Ear className="w-5 h-5 text-emerald-400" />;
      case 'Multitasking':
        return <Layers className="w-5 h-5 text-indigo-400" />;
      case 'Adaptability':
        return <RefreshCw className="w-5 h-5 text-amber-400" />;
      case 'AI-Assisted Creation':
        return <BrainCircuit className="w-5 h-5 text-cyan-400" />;
      case 'Creative Technology':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'Experimental Digital Projects':
        return <Code2 className="w-5 h-5 text-rose-400" />;
      default:
        return <HeartHandshake className="w-5 h-5 text-emerald-400" />;
    }
  };

  const allSkills = [
    ...SKILLS_DATA.humanCentered.map(s => ({ ...s, category: 'hospitality' })),
    ...SKILLS_DATA.digitalCuriosity.map(s => ({ ...s, category: 'technology' }))
  ];

  const displayedSkills = allSkills.filter(s => activeTab === 'all' || s.category === activeTab);

  return (
    <section id="skills" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] block mb-3 font-medium">
            {themeConfig.terms.skills}
          </span>
          <h2 
            className="text-3xl sm:text-5xl font-serif italic font-light text-white tracking-tight"
            style={{ fontFamily: themeConfig.fontHeadline }}
          >
            Capabilities & Disciplines
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#999999] max-w-2xl mx-auto font-light leading-relaxed">
            Grounded in active listening and hospitality service, enhanced by modern AI workflows and iterative digital experimentation.
          </p>

          {/* Filter Tabs */}
          <div className="inline-flex p-1 bg-[#141414] border border-[#333333] mt-8 gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-[#C5A059] text-[#0F0F0F]'
                  : 'text-[#888888] hover:text-[#C5A059]'
              }`}
            >
              All Disciplines ({allSkills.length})
            </button>
            <button
              onClick={() => setActiveTab('hospitality')}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-semibold transition-all ${
                activeTab === 'hospitality'
                  ? 'bg-[#C5A059] text-[#0F0F0F]'
                  : 'text-[#888888] hover:text-[#C5A059]'
              }`}
            >
              Hospitality & People
            </button>
            <button
              onClick={() => setActiveTab('technology')}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-semibold transition-all ${
                activeTab === 'technology'
                  ? 'bg-[#C5A059] text-[#0F0F0F]'
                  : 'text-[#888888] hover:text-[#C5A059]'
              }`}
            >
              Creative & AI Tech
            </button>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedSkills.map((skill) => (
            <div
              key={skill.name}
              className="p-8 bg-[#1A1A1A] border border-[#333333] hover:border-[#C5A059]/60 transition-all duration-300 relative overflow-hidden group shadow-2xl flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-[#C5A059] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#262626]">
                  <div className="p-2 border border-[#333333] bg-[#141414] w-fit">
                    {getIcon(skill.name)}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#C5A059]">
                    {skill.level}%
                  </span>
                </div>

                <h3 
                  className="text-lg font-serif italic text-white mb-2 group-hover:text-[#C5A059] transition-colors"
                  style={{ fontFamily: themeConfig.fontHeadline }}
                >
                  {skill.name}
                </h3>
                <p className="text-xs text-[#999999] leading-relaxed mb-6 font-light">
                  {skill.context}
                </p>
              </div>

              {/* Visual Progress Bar */}
              <div className="relative z-10 pt-2 border-t border-[#262626]">
                <div className="w-full h-1 bg-[#222222] overflow-hidden">
                  <div 
                    className="h-full bg-[#C5A059] transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${skill.level}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-[#666666] mt-2 uppercase tracking-widest">
                  <span>{skill.category === 'hospitality' ? 'Human Core' : 'Digital Edge'}</span>
                  <span>Proficiency</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technology positioning note */}
        <div className="mt-14 p-5 bg-[#141414] border border-[#262626] text-center max-w-2xl mx-auto text-xs text-[#888888] font-light">
          <span className="text-[#C5A059] uppercase tracking-wider font-mono text-[10px] block mb-1">Authentic Practice Note</span>
          Jeric builds digital experiments using AI-assisted creation and rapid web tooling, translating real hospitality problem-solving into interactive experiences.
        </div>
      </div>
    </section>
  );
}
