import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit3,
  Eye,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  CheckSquare,
  Info
} from 'lucide-react';
import { ThemeId, GalleryImage } from '../types';
import { THEME_CONFIGS } from '../data/portfolioData';
import {
  loadGalleryImages,
  saveMultipleGalleryImages,
  updateGalleryImage,
  deleteGalleryImage,
  deleteMultipleGalleryImages,
  clearAllGalleryImages,
  processAndOptimizeImageFile
} from '../utils/galleryStorage';

interface GallerySectionProps {
  currentTheme: ThemeId;
}

const CATEGORIES = [
  'All',
  'Hospitality & Service',
  'Culinary Craft',
  'Certificates & Awards',
  'Campus & Events',
  'Creative & Digital'
];

export function GallerySection({ currentTheme }: GallerySectionProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  // Gallery state - strictly initialized to empty, completely isolated
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Management Mode (Multi-Select)
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Lightbox viewer
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Edit Modal
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editCategory, setEditCategory] = useState(CATEGORIES[1]);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Single file input reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Load only images uploaded specifically to the Gallery
  useEffect(() => {
    let isMounted = true;
    async function fetchImages() {
      setIsLoading(true);
      try {
        const stored = await loadGalleryImages();
        if (isMounted) {
          setImages(stored);
        }
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchImages();
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) => (prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, images]);

  // Handle file selection (supports unlimited images)
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileArray.length === 0) {
      showToast('Please select valid image files (JPG, PNG, WebP, SVG, GIF).', 'warning');
      return;
    }

    setIsUploading(true);
    setUploadProgress(`Processing ${fileArray.length} photo(s)...`);

    try {
      const processedImages: GalleryImage[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(`Optimizing ${i + 1} of ${fileArray.length}: ${file.name}`);

        try {
          const { dataUrl, width, height, sizeBytes } = await processAndOptimizeImageFile(file);

          const cleanTitle = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());

          processedImages.push({
            id: `gallery_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            dataUrl,
            title: cleanTitle || 'Untitled Photo',
            caption: '',
            category: 'Hospitality & Service',
            uploadedAt: Date.now() + i,
            width,
            height,
            sizeBytes
          });
        } catch (procErr) {
          console.error(`Failed to process ${file.name}:`, procErr);
        }
      }

      if (processedImages.length > 0) {
        setUploadProgress('Saving to gallery...');
        const result = await saveMultipleGalleryImages(processedImages);
        const refreshed = await loadGalleryImages();
        setImages(refreshed);

        showToast(`Successfully uploaded ${result.added} photo(s) to gallery.`, 'success');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('An error occurred during upload. Please try again.', 'warning');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Delete single image
  const handleDeleteImage = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Remove this photo from the gallery?')) {
      await deleteGalleryImage(id);
      const refreshed = await loadGalleryImages();
      setImages(refreshed);
      if (activeLightboxIndex !== null) {
        setActiveLightboxIndex(null);
      }
      showToast('Photo removed from gallery.', 'info');
    }
  };

  // Bulk delete selected
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Delete ${selectedIds.size} selected photo(s)? This action cannot be undone.`)) {
      await deleteMultipleGalleryImages(Array.from(selectedIds));
      const refreshed = await loadGalleryImages();
      setImages(refreshed);
      setSelectedIds(new Set());
      setIsSelectMode(false);
      showToast(`Removed ${selectedIds.size} photo(s).`, 'info');
    }
  };

  // Clear all images in gallery
  const handleClearAll = async () => {
    if (images.length === 0) return;
    if (window.confirm('Delete all photos from the gallery? This cannot be undone.')) {
      await clearAllGalleryImages();
      setImages([]);
      setSelectedIds(new Set());
      setIsSelectMode(false);
      showToast('Gallery cleared.', 'info');
    }
  };

  // Open edit modal
  const handleOpenEditModal = (img: GalleryImage, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingImage(img);
    setEditTitle(img.title);
    setEditCaption(img.caption || '');
    setEditCategory(img.category || CATEGORIES[1]);
  };

  // Save edit changes
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    await updateGalleryImage(editingImage.id, {
      title: editTitle.trim() || 'Untitled Photo',
      caption: editCaption.trim(),
      category: editCategory
    });

    const refreshed = await loadGalleryImages();
    setImages(refreshed);
    setEditingImage(null);
    showToast('Photo details updated.', 'success');
  };

  // Download image
  const handleDownloadImage = (img: GalleryImage, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const link = document.createElement('a');
    link.href = img.dataUrl;
    link.download = `${img.title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'photo'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Multi-select toggle
  const toggleSelectImage = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredImages.map((i) => i.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Filtered & Sorted Images
  const filteredImages = useMemo(() => {
    let result = [...images];

    if (selectedCategory !== 'All') {
      result = result.filter((img) => img.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (img) =>
          img.title.toLowerCase().includes(q) ||
          (img.caption && img.caption.toLowerCase().includes(q)) ||
          (img.category && img.category.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => b.uploadedAt - a.uploadedAt);
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => a.uploadedAt - b.uploadedAt);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [images, selectedCategory, searchQuery, sortBy]);

  const activeLightboxImage = activeLightboxIndex !== null ? filteredImages[activeLightboxIndex] : null;

  return (
    <section id="gallery" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] block mb-3 font-medium">
            Visual Archive & Memories
          </span>
          <h2
            className="text-3xl sm:text-5xl font-serif italic font-light text-white tracking-tight"
            style={{ fontFamily: themeConfig.fontHeadline }}
          >
            Curated <span className="text-[#C5A059] not-italic">Gallery</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#999999] max-w-2xl mx-auto font-light leading-relaxed">
            A dedicated visual showcase of hospitality internships, culinary craft, campus achievements, guest service moments, and creative milestones.
          </p>
        </div>

        {/* Gallery Control Bar with EXACTLY ONE Single Upload Button */}
        <div className="bg-[#141414] border border-[#262626] p-4 sm:p-5 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Gallery Title */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Photo Gallery
              </h3>
              <p className="text-[11px] text-[#777777] font-mono mt-0.5">
                Unlimited photo storage · Isolated collection
              </p>
            </div>

            {/* Right: The ONLY single upload button & optional manage toggle */}
            <div className="flex items-center gap-3">
              {/* Hidden file input controlled exclusively by the single upload button */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />

              {/* The Single Upload Image Button */}
              <button
                type="button"
                id="gallery-single-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photos</span>
              </button>

              {images.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSelectMode(!isSelectMode);
                    setSelectedIds(new Set());
                  }}
                  className={`px-3.5 py-2 text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelectMode
                      ? 'bg-[#C5A059] text-black border-[#C5A059] font-semibold'
                      : 'bg-[#1A1A1A] text-[#999999] hover:text-white border-[#333333]'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{isSelectMode ? 'Done' : 'Select'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Upload progress indicator */}
          {isUploading && (
            <div className="mt-4 pt-4 border-t border-[#222222] flex items-center gap-3 animate-pulse">
              <div className="w-4 h-4 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="text-xs font-mono text-[#C5A059]">{uploadProgress || 'Processing photos...'}</span>
            </div>
          )}
        </div>

        {/* Multi-Select Action Bar (shown only when Select mode is active) */}
        {isSelectMode && (
          <div className="bg-[#1A1A1A] border border-[#C5A059] p-3 sm:p-4 mb-6 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3 text-xs text-white">
              <span className="font-mono text-[#C5A059] font-bold">
                {selectedIds.size} of {filteredImages.length} selected
              </span>
              <button
                type="button"
                onClick={selectAll}
                className="text-[#999999] hover:text-[#C5A059] underline cursor-pointer text-xs"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="text-[#999999] hover:text-white underline cursor-pointer text-xs"
              >
                Deselect All
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0}
                className="px-3.5 py-1.5 bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-200 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.size})</span>
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 bg-[#141414] hover:bg-red-950/40 border border-[#333333] hover:border-red-800 text-[#888888] hover:text-red-300 text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear Gallery
              </button>
            </div>
          </div>
        )}

        {/* Filter, Search & Sort Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 text-[11px] uppercase tracking-wider font-mono transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#C5A059] text-black font-semibold'
                    : 'bg-[#141414] text-[#888888] hover:text-white border border-[#262626] hover:border-[#383838]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photos..."
                className="w-full bg-[#141414] border border-[#262626] focus:border-[#C5A059] text-xs text-white pl-8 pr-3 py-1.5 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
              className="bg-[#141414] border border-[#262626] text-xs text-[#888888] focus:text-white focus:border-[#C5A059] px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Facebook/Instagram-Style Photo Grid */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-mono uppercase tracking-widest text-[#777777]">Loading Gallery...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="bg-[#141414] border border-[#262626] py-16 px-6 text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 border border-[#C5A059]/40 bg-[#1A1A1A] flex items-center justify-center text-[#C5A059] mx-auto mb-4">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif italic text-white mb-2" style={{ fontFamily: themeConfig.fontHeadline }}>
              {searchQuery || selectedCategory !== 'All' ? 'No Matching Photos' : 'No Photos in Gallery'}
            </h3>
            <p className="text-xs text-[#888888] font-light max-w-md mx-auto leading-relaxed">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search query or selecting a different category filter.'
                : 'Click the "Upload Photos" button above to upload photos to your gallery.'}
            </p>
          </div>
        ) : (
          /* Instagram/Facebook-style square photo grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {filteredImages.map((img, index) => {
              const isSelected = selectedIds.has(img.id);
              return (
                <div
                  key={img.id}
                  onClick={() => {
                    if (isSelectMode) {
                      toggleSelectImage(img.id);
                    } else {
                      setActiveLightboxIndex(index);
                    }
                  }}
                  className={`group relative aspect-square bg-[#111111] border transition-all duration-200 overflow-hidden cursor-pointer ${
                    isSelected
                      ? 'border-[#C5A059] ring-2 ring-[#C5A059]/60 shadow-xl'
                      : 'border-[#222222] hover:border-[#C5A059]/70'
                  }`}
                >
                  {/* Select Mode Checkbox */}
                  {isSelectMode && (
                    <div className="absolute top-2 left-2 z-20">
                      <button
                        type="button"
                        onClick={(e) => toggleSelectImage(img.id, e)}
                        className={`p-1 border transition-colors ${
                          isSelected
                            ? 'bg-[#C5A059] text-black border-[#C5A059]'
                            : 'bg-black/80 text-white/60 border-white/40'
                        }`}
                      >
                        {isSelected ? <Check className="w-4 h-4" /> : <div className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  {/* Photo Presentation (Square, sharp cover) */}
                  <img
                    src={img.dataUrl}
                    alt={img.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Facebook/Instagram Hover Overlay with Details & Quick Actions */}
                  {!isSelectMode && (
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                      {/* Top Bar on Hover */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-[#C5A059] bg-black/70 px-2 py-0.5 border border-[#C5A059]/30 truncate max-w-[120px]">
                          {img.category || 'Hospitality'}
                        </span>
                        <span className="text-[9px] font-mono text-[#A0A0A0]">
                          {new Date(img.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Title on Hover */}
                      <div className="text-center px-1">
                        <h4 className="text-xs font-medium text-white truncate mb-0.5">
                          {img.title}
                        </h4>
                        {img.caption && (
                          <p className="text-[11px] text-[#A0A0A0] font-light line-clamp-1">
                            {img.caption}
                          </p>
                        )}
                      </div>

                      {/* Action buttons on Hover */}
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLightboxIndex(index);
                          }}
                          className="p-1.5 bg-[#1A1A1A] hover:bg-[#C5A059] text-white hover:text-black border border-[#333333] transition-colors"
                          title="View Fullscreen"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(img, e)}
                          className="p-1.5 bg-[#1A1A1A] hover:bg-[#C5A059] text-white hover:text-black border border-[#333333] transition-colors"
                          title="Edit Info"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDownloadImage(img, e)}
                          className="p-1.5 bg-[#1A1A1A] hover:bg-[#C5A059] text-white hover:text-black border border-[#333333] transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteImage(img.id, e)}
                          className="p-1.5 bg-[#1A1A1A] hover:bg-red-600 text-white border border-[#333333] transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Global Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div
              className={`p-4 border shadow-2xl flex items-center gap-3 max-w-md ${
                notification.type === 'success'
                  ? 'bg-[#121a14] border-emerald-600/70 text-emerald-200'
                  : notification.type === 'warning'
                  ? 'bg-[#1e1710] border-amber-600/70 text-amber-200'
                  : 'bg-[#141414] border-[#C5A059] text-white'
              }`}
            >
              <div className="shrink-0">
                {notification.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Info className="w-4 h-4 text-[#C5A059]" />
                )}
              </div>
              <p className="text-xs leading-relaxed font-mono">{notification.message}</p>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="ml-auto text-white/60 hover:text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* FULLSCREEN LIGHTBOX PHOTO VIEWER */}
        {activeLightboxImage && activeLightboxIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
            onClick={() => setActiveLightboxIndex(null)}
          >
            {/* Top Lightbox Bar */}
            <div
              className="flex items-center justify-between text-white border-b border-[#222222] pb-4 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C5A059]">
                  Photo {activeLightboxIndex + 1} of {filteredImages.length}
                </span>
                <span className="hidden sm:inline text-xs text-[#666666]">|</span>
                <span className="hidden sm:inline text-xs font-medium text-white/80">
                  {activeLightboxImage.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(activeLightboxImage)}
                  className="p-2 bg-[#1A1A1A] hover:bg-[#C5A059] text-white hover:text-black border border-[#333333] transition-colors"
                  title="Edit Info"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadImage(activeLightboxImage)}
                  className="p-2 bg-[#1A1A1A] hover:bg-[#C5A059] text-white hover:text-black border border-[#333333] transition-colors"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteImage(activeLightboxImage.id)}
                  className="p-2 bg-[#1A1A1A] hover:bg-red-600 text-white border border-[#333333] transition-colors"
                  title="Delete Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLightboxIndex(null)}
                  className="p-2 bg-[#1A1A1A] hover:bg-white text-white hover:text-black border border-[#333333] transition-colors ml-2"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Central Lightbox Display Area with Nav Controls */}
            <div
              className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {filteredImages.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveLightboxIndex((prev) =>
                      prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1
                    )
                  }
                  className="absolute left-2 sm:left-4 z-20 p-3 bg-black/60 hover:bg-[#C5A059] text-white hover:text-black border border-white/20 hover:border-[#C5A059] transition-all cursor-pointer backdrop-blur-sm"
                  title="Previous photo (Left arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              <div className="max-w-5xl max-h-[75vh] flex items-center justify-center p-2">
                <img
                  src={activeLightboxImage.dataUrl}
                  alt={activeLightboxImage.title}
                  className="max-w-full max-h-[75vh] object-contain shadow-2xl border border-[#222222]"
                />
              </div>

              {filteredImages.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveLightboxIndex((prev) =>
                      prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-2 sm:right-4 z-20 p-3 bg-black/60 hover:bg-[#C5A059] text-white hover:text-black border border-white/20 hover:border-[#C5A059] transition-all cursor-pointer backdrop-blur-sm"
                  title="Next photo (Right arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Caption & Metadata */}
            <div
              className="border-t border-[#222222] pt-4 text-center z-10 max-w-2xl mx-auto w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] block mb-1">
                {activeLightboxImage.category || 'Hospitality'} ·{' '}
                {new Date(activeLightboxImage.uploadedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <h3 className="text-lg font-serif italic text-white mb-1" style={{ fontFamily: themeConfig.fontHeadline }}>
                {activeLightboxImage.title}
              </h3>
              {activeLightboxImage.caption && (
                <p className="text-xs text-[#A0A0A0] font-light leading-relaxed">
                  {activeLightboxImage.caption}
                </p>
              )}
            </div>
          </div>
        )}

        {/* EDIT DETAILS MODAL */}
        {editingImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setEditingImage(null)}
          >
            <div
              className="bg-[#141414] border border-[#C5A059] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#262626] mb-5">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C5A059]">
                  Edit Photo Details
                </span>
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
                  className="text-[#888888] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#999999] mb-1.5">
                    Photo Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#C5A059] text-sm text-white px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#999999] mb-1.5">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#C5A059] text-xs text-white px-3 py-2 outline-none cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#999999] mb-1.5">
                    Caption / Description
                  </label>
                  <textarea
                    rows={3}
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Add contextual details about this milestone or photo..."
                    className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#C5A059] text-xs text-white px-3 py-2 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setEditingImage(null)}
                    className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#222222] text-xs uppercase tracking-wider text-[#888888] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
