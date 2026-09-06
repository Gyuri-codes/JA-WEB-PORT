import { useState, useEffect } from 'react';
import { ThemeId, SettingsState } from './types';
import { THEME_CONFIGS } from './data/portfolioData';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ExperienceSection } from './components/ExperienceSection';
import { SkillsSection } from './components/SkillsSection';
import { CertificationsSection } from './components/CertificationsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { HorrorGameSection } from './components/HorrorGameSection';
import { MindMeldSection } from './components/MindMeldSection';
import { HowIThinkSection } from './components/HowIThinkSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ResumeModal } from './components/ResumeModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('artistic');
  const [isWarping, setIsWarping] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [settings, setSettings] = useState<SettingsState>({
    soundEnabled: false,
    fontSize: 'standard',
    accentColor: '',
    reducedMotion: false,
    themeMode: 'dark',
  });

  const activeThemeConfig = THEME_CONFIGS[currentTheme];

  // Handle universe warp animation
  const handleSelectTheme = (newTheme: ThemeId) => {
    if (newTheme === currentTheme) return;
    setIsWarping(true);
    setTimeout(() => {
      setCurrentTheme(newTheme);
      setTimeout(() => {
        setIsWarping(false);
      }, 400);
    }, 250);
  };

  const handleUpdateSettings = (newSettings: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Compute theme background atmosphere classes
  const getThemeBackground = () => {
    if (settings.themeMode === 'dim') {
      return 'bg-[#181a20]';
    }
    switch (currentTheme) {
      case 'artistic':
        return 'bg-[#0F0F0F]';
      case 'immortal':
        return 'bg-gradient-to-b from-[#090b14] via-[#0f1224] to-[#080911]';
      case 'pixel':
        return 'bg-[#0f1715]';
      case 'tactical':
        return 'bg-[#090a0d]';
      case 'legendary':
        return 'bg-gradient-to-b from-[#0d0d14] via-[#16121f] to-[#0c0c12]';
      case 'clash':
        return 'bg-gradient-to-b from-[#161821] via-[#1c1a26] to-[#12131a]';
      case 'mythic':
      default:
        return 'bg-gradient-to-b from-[#120a0d] via-[#170e13] to-[#0d090b]';
    }
  };

  const fontSizeClass =
    settings.fontSize === 'large'
      ? 'text-lg'
      : settings.fontSize === 'compact'
      ? 'text-sm'
      : 'text-base';

  return (
    <div
      className={`min-h-screen relative text-[#E0E0E0] transition-colors duration-700 selection:bg-[#C5A059]/30 selection:text-white ${getThemeBackground()} ${fontSizeClass}`}
      style={{ fontFamily: activeThemeConfig.fontBody }}
    >
      {/* Subtle Dot Grid Background Overlay from Artistic Flair design */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-10 artistic-dot-matrix" 
        aria-hidden="true" 
      />

      {/* Dynamic Animated Procedural Canvas */}
      <BackgroundCanvas
        theme={currentTheme}
        reducedMotion={settings.reducedMotion}
      />

      {/* Universe Warp Portal Overlay on Theme Shift */}
      {isWarping && (
        <div
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        >
          <div className="text-center p-6 rounded-3xl bg-zinc-900/90 border border-white/20 shadow-2xl scale-110 transform transition-transform">
            <div className="text-4xl mb-2 animate-bounce">
              {activeThemeConfig.emoji}
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Entering Realm
            </div>
            <div className="text-lg font-bold text-white mt-1">
              {activeThemeConfig.name}
            </div>
          </div>
        </div>
      )}

      {/* Main Persistent Navigation */}
      <Navigation
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        onOpenResume={() => setResumeOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Core Portfolio Sections */}
      <main className="relative z-10">
        <HeroSection
          currentTheme={currentTheme}
          onOpenResume={() => setResumeOpen(true)}
        />
        <AboutSection
          currentTheme={currentTheme}
          onOpenResume={() => setResumeOpen(true)}
        />
        <ExperienceSection currentTheme={currentTheme} />
        <SkillsSection currentTheme={currentTheme} />
        <CertificationsSection currentTheme={currentTheme} />
        <ProjectsSection currentTheme={currentTheme} />
        <HorrorGameSection currentTheme={currentTheme} />
        <MindMeldSection currentTheme={currentTheme} />
        <HowIThinkSection currentTheme={currentTheme} />
        <ContactSection
          currentTheme={currentTheme}
          onOpenResume={() => setResumeOpen(true)}
        />
      </main>

      {/* Required Brand Footer */}
      <Footer
        currentTheme={currentTheme}
        onOpenResume={() => setResumeOpen(true)}
      />

      {/* Interactive Official Résumé Viewer & PDF Modal */}
      <ResumeModal
        isOpen={resumeOpen}
        onClose={() => setResumeOpen(false)}
      />

      {/* Accessibility & Customization Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
