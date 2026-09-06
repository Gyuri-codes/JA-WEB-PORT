import { useState, useEffect } from 'react';
import { Menu, X, FileText, Settings as SettingsIcon, ExternalLink } from 'lucide-react';
import { ThemeId } from '../types';
import { THEME_CONFIGS, PERSONAL_INFO } from '../data/portfolioData';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NavigationProps {
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  onOpenResume: () => void;
  onOpenSettings: () => void;
}

export function Navigation({
  currentTheme,
  onSelectTheme,
  onOpenResume,
  onOpenSettings,
}: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const themeConfig = THEME_CONFIGS[currentTheme];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // Simple active section spy
      const sections = ['hero', 'about', 'experience', 'skills', 'certifications', 'projects', 'mind-meld', 'contact'];
      const scrollPos = window.scrollY + 200;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Skills' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'projects', label: 'Projects' },
    { id: 'mind-meld', label: 'Mind Meld' },
    { id: 'contact', label: 'Contact' },
  ];

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0F0F0F]/95 backdrop-blur-xl border-b border-[#222222] shadow-2xl py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Name with Artistic Flair Vol. 04 heading style */}
        <button
          onClick={() => scrollToSection('hero')}
          className="group text-left flex items-center gap-3 focus:outline-none"
        >
          <div
            className="w-8 h-8 rounded-none border border-[#C5A059]/60 bg-[#1A1A1A] flex items-center justify-center font-serif italic text-xs text-[#C5A059] transition-transform group-hover:scale-105"
          >
            JA
          </div>
          <div>
            <span
              className="text-base sm:text-xl font-serif italic font-light tracking-tight text-[#C5A059] block leading-tight group-hover:text-white transition-colors"
            >
              {PERSONAL_INFO.name}.
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[11px] uppercase tracking-[0.2em] font-medium">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`transition-all duration-200 py-1 border-b ${
                  isActive
                    ? 'text-[#C5A059] border-[#C5A059]'
                    : 'text-[#888888] border-transparent hover:text-[#C5A059]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools (Theme, Resume, Settings) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeSwitcher currentTheme={currentTheme} onSelectTheme={onSelectTheme} />

          <button
            onClick={onOpenResume}
            id="nav-resume-btn"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.25em] font-semibold border border-[#C5A059] text-[#C5A059] bg-[#141414] hover:bg-[#C5A059] hover:text-[#0F0F0F] transition-all duration-300 shadow-sm"
            title="View & Download Résumé"
          >
            <FileText className="w-3 h-3" />
            <span>Resume</span>
          </button>

          <button
            onClick={onOpenSettings}
            id="nav-settings-btn"
            className="p-2 border border-[#333333] hover:border-[#C5A059]/60 text-[#888888] hover:text-white bg-[#141414] transition-colors"
            title="Appearance & Accessibility Settings"
            aria-label="Settings"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="mobile-menu-toggle-btn"
            className="lg:hidden p-2 text-[#C5A059] bg-[#141414] border border-[#333333] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[64px] bg-[#0F0F0F]/98 border-b border-[#222222] backdrop-blur-2xl px-6 py-6 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="w-full text-left px-4 py-3 text-xs uppercase tracking-[0.2em] font-medium text-[#888888] hover:text-[#C5A059] hover:bg-[#1A1A1A] transition-colors flex items-center justify-between border-b border-[#1A1A1A]"
              >
                <span>{link.label}</span>
                {activeSection === link.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                )}
              </button>
            ))}

            <div className="pt-4 border-t border-[#222222] flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenResume();
                }}
                className="w-full py-3 px-4 text-[11px] uppercase tracking-[0.25em] font-semibold border border-[#C5A059] text-[#C5A059] bg-[#1A1A1A] hover:bg-[#C5A059] hover:text-[#0F0F0F] flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>View Full Résumé</span>
              </button>
              <a
                href={PERSONAL_INFO.currentProject.link}
                target="_blank"
                rel="noreferrer noopener"
                className="w-full py-3 px-4 text-[11px] uppercase tracking-[0.25em] font-semibold bg-[#141414] border border-[#333333] text-[#999999] hover:text-white flex items-center justify-center gap-2 transition-colors"
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
