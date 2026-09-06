import { useState } from 'react';
import { X, Printer, Mail, Phone, MapPin, Download, Check, Award, GraduationCap, Briefcase, Sparkles } from 'lucide-react';
import { PERSONAL_INFO, EXPERIENCES, CERTIFICATIONS, SKILLS_DATA } from '../data/portfolioData';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#0F0F0F] text-[#E0E0E0] rounded-none border border-[#333333] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-modal-title"
      >
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#141414] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-pulse" />
            <h2 id="resume-modal-title" className="text-lg font-serif italic text-white tracking-wide">
              Official Résumé — Jeric Abestano
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="print-resume-btn"
              className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#333333] bg-[#1A1A1A] hover:border-[#C5A059] text-[#C5A059] transition-colors flex items-center gap-1.5"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              id="close-resume-modal-btn"
              className="p-1.5 text-[#888888] hover:text-white transition-colors"
              aria-label="Close Résumé Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-8 print:p-0 print:bg-white print:text-black">
          {/* Header */}
          <div className="border-b border-[#262626] pb-6 print:border-black">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-serif italic text-white print:text-black">
                  {PERSONAL_INFO.name}
                </h1>
                <p className="text-[#C5A059] font-light text-base mt-1 print:text-zinc-700">
                  Hospitality Management · 4th Year Student · Digital Experience Creator
                </p>
                <div className="flex items-center gap-1.5 text-xs text-[#888888] mt-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Purok Tugas, Cadawinon, Dumaguete City, Negros Oriental</span>
                </div>
              </div>

              {/* Quick Contacts */}
              <div className="flex flex-col gap-1.5 text-xs sm:text-right">
                <button
                  onClick={() => copyToClipboard(PERSONAL_INFO.email, 'email')}
                  className="flex items-center gap-1.5 sm:justify-end text-[#CCCCCC] hover:text-[#C5A059] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{PERSONAL_INFO.email}</span>
                  {copied === 'email' && <Check className="w-3 h-3 text-[#C5A059]" />}
                </button>
                <button
                  onClick={() => copyToClipboard(PERSONAL_INFO.phone, 'phone')}
                  className="flex items-center gap-1.5 sm:justify-end text-[#CCCCCC] hover:text-[#C5A059] transition-colors"
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
                National Certifications (NC II)
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
        <div className="p-4 sm:px-8 border-t border-[#262626] bg-[#141414] flex flex-wrap items-center justify-between gap-3">
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
