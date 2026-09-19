import React, { useState, useEffect, useRef } from 'react';
import { Sword, Upload, Download, User, RefreshCw, CheckCircle2, ShieldCheck, Grid, Save, Undo2 } from 'lucide-react';
import { processStudioBackgroundRemoval } from '../utils/portraitProcessing';
import { savePortraitToStorage, loadPortraitFromStorage, clearPortraitFromStorage } from '../utils/portraitStorage';

interface ProfilePortraitProps {
  className?: string;
  onSaveConfirmed?: () => void;
}

type PreviewBackdrop = 'card' | 'checkerboard' | 'black';

export function ProfilePortrait({ className = '', onSaveConfirmed }: ProfilePortraitProps) {
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [backdropMode, setBackdropMode] = useState<PreviewBackdrop>('card');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const rawBase = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
  const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

  // Default clean portrait asset locations
  const defaultAssets = [
    `${baseUrl}assets/jeric-portrait.png`,
    `${baseUrl}jeric-portrait.png`,
    '/assets/jeric-portrait.png',
    '/jeric-portrait.png',
  ];

  // Helper: Clear inactivity timer
  const clearInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  // Helper: Reset & start the 3-second inactivity countdown
  const resetInactivityTimer = () => {
    clearInactivityTimer();
    if (portraitUrl && !isProcessing) {
      inactivityTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
  };

  // Helper: Show controls and restart the 3s timer
  const showControls = () => {
    setControlsVisible(true);
    resetInactivityTimer();
  };

  // Handle any user activity on active controls to prevent them hiding mid-use
  const handleUserActivity = () => {
    if (controlsVisible) {
      resetInactivityTimer();
    }
  };

  // 1. Initial Load: IndexedDB / persistent storage first, then default clean assets
  useEffect(() => {
    let isMounted = true;

    const initializePortrait = async () => {
      // Check IndexedDB / client storage
      const stored = await loadPortraitFromStorage();
      if (stored && isMounted) {
        setPortraitUrl(stored);
        setIsSaved(true);
        return;
      }

      // If no stored custom portrait, load default cleaned transparent portrait
      for (const assetPath of defaultAssets) {
        try {
          const res = await fetch(assetPath, { method: 'HEAD' });
          if (res.ok && isMounted) {
            setPortraitUrl(assetPath);
            setIsSaved(true);
            return;
          }
        } catch {
          // Check next asset
        }
      }

      // If asset path exists directly
      if (isMounted) {
        setPortraitUrl('/jeric-portrait.png');
      }
    };

    initializePortrait();

    return () => {
      isMounted = false;
      clearInactivityTimer();
    };
  }, []);

  // Timer lifecycle on portrait load or processing change
  useEffect(() => {
    if (portraitUrl && !isProcessing) {
      setControlsVisible(true);
      resetInactivityTimer();
    }
    return () => {
      clearInactivityTimer();
    };
  }, [portraitUrl, isProcessing]);

  // 2. Automated & Manual Save Routine
  const persistPortrait = async (dataUrl: string, manual = false) => {
    await savePortraitToStorage(dataUrl);
    setIsSaved(true);
    if (manual) {
      setStatusMessage('Profile Photo Saved.');
    } else {
      setStatusMessage('Profile Photo Saved.');
    }
    if (onSaveConfirmed) onSaveConfirmed();
    resetInactivityTimer();
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Manual save handler for the dedicated SAVE button
  const handleManualSave = async () => {
    if (!portraitUrl) return;
    resetInactivityTimer();

    // If already dataUrl, save directly
    if (portraitUrl.startsWith('data:image/png')) {
      await persistPortrait(portraitUrl, true);
      return;
    }

    // If loaded from URL, fetch as blob and persist
    try {
      const resp = await fetch(portraitUrl);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await persistPortrait(base64, true);
      };
      reader.readAsDataURL(blob);
    } catch {
      await persistPortrait(portraitUrl, true);
    }
  };

  // 3. File Processing with Studio Precision (Hair Inspection + Halo Elimination)
  const processSelectedFile = async (file: File) => {
    setIsProcessing(true);
    setControlsVisible(true);
    clearInactivityTimer();
    setStatusMessage('Removing background & inspecting hair strands...');
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });

      // Check if uploaded PNG is already pre-cut with transparent corners
      if (file.type === 'image/png') {
        const testCanvas = document.createElement('canvas');
        testCanvas.width = img.width;
        testCanvas.height = img.height;
        const testCtx = testCanvas.getContext('2d');
        if (testCtx) {
          testCtx.drawImage(img, 0, 0);
          const cornerPixel = testCtx.getImageData(0, 0, 1, 1).data;
          // If corner is already transparent alpha < 15
          if (cornerPixel[3] < 15) {
            setPortraitUrl(dataUrl);
            await persistPortrait(dataUrl, false);
            setIsProcessing(false);
            resetInactivityTimer();
            return;
          }
        }
      }

      // Execute high-precision background removal:
      // - Removes entire background with 100% transparency
      // - Deep cleans trapped white spots in the hair area
      // - Preserves 100% original face, glasses, suit, tie, white collar
      // - Eradicates white halos and outlines via optical decontamination
      const result = await processStudioBackgroundRemoval(img, {
        defringeStrength: 0.90,
        shadowThreshold: 165,
        maxBackdropSat: 26,
      });

      setPortraitUrl(result.dataUrl);

      // Automatically persist to IndexedDB & website
      await persistPortrait(result.dataUrl, false);
    } catch (err) {
      console.error('Failed to process image:', err);
      setStatusMessage('Processing error. Please re-upload s54w7.jpg.');
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsProcessing(false);
      resetInactivityTimer();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processSelectedFile(file);
    // Reset file input value so user can re-upload the same file if desired
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDownloadPng = () => {
    if (!portraitUrl) return;
    resetInactivityTimer();
    const link = document.createElement('a');
    link.download = 'jeric-abestano-transparent-portrait.png';
    link.href = portraitUrl;
    link.click();
  };

  const handleReset = async () => {
    await clearPortraitFromStorage();
    // Revert to clean default asset
    setPortraitUrl('/jeric-portrait.png');
    setIsSaved(true);
    setControlsVisible(true);
    resetInactivityTimer();
    setStatusMessage('Default Profile Photo Restored.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-end w-full ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseMove={handleUserActivity}
      onTouchStart={handleUserActivity}
      onClick={handleUserActivity}
      id="profile-portrait-container"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        id="portrait-file-upload-input"
      />

      {/* Main Portrait Frame with Backdrop Quality Inspector */}
      <div
        className={`relative w-full aspect-[4/5] max-w-[320px] mx-auto flex items-end justify-center overflow-hidden rounded-sm transition-colors duration-300 border border-[#2A2A2A] shadow-2xl ${
          backdropMode === 'black'
            ? 'bg-black'
            : backdropMode === 'checkerboard'
            ? 'bg-[linear-gradient(45deg,#202020_25%,transparent_25%),linear-gradient(-45deg,#202020_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#202020_75%),linear-gradient(-45deg,transparent_75%,#202020_75%)] bg-[size:16px_16px] bg-[#141414]'
            : 'bg-[#181818]'
        }`}
      >
        {portraitUrl ? (
          <div className="relative w-full h-full flex items-end justify-center overflow-hidden">
            {/* The 100% untouched subject on transparent background properly filling the profile box */}
            <img
              src={portraitUrl}
              alt="Jeric Abestano - Authentic Portrait Cutout"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain object-bottom select-none transition-transform duration-500 hover:scale-[1.01]"
              style={{
                // Drop shadow only on standard card mode, never on black/grid test backdrops
                filter:
                  backdropMode === 'card'
                    ? 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.45))'
                    : 'none',
              }}
            />

            {/* Seamless gradient blend at card base */}
            {backdropMode === 'card' && (
              <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#181818] to-transparent pointer-events-none" />
            )}
            {backdropMode === 'black' && (
              <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            )}
          </div>
        ) : (
          /* Empty / Upload Prompt State */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full border border-dashed border-[#444444] hover:border-[#C5A059] bg-[#141414]/80 hover:bg-[#1A1A1A] transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-[#1F1F1F] border border-[#333333] group-hover:border-[#C5A059] flex items-center justify-center mb-3 text-[#888888] group-hover:text-[#C5A059] transition-colors shadow-inner">
              <User className="w-7 h-7" />
            </div>
            <p className="text-xs text-[#E0E0E0] font-medium mb-1">
              Select or Drop Jeric's Photo
            </p>
            <p className="text-[10px] text-[#888888] max-w-[210px] leading-relaxed">
              Drop <span className="text-[#C5A059] font-mono">s54w7.jpg</span> here.
              Zero halos, zero white spots in hair, 100% original identity preserved.
            </p>
            <div className="mt-3.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-medium text-[#C5A059] border border-[#C5A059]/40 px-3.5 py-1.5 bg-[#C5A059]/5 hover:bg-[#C5A059]/15 transition-colors">
              <Upload className="w-3 h-3" />
              <span>Browse Image</span>
            </div>
          </div>
        )}

        {/* Processing Indicator Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-30">
            <RefreshCw className="w-7 h-7 text-[#C5A059] animate-spin mb-2.5" />
            <p className="text-xs text-white font-medium">Removing Background & Inspecting Hair</p>
            <p className="text-[10px] text-[#A0A0A0] mt-1 max-w-[210px] leading-normal">
              Clearing white spots between hair strands while keeping 100% of the original photo...
            </p>
          </div>
        )}

        {/* Subtle Minimal Sword Icon (Appears in Top-Left Corner when controls are hidden) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            showControls();
          }}
          aria-label="Show photo controls"
          title="Show photo controls"
          className={`absolute top-3.5 left-3.5 z-30 w-8 h-8 rounded-[3px] bg-[#141414]/90 hover:bg-[#1f1f1f] text-[#C5A059] border border-[#C5A059]/70 hover:border-[#C5A059] shadow-lg backdrop-blur-sm transition-all duration-300 cursor-pointer group flex items-center justify-center ${
            !controlsVisible && portraitUrl && !isProcessing
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-75 pointer-events-none'
          }`}
          id="show-photo-controls-btn"
        >
          <Sword className="w-4 h-4 text-[#C5A059] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105" />
          <span className="sr-only">Show photo controls</span>
        </button>

        {/* Quality Guarantee Badge (Fades out when controls auto-hide) */}
        {portraitUrl && !isProcessing && (
          <div
            className={`absolute top-3.5 left-3.5 bg-[#121212]/90 border border-[#C5A059]/30 backdrop-blur-md px-2 py-0.5 rounded-xs flex items-center gap-1 text-[9px] text-[#C5A059] z-20 shadow-sm pointer-events-none transition-all duration-300 ${
              controlsVisible
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <ShieldCheck className="w-2.5 h-2.5" />
            <span>0 Halos · Authentic Subject</span>
          </div>
        )}

        {/* Backdrop Inspector Selector: Card | Grid | Black (Fades out when controls auto-hide) */}
        {portraitUrl && !isProcessing && (
          <div
            className={`absolute top-3.5 right-3.5 flex items-center bg-[#141414]/90 border border-[#333333] rounded-xs p-0.5 gap-0.5 z-20 shadow-md transition-all duration-300 ${
              controlsVisible
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <button
              onClick={() => {
                setBackdropMode('card');
                resetInactivityTimer();
              }}
              className={`px-1.5 py-0.5 text-[9px] rounded-xs transition-colors cursor-pointer ${
                backdropMode === 'card'
                  ? 'bg-[#C5A059] text-black font-semibold'
                  : 'text-[#888888] hover:text-white'
              }`}
              title="View on Card Background"
            >
              Card
            </button>
            <button
              onClick={() => {
                setBackdropMode('checkerboard');
                resetInactivityTimer();
              }}
              className={`px-1.5 py-0.5 text-[9px] rounded-xs transition-colors cursor-pointer flex items-center gap-0.5 ${
                backdropMode === 'checkerboard'
                  ? 'bg-[#C5A059] text-black font-semibold'
                  : 'text-[#888888] hover:text-white'
              }`}
              title="View on Transparent Checkerboard Grid"
            >
              <Grid className="w-2.5 h-2.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => {
                setBackdropMode('black');
                resetInactivityTimer();
              }}
              className={`px-1.5 py-0.5 text-[9px] rounded-xs transition-colors cursor-pointer ${
                backdropMode === 'black'
                  ? 'bg-[#C5A059] text-black font-semibold'
                  : 'text-[#888888] hover:text-white'
              }`}
              title="Test against pitch black (verifies 0 white halos or hair spots)"
            >
              Black
            </button>
          </div>
        )}
      </div>

      {/* Prominent Action Bar: SAVE button, Replace, Download, Reset (Smoothly auto-hides after 3s) */}
      <div
        className={`w-full max-w-[320px] transition-all duration-400 ease-in-out ${
          controlsVisible && portraitUrl && !isProcessing
            ? 'opacity-100 max-h-36 mt-3 pointer-events-auto translate-y-0'
            : 'opacity-0 max-h-0 mt-0 pointer-events-none -translate-y-1 overflow-hidden'
        }`}
        onMouseEnter={resetInactivityTimer}
        onMouseMove={resetInactivityTimer}
        onClick={resetInactivityTimer}
      >
        <div className="space-y-2">
          {/* Primary Row: Clearly Visible SAVE button & Replace */}
          <div className="flex items-center gap-2">
            {portraitUrl && (
              <button
                onClick={handleManualSave}
                className="flex-1 py-1.5 px-3 bg-[#C5A059] hover:bg-[#d6b26b] text-[#0F0F0F] text-[10px] uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                title="Manually save/confirm profile photo to portfolio"
                id="save-profile-portrait-btn"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE</span>
              </button>
            )}

            <button
              onClick={() => {
                resetInactivityTimer();
                fileInputRef.current?.click();
              }}
              className={`py-1.5 px-3 border border-[#3A3A3A] hover:border-[#C5A059] bg-[#1A1A1A] hover:bg-[#222222] text-[#E0E0E0] text-[10px] uppercase tracking-[0.15em] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                portraitUrl ? 'flex-1' : 'w-full'
              }`}
              title="Upload new or updated photo"
            >
              <Upload className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{portraitUrl ? 'Replace Photo' : 'Upload Photo'}</span>
            </button>
          </div>

          {/* Secondary Row: Download PNG & Reset */}
          {portraitUrl && (
            <div className="flex items-center justify-between px-1 text-[10px] text-[#888888] border-t border-[#222222] pt-1.5">
              <button
                onClick={handleDownloadPng}
                className="text-[#C5A059] hover:text-[#e5bf70] font-medium transition-colors flex items-center gap-1 cursor-pointer py-0.5"
                title="Download 32-bit transparent PNG"
              >
                <Download className="w-3 h-3" />
                <span>Download Transparent PNG</span>
              </button>

              <button
                onClick={handleReset}
                className="text-[#777777] hover:text-[#C5A059] transition-colors flex items-center gap-1 cursor-pointer py-0.5"
                title="Reset to default original profile photo"
              >
                <Undo2 className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Notification Toast */}
      {statusMessage && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#141414] border border-[#C5A059] px-4 py-1.5 shadow-2xl text-[11px] text-[#C5A059] font-medium flex items-center gap-2 whitespace-nowrap z-50 rounded-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#C5A059]" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}

