import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Printer, 
  Mail, 
  Phone, 
  MapPin, 
  Download, 
  Check, 
  Award, 
  GraduationCap, 
  Briefcase, 
  Sparkles,
  ChevronDown,
  Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PERSONAL_INFO, EXPERIENCES, CERTIFICATIONS, SKILLS_DATA } from '../data/portfolioData';
import { loadPortraitFromStorage } from '../utils/portraitStorage';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const rawBase = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
  const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const defaultPortrait = `${baseUrl}assets/jeric-portrait.png`;
  const [profilePhoto, setProfilePhoto] = useState<string>(defaultPortrait);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  // Load the exact same profile portrait as used in the About section
  useEffect(() => {
    let isMounted = true;
    const fetchPortrait = async () => {
      try {
        const saved = await loadPortraitFromStorage();
        if (saved && isMounted) {
          setProfilePhoto(saved);
          return;
        }
      } catch {
        // Fallback to default asset
      }
      if (isMounted) {
        setProfilePhoto(defaultPortrait);
      }
    };

    if (isOpen) {
      fetchPortrait();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, defaultPortrait]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePrint = () => {
    setDropdownOpen(false);
    window.print();
  };

  const handleDownloadPDF = async () => {
    setDropdownOpen(false);
    const element = printableAreaRef.current;
    if (!element) return;

    setIsDownloading(true);

    try {
      // Pre-load images inside printable element
      const images: HTMLImageElement[] = Array.from(element.getElementsByTagName('img'));
      await Promise.all(
        images.map(
          (img: HTMLImageElement) =>
            new Promise((resolve) => {
              if (img.complete) resolve(null);
              else {
                img.onload = () => resolve(null);
                img.onerror = () => resolve(null);
              }
            })
        )
      );

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0F0F0F',
        logging: false,
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-resume-sheet="true"]') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.overflow = 'visible';
            clonedElement.style.maxHeight = 'none';
            clonedElement.style.height = 'auto';
            clonedElement.style.width = '960px';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save('Jeric_Abestano_Official_Resume.pdf');
    } catch (err) {
      console.error('PDF export error, falling back to window.print():', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto print-clean-modal">
      <div 
        className="relative w-full max-w-4xl bg-[#0F0F0F] text-[#E0E0E0] rounded-none border border-[#333333] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col print-clean-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-modal-title"
      >
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#141414] sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-pulse" />
            <h2 id="resume-modal-title" className="text-lg font-serif italic text-white tracking-wide">
              Official Résumé — Jeric Abestano
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* PRINT / DOWNLOAD Dropdown Control */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                id="print-download-resume-btn"
                className="px-3.5 py-2 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#333333] bg-[#1A1A1A] hover:border-[#C5A059] text-[#C5A059] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                title="Print or Download Official Résumé"
                aria-expanded={dropdownOpen}
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
                ) : (
                  <Printer className="w-3.5 h-3.5" />
                )}
                <span>PRINT / DOWNLOAD</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-[#161616] border border-[#333333] shadow-2xl z-30 py-1 divide-y divide-[#222222] animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-[#222222] text-[#E0E0E0] hover:text-[#C5A059] transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#C5A059] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-medium tracking-wide">Print Resume</div>
                      <div className="text-[10px] text-[#888888] font-light">Send directly to printer or save via system dialog</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-[#222222] text-[#E0E0E0] hover:text-[#C5A059] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-[#C5A059] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-medium tracking-wide">
                        {isDownloading ? 'Generating PDF...' : 'Download as PDF'}
                      </div>
                      <div className="text-[10px] text-[#888888] font-light">Export clean official PDF file (.pdf)</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              id="close-resume-modal-btn"
              className="p-1.5 text-[#888888] hover:text-white transition-colors cursor-pointer"
              aria-label="Close Résumé Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div 
          ref={printableAreaRef}
          data-resume-sheet="true"
          className="p-6 sm:p-10 overflow-y-auto space-y-8 print:p-0 print:bg-white print:text-black print-clean-sheet"
        >
          {/* Header with Professional Profile Photo */}
          <div className="border-b border-[#262626] pb-6 print:border-black">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Official Profile Photo */}
                <div className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 border border-[#C5A059]/60 bg-[#161616] overflow-hidden shadow-md flex items-center justify-center print:border-zinc-500">
                  <img
                    src={profilePhoto}
                    alt={PERSONAL_INFO.name}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.endsWith('jeric-portrait.png')) {
                        target.src = `${baseUrl}assets/jeric-portrait.png`;
                      }
                    }}
                  />
                </div>

                {/* Name & Academic / Professional Details */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-serif italic text-white print:text-black">
                    {PERSONAL_INFO.name}
                  </h1>
                  <p className="text-[#C5A059] font-light text-sm sm:text-base mt-1 print:text-zinc-700">
                    Hospitality Management · 4th Year Student · Digital Experience Creator
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-[#888888] mt-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Purok Tugas, Cadawinon, Dumaguete City, Negros Oriental</span>
                  </div>
                </div>
              </div>

              {/* Quick Contacts */}
              <div className="flex flex-col gap-1.5 text-xs sm:text-right shrink-0">
                <button
                  onClick={() => copyToClipboard(PERSONAL_INFO.email, 'email')}
                  className="flex items-center gap-1.5 sm:justify-end text-[#CCCCCC] hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{PERSONAL_INFO.email}</span>
                  {copied === 'email' && <Check className="w-3 h-3 text-[#C5A059]" />}
                </button>
                <button
                  onClick={() => copyToClipboard(PERSONAL_INFO.phone, 'phone')}
                  className="flex items-center gap-1.5 sm:justify-end text-[#CCCCCC] hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{PERSONAL_INFO.phone}</span>
                  {copied === 'phone' && <Check className="w-3 h-3 text-[#C5A059]" />}
                </button>
                <span className="text-[#666666] text-[11px] font-mono">Birthplace: Parañaque City</span>
              </div>
            </div>
          </div>

          {/* Career Objective */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-mono border-b border-[#262626] pb-2 mb-3">
              Career Objective
            </h3>
            <p className="text-sm text-[#999999] leading-relaxed font-light">
              {PERSONAL_INFO.careerObjective}
            </p>
          </div>

          {/* Work Experience */}
          <div>
            <div className="flex items-center gap-2 border-b border-[#262626] pb-2 mb-4">
              <Briefcase className="w-4 h-4 text-[#C5A059]" />
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-mono">
                Work Experience (Supervised Industry Learning - SIL)
              </h3>
            </div>
            <div className="space-y-6">
              {EXPERIENCES.map((exp) => (
                <div key={exp.id} className="relative pl-5 border-l border-[#C5A059]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h4 className="text-base font-serif italic text-white">
                      {exp.company}
                    </h4>
                    <span className="text-[10px] font-mono text-[#C5A059] bg-[#1A1A1A] px-2.5 py-0.5 border border-[#333333] w-fit uppercase tracking-widest">
                      {exp.period}
                    </span>
                  </div>
                  <div className="text-xs text-[#888888] font-light mb-2">
                    {exp.role} · {exp.location}
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#AAAAAA] font-light">
                    {exp.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#C5A059] mt-0.5">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <div className="flex items-center gap-2 border-b border-[#262626] pb-2 mb-3">
              <GraduationCap className="w-4 h-4 text-[#C5A059]" />
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-mono">
                Education
              </h3>
            </div>
            <div className="pl-5 border-l border-[#333333]">
              <h4 className="text-base font-serif italic text-white">
                {PERSONAL_INFO.education.institution}
              </h4>
              <p className="text-xs text-[#C5A059] font-light mt-0.5">
                {PERSONAL_INFO.education.degree} ({PERSONAL_INFO.education.status})
              </p>
              <p className="text-xs text-[#888888] mt-1 font-light">
                {PERSONAL_INFO.education.location}
              </p>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <div className="flex items-center gap-2 border-b border-[#262626] pb-2 mb-3">
              <Award className="w-4 h-4 text-[#C5A059]" />
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-mono">
                National Certifications
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CERTIFICATIONS.map((cert) => (
                <div key={cert.id} className="p-4 bg-[#141414] border border-[#2a2a2a]">
                  <div className="text-xs font-serif italic text-white">{cert.title}</div>
                  <div className="text-[10px] text-[#C5A059] mt-0.5 uppercase tracking-wider font-mono">{cert.issuer}</div>
                  <div className="text-[10px] text-[#666666] mt-0.5 font-mono">{cert.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Skills & Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-mono border-b border-[#262626] pb-2 mb-3">
                Core Hospitality Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {SKILLS_DATA.humanCentered.map((skill) => (
                  <span key={skill.name} className="px-2.5 py-1 text-[11px] bg-[#141414] text-[#CCCCCC] border border-[#2a2a2a]">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 border-b border-[#262626] pb-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-mono">
                  Digital & Creative Exploration
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {SKILLS_DATA.digitalCuriosity.map((skill) => (
                  <span key={skill.name} className="px-2.5 py-1 text-[11px] bg-[#141414] text-[#C5A059] border border-[#333333]">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Languages & Personal info */}
          <div className="pt-4 border-t border-[#262626] text-xs text-[#888888] font-light flex flex-wrap justify-between gap-4">
            <div>
              <span className="text-[#C5A059] uppercase font-mono text-[10px] mr-1">Languages:</span> Filipino, English
            </div>
            <div>
              <span className="text-[#C5A059] uppercase font-mono text-[10px] mr-1">Status:</span> Single · Filipino
            </div>
            <div>
              <span className="text-[#C5A059] uppercase font-mono text-[10px] mr-1">Featured Game:</span> Mind Meld
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:px-8 border-t border-[#262626] bg-[#141414] flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-[#888888] font-light">
            Ready to discuss an internship, guest service role, or creative collaboration?
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`mailto:${PERSONAL_INFO.email}?subject=Opportunity%20for%20Jeric%20Abestano`}
              className="px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] font-semibold bg-[#C5A059] hover:bg-white text-[#0F0F0F] transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Directly</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
