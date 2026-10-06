import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Building, X, ExternalLink, Upload, Trash2, CheckCircle2, Save, RefreshCw, Undo2 } from 'lucide-react';
import { ThemeId, CertificationItem } from '../types';
import { CERTIFICATIONS, THEME_CONFIGS } from '../data/portfolioData';
import {
  getStoredCertificationsSync,
  fetchStoredCertifications,
  saveCertificationImage,
  removeCertificationImage,
  resetCertificationImage,
  resolveCertUrl,
  getDefaultCertImageUrl,
  getFallbackCertImageUrl,
  CERT_UPDATE_EVENT,
  StoredCertification,
} from '../utils/certificationStorage';

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

  // Replace certification image modal state
  const [replaceModalCert, setReplaceModalCert] = useState<CertificationItem | null>(null);
  const [isDragOverReplace, setIsDragOverReplace] = useState(false);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Stored certifications state: initialized synchronously with permanent data + localStorage
  const [storedCerts, setStoredCerts] = useState<Record<string, StoredCertification>>(() => {
    return getStoredCertificationsSync();
  });

  // Pending uploaded image dataUrls before/during save
  const [pendingImages, setPendingImages] = useState<Record<string, string>>({});
  // Save button states per cert: 'pending' (uploaded, waiting to save) | 'saving' | 'saved'
  const [saveStates, setSaveStates] = useState<Record<string, 'pending' | 'saving' | 'saved'>>({});
  const saveTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimersRef.current).forEach((timer: any) => clearTimeout(timer));
    };
  }, []);

  // Sync with server API on mount and listen to global updates
  useEffect(() => {
    let isMounted = true;
    fetchStoredCertifications().then((data) => {
      if (isMounted) setStoredCerts(data);
    });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Record<string, StoredCertification>>;
      if (customEvent.detail) {
        setStoredCerts({ ...customEvent.detail });
      } else {
        setStoredCerts(getStoredCertificationsSync());
      }
    };

    window.addEventListener(CERT_UPDATE_EVENT, handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener(CERT_UPDATE_EVENT, handleUpdate);
    };
  }, []);

  const handleImageUpload = (certId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear any active timer for this certificate
    if (saveTimersRef.current[certId]) {
      clearTimeout(saveTimersRef.current[certId]);
      delete saveTimersRef.current[certId];
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        // Show exact untouched uploaded image in its original form and appearance
        setPendingImages((prev) => ({ ...prev, [certId]: dataUrl }));
        // Reveal the SAVE button for this certificate
        setSaveStates((prev) => ({ ...prev, [certId]: 'pending' }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveCertImage = async (certId: string) => {
    const dataUrl = pendingImages[certId] || storedCerts[certId]?.dataUrl || storedCerts[certId]?.imageUrl;
    if (!dataUrl) return;

    const certMeta = CERTIFICATIONS.find((c) => c.id === certId);
    setSaveStates((prev) => ({ ...prev, [certId]: 'saving' }));

    try {
      const savedItem = await saveCertificationImage(certId, dataUrl, {
        title: certMeta?.title,
        issuer: certMeta?.issuer,
        badgeLevel: certMeta?.badgeLevel,
        description: certMeta?.description,
        date: certMeta?.date,
      });

      setStoredCerts((prev) => ({ ...prev, [certId]: savedItem }));
      setSaveStates((prev) => ({ ...prev, [certId]: 'saved' }));

      // Automatically hide the Save button after exactly 3 seconds
      if (saveTimersRef.current[certId]) {
        clearTimeout(saveTimersRef.current[certId]);
      }
      saveTimersRef.current[certId] = setTimeout(() => {
        setSaveStates((prev) => {
          const next = { ...prev };
          delete next[certId];
          return next;
        });
        setPendingImages((prev) => {
          const next = { ...prev };
          delete next[certId];
          return next;
        });
      }, 3000);
    } catch (err) {
      console.error('Failed to save certification image:', err);
      setSaveStates((prev) => ({ ...prev, [certId]: 'pending' }));
    }
  };

  const handleRemoveImage = async (certId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (saveTimersRef.current[certId]) {
      clearTimeout(saveTimersRef.current[certId]);
      delete saveTimersRef.current[certId];
    }
    setPendingImages((prev) => {
      const next = { ...prev };
      delete next[certId];
      return next;
    });
    setSaveStates((prev) => {
      const next = { ...prev };
      delete next[certId];
      return next;
    });
    try {
      await removeCertificationImage(certId);
      setStoredCerts((prev) => {
        const next = { ...prev };
        delete next[certId];
        return next;
      });
    } catch (err) {
      console.error('Failed to remove certification image:', err);
    }
    if (popupCert?.id === certId) {
      setPopupCert(null);
      setIsEnlarged(false);
    }
  };

  const handleResetCertImage = async (certId: string) => {
    if (saveTimersRef.current[certId]) {
      clearTimeout(saveTimersRef.current[certId]);
      delete saveTimersRef.current[certId];
    }
    setPendingImages((prev) => {
      const next = { ...prev };
      delete next[certId];
      return next;
    });
    setSaveStates((prev) => {
      const next = { ...prev };
      delete next[certId];
      return next;
    });
    const defaultItem = await resetCertificationImage(certId);
    setStoredCerts((prev) => ({ ...prev, [certId]: defaultItem }));
  };

  const handlePreviewClick = (cert: CertificationItem) => {
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

  // Close replace modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && replaceModalCert) {
        setReplaceModalCert(null);
      }
    };
    if (replaceModalCert) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [replaceModalCert]);

  const activeModalImage = popupCert
    ? pendingImages[popupCert.id] ||
      resolveCertUrl(storedCerts[popupCert.id]?.imageUrl || storedCerts[popupCert.id]?.dataUrl) ||
      (popupCert.image ? resolveCertUrl(popupCert.image) : '') ||
      getDefaultCertImageUrl(popupCert.id)
    : undefined;

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
          {CERTIFICATIONS.map((cert) => {
            const currentImg =
              pendingImages[cert.id] ||
              resolveCertUrl(storedCerts[cert.id]?.imageUrl || storedCerts[cert.id]?.dataUrl) ||
              (cert.image ? resolveCertUrl(cert.image) : '') ||
              getDefaultCertImageUrl(cert.id);

            return (
              <div
                key={cert.id}
                className="p-8 bg-[#1A1A1A] border border-[#333333] hover:border-[#C5A059]/60 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group shadow-2xl"
              >
                <div className="absolute inset-0 bg-[#C5A059] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                
                {/* Top Details & Upload Area */}
                <div className="relative z-10 flex-1 flex flex-col">
                  {/* Top Row: Authority & Level with Dragon Icon */}
                  <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#262626]">
                    <button
                      type="button"
                      onClick={() => handlePreviewClick(cert)}
                      className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-[#141414] border border-[#333333] hover:border-[#C5A059] text-[#C5A059] flex items-center gap-1.5 transition-all cursor-pointer group/dragon"
                      title="Click dragon icon to view certification"
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

                  <div className="flex items-center gap-1.5 text-xs text-[#C5A059] font-medium mb-3">
                    <Building className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                    <span>Issuing Body: {cert.issuer}</span>
                  </div>

                  {/* Individual Image Upload Field & Display */}
                  <div className="my-4">
                    {!currentImg ? (
                      <div>
                        <input
                          type="file"
                          id={`upload-cert-${cert.id}`}
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleImageUpload(cert.id, e)}
                        />
                        <label
                          htmlFor={`upload-cert-${cert.id}`}
                          className="w-full h-44 sm:h-48 border-2 border-dashed border-[#333333] hover:border-[#C5A059] bg-[#141414] hover:bg-[#1a1a1a] transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-4 text-center group/uploader select-none"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#1c1c1c] border border-[#333333] group-hover/uploader:border-[#C5A059] flex items-center justify-center mb-2.5 text-[#888888] group-hover/uploader:text-[#C5A059] transition-colors">
                            <Upload className="w-4 h-4 group-hover/uploader:scale-110 transition-transform" />
                          </div>
                          <span className="text-xs font-mono font-medium text-white group-hover/uploader:text-[#C5A059] transition-colors mb-1">
                            Upload Certificate Image
                          </span>
                          <span className="text-[10px] text-[#777777] font-mono leading-tight">
                            Select image from device • Original aspect ratio preserved
                          </span>
                          <div className="mt-3.5 px-3 py-1 bg-[#1e1e1e] border border-[#3a3a3a] group-hover/uploader:border-[#C5A059] text-[10px] font-mono text-[#C5A059] uppercase tracking-wider transition-colors">
                            Upload Image
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div>
                        {/* Certificate Image: Clickable to open the Image Pop-up Modal */}
                        <div
                          onClick={() => setReplaceModalCert(cert)}
                          className="w-full bg-white p-2.5 border border-[#333333] hover:border-[#C5A059] transition-all cursor-pointer group/certimg relative overflow-hidden flex items-center justify-center shadow-lg"
                          title="Click to manage, replace, or remove certification image"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setReplaceModalCert(cert);
                            }
                          }}
                        >
                          <img
                            src={currentImg}
                            alt={`${cert.title} Certificate`}
                            onError={(e) => {
                              const fallback = getFallbackCertImageUrl(cert.id);
                              if (fallback && e.currentTarget.src !== fallback) {
                                e.currentTarget.src = fallback;
                              }
                            }}
                            className="w-full h-auto max-h-56 sm:max-h-60 object-contain drop-shadow group-hover/certimg:scale-[1.02] transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/certimg:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 pointer-events-none p-3 text-center">
                            <div className="w-8 h-8 rounded-full bg-[#141414] border border-[#C5A059] text-[#C5A059] flex items-center justify-center shadow-md">
                              <Upload className="w-4 h-4" />
                            </div>
                            <span className="px-3 py-1 bg-[#141414]/95 border border-[#C5A059] text-[#C5A059] text-[10px] font-mono uppercase tracking-wider shadow-md">
                              Click to Manage / Replace Image
                            </span>
                          </div>
                        </div>

                        {/* Save & Reset Action Bar for Uploaded Image */}
                        {saveStates[cert.id] && (
                          <div className="w-full mt-2.5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveCertImage(cert.id);
                              }}
                              disabled={saveStates[cert.id] === 'saving'}
                              className="flex-1 py-1.5 px-3 bg-[#C5A059] hover:bg-[#d6b26b] text-[#0F0F0F] text-[10px] font-mono uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                              title="Save uploaded certification image"
                              id={`save-cert-btn-${cert.id}`}
                            >
                              {saveStates[cert.id] === 'saving' ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>SAVING...</span>
                                </>
                              ) : saveStates[cert.id] === 'saved' ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F0F0F]" />
                                  <span>SAVED</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-3.5 h-3.5" />
                                  <span>SAVE</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResetCertImage(cert.id);
                              }}
                              className="py-1.5 px-2.5 text-[#888888] hover:text-[#C5A059] border border-[#333333] hover:border-[#C5A059] bg-[#141414] hover:bg-[#1f1f1f] text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                              title="Reset to default official certificate"
                            >
                              <Undo2 className="w-3 h-3" />
                              <span>Reset</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-[#999999] leading-relaxed mb-6 font-light mt-auto">
                    {cert.description}
                  </p>
                </div>

                {/* Status footer with clickable dragon icon action */}
                <div className="pt-4 border-t border-[#262626] flex items-center justify-between text-[10px] relative z-10 font-mono uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => handlePreviewClick(cert)}
                    className="flex items-center gap-1.5 text-[#C5A059] hover:underline cursor-pointer group/footer"
                    title="Click to view certification details"
                  >
                    <DragonIcon className="w-3.5 h-3.5 group-hover/footer:scale-110 transition-transform" />
                    <span>Verified & Current</span>
                  </button>
                  <span className="text-[#666666]">{cert.badgeLevel.includes('III') ? 'PHILIPPINES NC III' : 'PHILIPPINES NC II'}</span>
                </div>
              </div>
            );
          })}
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

            {/* Certification Image: Click to Enlarge or Placeholder */}
            {activeModalImage ? (
              <div 
                onClick={() => setIsEnlarged(true)}
                className="w-full bg-white p-2 border border-[#333333] cursor-zoom-in hover:brightness-105 transition-all group/pop relative flex items-center justify-center shadow-lg overflow-hidden"
                title="Click certification image to view in larger/wider view"
              >
                <img
                  src={activeModalImage}
                  alt={`${popupCert.title} Certificate`}
                  className="w-full h-auto max-h-[55vh] object-contain drop-shadow"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/pop:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-3.5 py-1.5 bg-[#141414]/95 border border-[#C5A059] text-[#C5A059] text-[11px] font-mono uppercase tracking-wider shadow-xl">
                    Click for Larger View
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full bg-[#181818] p-6 border border-[#2a2a2a] text-center my-2 shadow-inner">
                <div className="inline-flex p-3 rounded-full bg-[#121212] border border-[#C5A059]/40 mb-3 text-[#C5A059]">
                  <DragonIcon className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#C5A059] mb-1">
                  {popupCert.badgeLevel} • Verified Credential
                </div>
                <h4 className="text-lg font-serif italic text-white mb-2">
                  {popupCert.title}
                </h4>
                <div className="text-xs text-[#999999] mb-3 font-mono">
                  Issued by {popupCert.issuer} • {popupCert.date}
                </div>
                <p className="text-xs text-[#bbbbbb] leading-relaxed max-w-md mx-auto font-light mb-4">
                  {popupCert.description}
                </p>
                <div className="mt-3">
                  <input
                    type="file"
                    id={`modal-upload-${popupCert.id}`}
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleImageUpload(popupCert.id, e)}
                  />
                  <label
                    htmlFor={`modal-upload-${popupCert.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f1f1f] border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-black text-xs font-mono uppercase tracking-wider cursor-pointer transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Certificate Image</span>
                  </label>
                </div>
              </div>
            )}

            {/* 5-second countdown progress bar */}
            <div className="w-full bg-[#222222] h-1 mt-3 overflow-hidden">
              <div 
                className="h-full bg-[#C5A059] transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / 5) * 100}%` }}
              />
            </div>

            <div className="mt-2 text-[10px] font-mono text-[#777777] text-center">
              {activeModalImage ? 'Click image to enlarge • Disappears in 5 seconds' : 'Auto-closes in 5 seconds'}
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

            {/* Enlarged Full Certificate Image or Detailed Credential Card */}
            {activeModalImage ? (
              <>
                <div className="overflow-auto flex-1 flex items-center justify-center bg-white p-2 sm:p-4 border border-[#222]">
                  <img
                    src={activeModalImage}
                    alt={`${popupCert.title} Certificate`}
                    className="w-full max-h-[75vh] object-contain shadow-md"
                  />
                </div>

                {/* Enlarged Footer */}
                <div className="mt-3 pt-2.5 border-t border-[#262626] flex items-center justify-between text-xs text-[#888] font-mono">
                  <span className="text-[11px] text-[#aaa]">Click outside image to close</span>
                  <a
                    href={activeModalImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C5A059] hover:underline flex items-center gap-1.5 text-[11px]"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </>
            ) : (
              <div className="p-8 sm:p-12 text-center bg-[#181818] border border-[#2a2a2a] my-4">
                <div className="inline-flex p-4 rounded-full bg-[#121212] border border-[#C5A059]/40 mb-4 text-[#C5A059]">
                  <DragonIcon className="w-8 h-8" />
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#C5A059] mb-2">
                  {popupCert.badgeLevel} • Accredited Qualification
                </div>
                <h3 className="text-2xl font-serif italic text-white mb-3">
                  {popupCert.title}
                </h3>
                <div className="text-sm text-[#999999] mb-6 font-mono">
                  Issuing Institution: {popupCert.issuer} • Conferred: {popupCert.date}
                </div>
                <p className="text-sm text-[#cccccc] leading-relaxed max-w-xl mx-auto font-light mb-8">
                  {popupCert.description}
                </p>
                <div className="pt-4 border-t border-[#2a2a2a] text-xs font-mono text-[#888888]">
                  Verified & Current National Certificate • Technical Education and Skills Development System
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Replace Certification Image Pop-up Modal */}
      {replaceModalCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setReplaceModalCert(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#141414] border border-[#C5A059]/80 shadow-2xl p-5 sm:p-6 flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pop-up Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#262626]">
              <div className="flex items-center gap-2.5">
                <DragonIcon className="w-4 h-4 text-[#C5A059]" />
                <div>
                  <h3 className="text-base font-serif italic text-white leading-tight">
                    Replace Certification Image
                  </h3>
                  <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider block">
                    {replaceModalCert.title} • {replaceModalCert.badgeLevel}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplaceModalCert(null)}
                className="p-1.5 text-[#888888] hover:text-white bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#333333] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Image Preview */}
            {(pendingImages[replaceModalCert.id] || storedCerts[replaceModalCert.id]) && (
              <div className="mb-4 p-3 bg-[#1A1A1A] border border-[#262626] flex items-center gap-3">
                <div className="w-16 h-16 bg-white p-1 border border-[#333] shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                  <img
                    src={pendingImages[replaceModalCert.id] || storedCerts[replaceModalCert.id]?.imageUrl || storedCerts[replaceModalCert.id]?.dataUrl}
                    alt="Current Certificate Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5A059] block">
                    Current Image
                  </span>
                  <div className="text-xs text-white truncate font-medium">
                    {replaceModalCert.title}
                  </div>
                  <span className="text-[10px] text-[#A0A0A0] font-mono block mt-0.5">
                    Select a new image below to replace this certificate
                  </span>
                </div>
              </div>
            )}

            {/* Hidden File Input for Replace Modal */}
            <input
              type="file"
              ref={replaceFileInputRef}
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                if (replaceModalCert) {
                  handleImageUpload(replaceModalCert.id, e);
                  setReplaceModalCert(null);
                }
              }}
            />

            {/* Drag & Drop / Click Upload Zone */}
            <div
              onClick={() => replaceFileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverReplace(true);
              }}
              onDragLeave={() => setIsDragOverReplace(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverReplace(false);
                const file = e.dataTransfer.files?.[0];
                if (file && replaceModalCert) {
                  const fakeEvent = {
                    target: { files: [file], value: '' }
                  } as unknown as React.ChangeEvent<HTMLInputElement>;
                  handleImageUpload(replaceModalCert.id, fakeEvent);
                  setReplaceModalCert(null);
                }
              }}
              className={`w-full border-2 border-dashed p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none group ${
                isDragOverReplace
                  ? 'border-[#C5A059] bg-[#C5A059]/10'
                  : 'border-[#333333] hover:border-[#C5A059] bg-[#181818] hover:bg-[#1e1e1e]'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#333333] group-hover:border-[#C5A059] flex items-center justify-center text-[#888888] group-hover:text-[#C5A059] mb-3 group-hover:scale-110 transition-transform shadow-md">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-medium text-white group-hover:text-[#C5A059] transition-colors mb-1">
                Click to browse or drag & drop replacement image
              </span>
              <span className="text-[10px] text-[#777777] font-mono mb-4">
                Supports JPG, PNG, WebP, GIF • Original aspect ratio preserved
              </span>
              <button
                type="button"
                className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold text-xs font-mono uppercase tracking-wider transition-colors pointer-events-none"
              >
                Choose Replacement Image
              </button>
            </div>

            {/* Modal Actions */}
            <div className="mt-4 pt-3 border-t border-[#262626] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (replaceModalCert) {
                      handleResetCertImage(replaceModalCert.id);
                      setReplaceModalCert(null);
                    }
                  }}
                  className="text-[#888888] hover:text-[#C5A059] border border-[#333333] hover:border-[#C5A059] bg-[#1a1a1a] hover:bg-[#252525] transition-all cursor-pointer py-1.5 px-3 flex items-center gap-1.5"
                  title="Reset to default official certificate"
                >
                  <Undo2 className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    if (replaceModalCert) {
                      handleRemoveImage(replaceModalCert.id, e);
                      setReplaceModalCert(null);
                    }
                  }}
                  className="text-[#ff6b6b] hover:text-[#ff9494] hover:bg-red-950/40 border border-red-900/40 hover:border-red-800 transition-all cursor-pointer py-1.5 px-3 flex items-center gap-1.5"
                  title="Remove certification image"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#ff6b6b]" />
                  <span>Remove</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setReplaceModalCert(null)}
                className="px-4 py-1.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#cccccc] hover:text-white border border-[#333333] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
