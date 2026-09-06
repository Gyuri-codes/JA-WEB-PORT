import { useState } from 'react';
import { Sparkles, Compass, ChevronDown, Check } from 'lucide-react';
import { ThemeId } from '../types';
import { THEME_CONFIGS } from '../data/portfolioData';
import { soundManager } from '../utils/audio';

interface ThemeSwitcherProps {
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
}

export function ThemeSwitcher({ currentTheme, onSelectTheme }: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeConfig = THEME_CONFIGS[currentTheme];

  const handleSelect = (id: ThemeId) => {
    if (id !== currentTheme) {
      soundManager.playWarp(id);
      onSelectTheme(id);
    }
    setIsOpen(false);
  };

  const themes: ThemeId[] = ['artistic', 'immortal', 'pixel', 'tactical', 'legendary', 'clash', 'mythic'];

  return (
    <div className="relative inline-block text-left z-40">
      {/* Desktop Ribbon / Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="theme-switcher-toggle"
        className="flex items-center gap-2 px-3.5 py-1.5 border border-[#333333] bg-[#141414] hover:border-[#C5A059] text-xs transition-all duration-300 shadow-md"
        title="Switch Visual Atmosphere"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">{activeConfig.emoji}</span>
        <span className="font-serif italic text-white tracking-wide hidden sm:inline">{activeConfig.name}</span>
        <span className="text-[9px] px-1.5 py-0.5 uppercase font-mono tracking-widest text-[#C5A059] border border-[#C5A059]/40 hidden md:inline">
          Theme
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#888888] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Universe Selection Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setIsOpen(false)} 
          />
          <div 
            className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#0F0F0F] border border-[#333333] shadow-2xl p-2.5 z-40 animate-in fade-in zoom-in-95 duration-200"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="px-3 py-2 border-b border-[#262626] mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-serif italic text-[#E0E0E0]">
                <Compass className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Select Design Theme</span>
              </div>
              <span className="text-[9px] text-[#666666] font-mono uppercase tracking-wider">7 Styles</span>
            </div>

            <div className="space-y-1">
              {themes.map((themeKey) => {
                const conf = THEME_CONFIGS[themeKey];
                const isSelected = currentTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    onClick={() => handleSelect(themeKey)}
                    className={`w-full text-left p-2.5 transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-white'
                        : 'text-[#AAAAAA] hover:bg-[#141414] hover:text-white'
                    }`}
                    style={{
                      borderLeft: isSelected ? `3px solid #C5A059` : '3px solid transparent'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 flex items-center justify-center text-base shrink-0 border border-[#333333] bg-[#141414]"
                      >
                        {conf.emoji}
                      </div>
                      <div>
                        <div className="text-xs font-serif italic flex items-center gap-1.5">
                          <span>{conf.name}</span>
                          {isSelected && (
                            <span className="text-[9px] px-1 font-mono uppercase tracking-wider bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#666666] line-clamp-1 font-light">
                          {conf.subtitle}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#C5A059] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 pt-2 border-t border-[#262626] px-2 flex items-center justify-between text-[10px] text-[#666666] font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#C5A059]" />
                <span>Instant atmospheric switch</span>
              </span>
              <span>No reload</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
