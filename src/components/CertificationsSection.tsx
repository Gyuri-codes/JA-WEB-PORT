import { useState, useEffect } from 'react';
import { Calendar, Building, X, ExternalLink } from 'lucide-react';
import { ThemeId, CertificationItem } from '../types';
import { CERTIFICATIONS, THEME_CONFIGS } from '../data/portfolioData';

interface CertificationsSectionProps {
  currentTheme: ThemeId;
}

// Dedicated Dragon Icon for National Certifications
function DragonIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M19.5 3c-.8 0-1.5.3-2 .8L15.4 6c-.9-.4-2-.6-3.1-.4-1.8.3-3.3 1.6-3.9 3.3-.3.8-.3 1.6-.1 2.4l-4.1 3.2c-.5.4-.8 1-.8 1.6 0 1.2 1 2.2 2.2 2.2h.5l-1.4 1.4c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l2.3-2.3c.4-.4.5-1 .3-1.5l-.8-2 3.6-2.8c.8.3 1.7.4 2.6.2 1.3-.3 2.4-1.2 2.9-2.4l3.1.8c.6.2 1.2 0 1.6-.4.5-.5.6-1.3.2-1.9L20.8 7l1-1.3c.5-.7.4-1.7-.3-2.2-.6-.4-1.3-.6-2-.5zm-1.8 4.2l-.7.9-.9-.2c-.3-.1-.7-.1-1 0-.6.2-1 .6-1.2 1.1-.2.5-.1 1.1.2 1.5l.3.4-3.2 2.5c-.5-.1-1.1-.1-1.6.1-.8.3-1.4.9-1.6 1.7L6.5 17c-.3 0-.5-.2-.5-.5 0-.1 0-.3.1-.4l4.3-3.4c.3-.2.4-.6.3-.9-.4-1.2-.2-2.5.5-3.5.7-1 1.8-1.6 3-1.7.7-.1 1.4.1 2 .4l2.1-2.2c.2-.2.5-.3.8-.3.3 0 .6.1.8.3.3.3.4.7.2 1.1l-.9 1.5z" />
    </svg>
  );
}

