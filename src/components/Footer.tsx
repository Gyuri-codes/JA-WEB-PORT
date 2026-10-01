import { ArrowUp, Gamepad2, Mail, FileText } from 'lucide-react';
import { ThemeId, NavSectionId } from '../types';
import { PERSONAL_INFO, THEME_CONFIGS } from '../data/portfolioData';
import { NAV_LINKS } from './Navigation';

interface FooterProps {
  currentTheme: ThemeId;
  onOpenResume: () => void;
  onNavigate?: (section: NavSectionId) => void;
}

export function Footer({ currentTheme, onOpenResume, onNavigate }: FooterProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 border-t border-[#222222] bg-[#0A0A0A] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-[#222222]">
          {/* Brand & Tagline */}
          <div>
            <span 
              className="text-2xl font-serif italic text-white tracking-wide block"
              style={{ fontFamily: themeConfig.fontHeadline }}
            >
              {PERSONAL_INFO.name}
            </span>
            <p className="text-xs text-[#C5A059] font-mono uppercase tracking-[0.25em] mt-1.5">
              “Hospitality × Creativity × Technology”
            </p>
            <p className="text-xs text-[#888888] font-light mt-2 max-w-sm">
              Bachelor of Science in Hospitality Management · Asian College Dumaguete
            </p>
          </div>

          {/* Links & Actions */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-xs text-[#999999]">
            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              className="hover:text-[#C5A059] flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{PERSONAL_INFO.email}</span>
            </a>

            <a
              href={PERSONAL_INFO.currentProject.link}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-white flex items-center gap-1.5 font-semibold text-[#C5A059] uppercase tracking-[0.2em] transition-colors"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>PLAY THE GAME →</span>
            </a>

            <button
              onClick={onOpenResume}
              className="hover:text-[#C5A059] transition-colors uppercase tracking-wider font-mono text-[11px] cursor-pointer"
            >
              View Résumé
            </button>

            <button
              onClick={scrollToTop}
              className="p-2.5 border border-[#333333] bg-[#141414] text-[#C5A059] hover:border-[#C5A059] transition-colors cursor-pointer"
              title="Back to Top"
              aria-label="Back to Top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Section Quick Switcher Links in Footer */}
        {onNavigate && (
          <div className="py-6 border-b border-[#1C1C1C] flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[10px] uppercase font-mono tracking-widest text-[#777777]">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavigate(link.id)}
                className="hover:text-[#C5A059] transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Bar with Required Closing Statement */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666]">
          <p>© 2026 Jeric Abestano. All rights reserved.</p>
          <p className="text-[#C5A059] font-serif italic text-sm">
            “Built with curiosity. Designed for people.”
          </p>
        </div>
      </div>
    </footer>
  );
}
