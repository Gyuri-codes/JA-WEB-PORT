import { useState, FormEvent } from 'react';
import { Mail, Phone, MapPin, Send, Check, Copy, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { ThemeId } from '../types';
import { PERSONAL_INFO, THEME_CONFIGS } from '../data/portfolioData';
import { soundManager } from '../utils/audio';

interface ContactSectionProps {
  currentTheme: ThemeId;
  onOpenResume: () => void;
}

export function ContactSection({ currentTheme, onOpenResume }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Project Opportunity / Consultation',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [showFallbackHelper, setShowFallbackHelper] = useState(false);

  const themeConfig = THEME_CONFIGS[currentTheme];

  const fullMessageBody = `Name: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    soundManager.playSuccess();
    setSubmitted(true);
    setShowFallbackHelper(true);

    // Launch default email client with populated fields
    const mailtoUrl = `mailto:${PERSONAL_INFO.email}?subject=${encodeURIComponent(
      formData.subject || 'Opportunity for Jeric Abestano'
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    window.location.href = mailtoUrl;
  };

  const copyPreparedMessage = () => {
    navigator.clipboard.writeText(fullMessageBody);
    setCopiedMessage(true);
    soundManager.playClick();
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  const openGmailWeb = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      PERSONAL_INFO.email
    )}&su=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopiedEmail(true);
    soundManager.playClick();
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const copyPhone = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.phone);
    setCopiedPhone(true);
    soundManager.playClick();
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-5xl mx-auto">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] block mb-3 font-medium">
            {themeConfig.terms.contactCta}
          </span>
          <h2 
            className="text-3xl sm:text-5xl font-serif italic font-light text-white tracking-tight"
            style={{ fontFamily: themeConfig.fontHeadline }}
          >
            Have an opportunity worth exploring?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#999999] max-w-2xl mx-auto font-light leading-relaxed">
            Whether you're looking for someone with a strong service mindset, a creative collaborator, or someone eager to explore what AI and technology can make possible, let's start a conversation.
          </p>
        </div>

        {/* Career Objective Spotlight */}
        <div className="mb-14 p-8 bg-[#141414] border border-[#262626] text-center max-w-3xl mx-auto shadow-xl">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C5A059] block mb-2">
            Career Objective
          </span>
          <p className="text-sm sm:text-base text-[#E0E0E0] font-serif italic leading-relaxed">
            "{PERSONAL_INFO.careerObjective}"
          </p>
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Direct Contact Information */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-8 bg-[#1A1A1A] border border-[#333333] shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[#C5A059] opacity-0 pointer-events-none" />
              <h3 className="text-lg font-serif italic text-white mb-6 pb-3 border-b border-[#262626]">
                Direct Channels
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                {/* Email Item */}
                <div className="p-4 bg-[#141414] border border-[#262626] flex items-center justify-between">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="p-2 border border-[#333333] bg-[#1A1A1A] text-[#C5A059] shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-[9px] font-mono text-[#666666] uppercase tracking-wider">Verified Email</div>
                      <a href={`mailto:${PERSONAL_INFO.email}`} className="text-white hover:text-[#C5A059] transition-colors font-light truncate block">
                        {PERSONAL_INFO.email}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={copyEmail}
                    className="p-1.5 text-[#666666] hover:text-[#C5A059] transition-colors ml-2"
                    title="Copy email to clipboard"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-[#C5A059]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Phone Item */}
                <div className="p-4 bg-[#141414] border border-[#262626] flex items-center justify-between">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="p-2 border border-[#333333] bg-[#1A1A1A] text-[#C5A059] shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-[9px] font-mono text-[#666666] uppercase tracking-wider">Phone & Mobile</div>
                      <a href={`tel:${PERSONAL_INFO.phone}`} className="text-white hover:text-[#C5A059] transition-colors font-light truncate block">
                        {PERSONAL_INFO.phone}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={copyPhone}
                    className="p-1.5 text-[#666666] hover:text-[#C5A059] transition-colors ml-2"
                    title="Copy phone to clipboard"
                  >
                    {copiedPhone ? <Check className="w-4 h-4 text-[#C5A059]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Location */}
                <div className="p-4 bg-[#141414] border border-[#262626] flex items-center gap-3.5">
                  <div className="p-2 border border-[#333333] bg-[#1A1A1A] text-[#C5A059] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-mono text-[#666666] uppercase tracking-wider">Location</div>
                    <div className="text-white font-light">
                      Dumaguete City, Negros Oriental, PH
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#262626]">
                <button
                  onClick={onOpenResume}
                  className="w-full py-3.5 px-4 text-[10px] uppercase tracking-[0.25em] font-semibold text-[#C5A059] bg-[#141414] border border-[#333333] hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#0F0F0F] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Inspect Official Résumé</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Quick Conversation Dispatcher */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="p-8 bg-[#1A1A1A] border border-[#333333] shadow-2xl space-y-5"
            >
              <h3 className="text-lg font-serif italic text-white mb-4 pb-3 border-b border-[#262626]">
                Start a Conversation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Lin"
                    className="w-full px-4 py-3 bg-[#141414] border border-[#333333] text-white placeholder-[#555555] text-xs focus:outline-none focus:border-[#C5A059] font-light"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sarah@example.com"
                    className="w-full px-4 py-3 bg-[#141414] border border-[#333333] text-white placeholder-[#555555] text-xs focus:outline-none focus:border-[#C5A059] font-light"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">
                  Subject / Opportunity Type
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-[#141414] border border-[#333333] text-white text-xs focus:outline-none focus:border-[#C5A059] font-light"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">
                  Message / Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell me about the role, project, or collaboration you have in mind..."
                  className="w-full px-4 py-3 bg-[#141414] border border-[#333333] text-white placeholder-[#555555] text-xs focus:outline-none focus:border-[#C5A059] resize-none font-light"
                />
              </div>

              <button
                type="submit"
                id="send-message-cta"
                className="w-full py-4 px-6 font-semibold text-[10px] uppercase tracking-[0.25em] text-[#0F0F0F] bg-[#C5A059] border border-[#C5A059] hover:bg-transparent hover:text-[#C5A059] transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitted ? 'Email Client Triggered' : 'Dispatch Inquiry to Jeric'}</span>
              </button>

              {showFallbackHelper && (
                <div className="p-4 bg-[#141414] border border-[#C5A059]/40 animate-in fade-in duration-300 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-[#C5A059] font-medium">
                    <span>Email client didn't open?</span>
                    <button
                      type="button"
                      onClick={() => setShowFallbackHelper(false)}
                      className="text-[#888888] hover:text-white text-[10px] uppercase font-mono"
                    >
                      Dismiss
                    </button>
                  </div>
                  <p className="text-[#999999] text-[11px] leading-relaxed">
                    No problem. You can copy your prepared message to paste into any email service, or launch Gmail in your browser:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={copyPreparedMessage}
                      className="px-3 py-1.5 bg-[#1A1A1A] border border-[#333333] hover:border-[#C5A059] text-white text-[10px] uppercase font-mono tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      {copiedMessage ? <Check className="w-3 h-3 text-[#C5A059]" /> : <Copy className="w-3 h-3 text-[#C5A059]" />}
                      <span>{copiedMessage ? 'Message Copied!' : 'Copy Formatted Message'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={openGmailWeb}
                      className="px-3 py-1.5 bg-[#1A1A1A] border border-[#333333] hover:border-[#C5A059] text-[#C5A059] text-[10px] uppercase font-mono tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Open in Gmail Web</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="text-[10px] font-mono text-[#666666] uppercase tracking-wider text-center pt-2">
                Sends directly to <strong className="text-[#C5A059]">{PERSONAL_INFO.email}</strong>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