export function CertificationsSection({ currentTheme }: CertificationsSectionProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];
  const [popupCert, setPopupCert] = useState<CertificationItem | null>(null);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);

  const rawBase = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
  const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

  const resolveImageUrl = (cert: CertificationItem) => {
    if (cert.image) {
      const clean = cert.image.startsWith('/') ? cert.image.slice(1) : cert.image;
      return `${baseUrl}${clean}`;
    }
    return '';
  };

  const handleDragonClick = (cert: CertificationItem) => {
    setPopupCert(cert);
    setIsEnlarged(false);
    setTimeLeft(5);
  };

  // 5-second auto-disappear timer for the initial popup
  useEffect(() => {
    if (popupCert && !isEnlarged) {
      setTimeLeft(5);
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setPopupCert(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [popupCert, isEnlarged]);

  return (
    <section id="certifications" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] block mb-3 font-medium">
            Accreditation & Competency
          </span>
          <h2 
            className="text-3xl sm:text-5xl font-serif italic font-light text-white tracking-tight"
            style={{ fontFamily: themeConfig.fontHeadline }}
          >
            National Certifications
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#999999] max-w-2xl mx-auto font-light leading-relaxed">
            Accredited qualifications verified by TESDA and Asian College, verifying multi-disciplinary technical mastery in hospitality and culinary arts.
          </p>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CERTIFICATIONS.map((cert) => (
            <div
              key={cert.id}
              className="p-8 bg-[#1A1A1A] border border-[#333333] hover:border-[#C5A059]/60 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group shadow-2xl"
            >
              <div className="absolute inset-0 bg-[#C5A059] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
              {/* Top Row: Authority & Level with Dragon Icon */}
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#262626]">
                  <button
                    type="button"
                    onClick={() => handleDragonClick(cert)}
                    className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-[#141414] border border-[#333333] hover:border-[#C5A059] text-[#C5A059] flex items-center gap-1.5 transition-all cursor-pointer group/dragon"
                    title="Click dragon icon to view national certification"
                    aria-label={`View ${cert.title} certificate`}
                  >
                    <DragonIcon className="w-3.5 h-3.5 text-[#C5A059] group-hover/dragon:scale-110 transition-transform" />
                    <span>{cert.badgeLevel}</span>
                  </button>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#C5A059]" />
                    <span>{cert.date}</span>
                  </span>
                </div>

                <h3 
                  className="text-xl font-serif italic text-white mb-2 leading-snug group-hover:text-[#C5A059] transition-colors"
                  style={{ fontFamily: themeConfig.fontHeadline }}
                >
                  {cert.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-[#C5A059] font-medium mb-4">
                  <Building className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                  <span>Issuing Body: {cert.issuer}</span>
                </div>

                <p className="text-xs text-[#999999] leading-relaxed mb-6 font-light">
                  {cert.description}
                </p>
              </div>

              {/* Status footer with clickable dragon icon action */}
              <div className="pt-4 border-t border-[#262626] flex items-center justify-between text-[10px] relative z-10 font-mono uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => handleDragonClick(cert)}
                  className="flex items-center gap-1.5 text-[#C5A059] hover:underline cursor-pointer group/footer"
                  title="Click dragon icon to view national certification"
                >
                  <DragonIcon className="w-3.5 h-3.5 group-hover/footer:scale-110 transition-transform" />
                  <span>Verified & Current</span>
                </button>
                <span className="text-[#666666]">{cert.badgeLevel.includes('III') ? 'PHILIPPINES NC III' : 'PHILIPPINES NC II'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Second Centered Auto-Disappearing Certification Pop-up */}
      {popupCert && !isEnlarged && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative w-full max-w-lg sm:max-w-xl bg-[#141414] border border-[#C5A059]/70 shadow-2xl p-4 sm:p-5 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pop-up Header */}
            <div className="w-full flex items-center justify-between mb-3 pb-2 border-b border-[#262626]">
              <div className="flex items-center gap-2">
                <DragonIcon className="w-4 h-4 text-[#C5A059]" />
                <div>
                  <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider block">
                    {popupCert.badgeLevel}
                  </span>
                  <h4 className="text-sm font-serif italic text-white leading-tight">
                    {popupCert.title}
                  </h4>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-[#888888] tabular-nums bg-[#1f1f1f] px-2 py-0.5 border border-[#333]">
                  Auto-closes in {timeLeft}s
                </span>
                <button
                  type="button"
                  onClick={() => setPopupCert(null)}
                  className="p-1 text-[#888888] hover:text-white bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#333] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Certification Image: Click to Enlarge */}
            <div 
              onClick={() => setIsEnlarged(true)}
              className="w-full bg-white p-2 border border-[#333333] cursor-zoom-in hover:brightness-105 transition-all group/pop relative flex items-center justify-center shadow-lg overflow-hidden"
              title="Click certification image to view in larger/wider view"
            >
              <img
                src={resolveImageUrl(popupCert)}
                alt={`${popupCert.title} Certificate`}
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[55vh] object-contain drop-shadow"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/pop:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="px-3.5 py-1.5 bg-[#141414]/95 border border-[#C5A059] text-[#C5A059] text-[11px] font-mono uppercase tracking-wider shadow-xl">
                  Click for Larger View
                </span>
              </div>
            </div>

            {/* 5-second countdown progress bar */}
            <div className="w-full bg-[#222222] h-1 mt-3 overflow-hidden">
              <div 
                className="h-full bg-[#C5A059] transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / 5) * 100}%` }}
              />
            </div>

            <div className="mt-2 text-[10px] font-mono text-[#777777] text-center">
              Click image to enlarge • Disappears in 5 seconds
            </div>
          </div>
        </div>
      )}

      {/* Larger / Wider View Modal: Clean & Full Resolution */}
      {popupCert && isEnlarged && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
          onClick={() => {
            setIsEnlarged(false);
            setPopupCert(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative max-w-4xl lg:max-w-5xl w-full max-h-[92vh] bg-[#141414] border border-[#333333] p-3 sm:p-5 shadow-2xl flex flex-col cursor-default animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enlarged View Top Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#262626]">
              <div className="flex items-center gap-2.5">
                <DragonIcon className="w-4 h-4 text-[#C5A059]" />
                <div>
                  <div className="text-[10px] font-mono text-[#C5A059] uppercase tracking-widest">
                    {popupCert.badgeLevel} • {popupCert.issuer}
                  </div>
                  <h3 className="text-base sm:text-xl font-serif italic text-white leading-tight">
                    {popupCert.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEnlarged(false);
                  setPopupCert(null);
                }}
                className="p-2 text-[#888888] hover:text-white bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#333] transition-colors cursor-pointer"
                aria-label="Close enlarged certificate"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Enlarged Full Certificate Image */}
            <div className="overflow-auto flex-1 flex items-center justify-center bg-white p-2 sm:p-4 border border-[#222]">
              <img
                src={resolveImageUrl(popupCert)}
                alt={`${popupCert.title} Certificate`}
                referrerPolicy="no-referrer"
                className="w-full max-h-[75vh] object-contain shadow-md"
              />
            </div>

            {/* Enlarged Footer */}
            <div className="mt-3 pt-2.5 border-t border-[#262626] flex items-center justify-between text-xs text-[#888] font-mono">
              <span className="text-[11px] text-[#aaa]">Click outside image to close</span>
              <a
                href={resolveImageUrl(popupCert)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C5A059] hover:underline flex items-center gap-1.5 text-[11px]"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
