import { useState } from 'react';
import { Menu, X, FileText, Settings as SettingsIcon, ExternalLink } from 'lucide-react';
import { ThemeId, NavSectionId } from '../types';
import { PERSONAL_INFO } from '../data/portfolioData';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NavigationProps {
  currentTheme: ThemeId;
  activeSection: NavSectionId;
  onSelectSection: (section: NavSectionId) => void;
  onSelectTheme: (theme: ThemeId) => void;
  onOpenResume: () => void;
  onOpenSettings: () => void;
}

export const NAV_LINKS: { id: NavSectionId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'contact', label: 'Contact' },
];

export function Navigation({
  currentTheme,
  activeSection,
  onSelectSection,
  onSelectTheme,
  onOpenResume,
  onOpenSettings,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: NavSectionId) => {
    setMobileMenuOpen(false);
    onSelectSection(id);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0F0F0F]/95 backdrop-blur-xl border-b border-[#222222] shadow-2xl transition-all duration-300">
      <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Name (Left column with flex-1 for balanced centering) */}
          <div className="flex-1 flex items-center justify-start min-w-0 pr-2">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="group text-left flex items-center gap-3 focus:outline-none cursor-pointer shrink-0"
            >
              <div className="w-8 h-8 rounded-none border border-[#C5A059]/60 bg-[#1A1A1A] flex items-center justify-center font-serif italic text-xs text-[#C5A059] transition-transform group-hover:scale-105 shrink-0">
                JA
              </div>
              <div className="truncate">
                <span className="text-base sm:text-lg font-serif italic font-light tracking-tight text-[#C5A059] block leading-tight group-hover:text-white transition-colors truncate">
                  {PERSONAL_INFO.name}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links - Centered Horizontally with Balanced Spacing */}
          <nav 
            aria-label="Main Navigation"
            className="hidden xl:flex items-center justify-center gap-1.5 xl:gap-2 2xl:gap-3.5 text-[11px] 2xl:text-xs uppercase tracking-[0.14em] 2xl:tracking-[0.16em] font-medium shrink-0 px-4"
          >
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={`transition-all duration-200 py-1.5 px-2 xl:px-2.5 2xl:px-3 relative cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-[#C5A059] font-semibold'
                      : 'text-[#888888] hover:text-[#C5A059]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-[#C5A059] shadow-[0_0_8px_rgba(197,160,89,0.7)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools (Right column with flex-1 for balanced centering) */}
          <div className="flex-1 flex items-center justify-end min-w-0 pl-2">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <ThemeSwitcher currentTheme={currentTheme} onSelectTheme={onSelectTheme} />

              <button
                type="button"
                onClick={onOpenResume}
                id="nav-resume-btn"
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.25em] font-semibold border border-[#C5A059] text-[#C5A059] bg-[#141414] hover:bg-[#C5A059] hover:text-[#0F0F0F] transition-all duration-300 shadow-sm cursor-pointer whitespace-nowrap"
                title="View & Download Résumé"
              >
                <FileText className="w-3 h-3" />
                <span>Resume</span>
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                id="nav-settings-btn"
                className="p-2 border border-[#333333] hover:border-[#C5A059]/60 text-[#888888] hover:text-white bg-[#141414] transition-colors cursor-pointer"
                title="Appearance & Accessibility Settings"
                aria-label="Settings"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
              </button>

              {/* Mobile / Tablet menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                id="mobile-menu-toggle-btn"
                className="xl:hidden p-2 text-[#C5A059] bg-[#141414] border border-[#333333] hover:border-[#C5A059] transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Mobile / Tablet Horizontal Navigation Bar - Centered with Overflow Protection */}
        <div className="xl:hidden w-full overflow-x-auto no-scrollbar py-2 -mx-4 px-4 border-t border-[#1C1C1C]">
          <div className="flex items-center justify-start md:justify-center min-w-max mx-auto gap-1 sm:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={`whitespace-nowrap px-3 py-1 text-[10px] uppercase tracking-wider font-mono transition-all rounded-none cursor-pointer ${
                    isActive
                      ? 'bg-[#C5A059] text-black font-semibold shadow-sm'
                      : 'bg-[#141414] text-[#888888] hover:text-white border border-[#262626]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full Mobile Drawer Overlay Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-[105px] bottom-0 bg-[#0F0F0F]/98 border-t border-[#222222] backdrop-blur-2xl px-6 py-6 shadow-2xl overflow-y-auto animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C5A059] mb-2 px-4">
              Navigation Menu
            </span>
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full text-left px-4 py-3 text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-between border-b border-[#1A1A1A] cursor-pointer ${
                    isActive
                      ? 'text-[#C5A059] bg-[#1A1A1A] font-semibold border-l-2 border-l-[#C5A059]'
                      : 'text-[#999999] hover:text-white hover:bg-[#161616]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-widest">
                      Active •
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-6 border-t border-[#222222] flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenResume();
                }}
                className="w-full py-3 px-4 text-[11px] uppercase tracking-[0.25em] font-semibold border border-[#C5A059] text-[#C5A059] bg-[#1A1A1A] hover:bg-[#C5A059] hover:text-[#0F0F0F] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>View Full Résumé</span>
              </button>
              <a
                href={PERSONAL_INFO.currentProject.link}
                target="_blank"
                rel="noreferrer noopener"
                className="w-full py-3 px-4 text-[11px] uppercase tracking-[0.25em] font-semibold bg-[#141414] border border-[#333333] text-[#999999] hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Play Mind Meld Game</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
