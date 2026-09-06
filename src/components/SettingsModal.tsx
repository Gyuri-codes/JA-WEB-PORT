import { X, Volume2, VolumeX, Eye, Type, Sparkles, RotateCcw } from 'lucide-react';
import { SettingsState } from '../types';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  onUpdateSettings: (newSettings: Partial<SettingsState>) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onUpdateSettings }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="relative w-full max-w-md bg-[#0F0F0F] text-[#E0E0E0] border border-[#333333] shadow-2xl p-6 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <h2 id="settings-modal-title" className="text-base font-serif italic text-white tracking-wide">
              Display & Experience Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#888888] hover:text-white transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-6 text-sm">
          {/* Audio Feedback */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-serif italic text-white flex items-center gap-2">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-[#C5A059]" /> : <VolumeX className="w-4 h-4 text-[#666666]" />}
                <span>Interactive Sound Feedback</span>
              </div>
              <p className="text-xs text-[#888888] font-light mt-0.5">
                Subtle synth cues on universe warps and actions
              </p>
            </div>
            <button
              onClick={() => {
                const next = !settings.soundEnabled;
                soundManager.enabled = next;
                if (next) soundManager.playSuccess();
                onUpdateSettings({ soundEnabled: next });
              }}
              className={`w-12 h-6 transition-colors relative border border-[#333333] ${settings.soundEnabled ? 'bg-[#C5A059]' : 'bg-[#1A1A1A]'}`}
              aria-label="Toggle Sound Effects"
            >
              <div className={`w-4 h-4 bg-white transition-transform transform absolute top-0.5 ${settings.soundEnabled ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Typography Scale */}
          <div>
            <div className="font-serif italic text-white flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-[#C5A059]" />
              <span>Typography Scale</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-medium">
              {(['compact', 'standard', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => onUpdateSettings({ fontSize: size })}
                  className={`py-2 px-3 border capitalize text-[10px] font-mono uppercase tracking-wider transition-all ${
                    settings.fontSize === size
                      ? 'bg-[#141414] border-[#C5A059] text-[#C5A059] shadow-sm'
                      : 'bg-[#141414] border-[#2a2a2a] text-[#888888] hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-serif italic text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C5A059]" />
                <span>Reduce Motion & Visual FX</span>
              </div>
              <p className="text-xs text-[#888888] font-light mt-0.5">
                Minimizes background particles and floating transitions
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
              className={`w-12 h-6 transition-colors relative border border-[#333333] ${settings.reducedMotion ? 'bg-[#C5A059]' : 'bg-[#1A1A1A]'}`}
              aria-label="Toggle Reduced Motion"
            >
              <div className={`w-4 h-4 bg-white transition-transform transform absolute top-0.5 ${settings.reducedMotion ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Eye Strain Soft Gradient */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-serif italic text-white">
                Eye-Comfort Soft Neutral Contrast
              </div>
              <p className="text-xs text-[#888888] font-light mt-0.5">
                Softens pure blacks to warm neutral dark charcoal
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ themeMode: settings.themeMode === 'dark' ? 'dim' : 'dark' })}
              className={`w-12 h-6 transition-colors relative border border-[#333333] ${settings.themeMode === 'dim' ? 'bg-[#C5A059]' : 'bg-[#1A1A1A]'}`}
              aria-label="Toggle Eye Comfort Contrast"
            >
              <div className={`w-4 h-4 bg-white transition-transform transform absolute top-0.5 ${settings.themeMode === 'dim' ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-[#262626] flex justify-between items-center">
          <button
            onClick={() => onUpdateSettings({
              soundEnabled: false,
              fontSize: 'standard',
              accentColor: '',
              reducedMotion: false,
              themeMode: 'dark'
            })}
            className="text-[10px] font-mono uppercase tracking-wider text-[#888888] hover:text-[#C5A059] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-[10px] uppercase tracking-[0.2em] font-semibold bg-[#C5A059] hover:bg-white text-[#0F0F0F] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
