import { useState } from 'react';
import { FileText, Cloud, Palette, Film, Share2, Presentation } from 'lucide-react';
import { ThemeId } from '../types';
import { SKILLS_DATA, THEME_CONFIGS } from '../data/portfolioData';

interface SkillsSectionProps {
  currentTheme: ThemeId;
}

export function SkillsSection({ currentTheme }: SkillsSectionProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'office' | 'design'>('all');
  const themeConfig = THEME_CONFIGS[currentTheme];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Microsoft Office':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'Google Workspace':
        return <Cloud className="w-5 h-5 text-amber-400" />;
      case 'Basic Graphic Design':
        return <Palette className="w-5 h-5 text-pink-400" />;
      case 'Basic Video Editing':
        return <Film className="w-5 h-5 text-purple-400" />;
      case 'Social Media Content Design':
        return <Share2 className="w-5 h-5 text-cyan-400" />;
      case 'Presentation Design':
        return <Presentation className="w-5 h-5 text-emerald-400" />;
      default:
        return <FileText className="w-5 h-5 text-[#C5A059]" />;
    }
  };

  const allSkills = [
    ...SKILLS_DATA.officeWorkspace,
    ...SKILLS_DATA.multimediaDesign
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
            Proficiency across office productivity suites, collaborative cloud tools, graphic design, and multimedia production workflows.
          </p>

          {/* Filter Tabs */}
          <div className="inline-flex p-1 bg-[#141414] border border-[#333333] mt-8 gap-1 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#C5A059] text-[#0F0F0F]'
                  : 'text-[#888888] hover:text-[#C5A059]'
              }`}
            >
              All Skills ({allSkills.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('office')}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-semibold transition-all cursor-pointer ${
                activeTab === 'office'
                  ? 'bg-[#C5A059] text-[#0F0F0F]'
                  : 'text-[#888888] hover:text-[#C5A059]'
              }`}
            >
              Office & Workspace ({SKILLS_DATA.officeWorkspace.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('design')}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-semibold transition-all cursor-pointer ${
                activeTab === 'design'
                  ? 'bg-[#C5A059] text-[#0F0F0F]'
                  : 'text-[#888888] hover:text-[#C5A059]'
              }`}
            >
              Graphic Design & Multimedia ({SKILLS_DATA.multimediaDesign.length})
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
                <p className="text-xs text-[#999999] leading-relaxed mb-4 font-light">
                  {skill.context}
                </p>

                {/* Sub-skills / Tools list */}
                {skill.tools && skill.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {skill.tools.map((tool) => (
                      <span
                        key={tool}
                        className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#141414] text-[#A0A0A0] border border-[#2a2a2a] group-hover:border-[#3a3a3a] transition-colors"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
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
                  <span>{skill.categoryLabel}</span>
                  <span>Proficiency</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Competencies Note */}
        <div className="mt-14 p-5 bg-[#141414] border border-[#262626] text-center max-w-2xl mx-auto text-xs text-[#888888] font-light">
          <span className="text-[#C5A059] uppercase tracking-wider font-mono text-[10px] block mb-1">
            Technical & Creative Core
          </span>
          Proficiency spanning industry-standard office suites, collaborative cloud tools, visual content creation, and multimedia editing platforms.
        </div>
      </div>
    </section>
  );
}
