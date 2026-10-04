import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Upload,
  FolderPlus,
  Folder,
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
  ArrowLeft,
  MoveRight,
  Plus,
  Info,
  Images,
  RefreshCw,
  CloudUpload
} from 'lucide-react';
import { ThemeId, GalleryImage, GalleryAlbum } from '../types';
import { THEME_CONFIGS } from '../data/portfolioData';
import {
  loadGalleryImages,
  saveMultipleGalleryImages,
  updateGalleryImage,
  deleteGalleryImage,
  deleteMultipleGalleryImages,
  clearAllGalleryImages,
  loadGalleryAlbums,
  saveGalleryAlbum,
  updateGalleryAlbum,
  deleteGalleryAlbum,
  addImagesToAlbum,
  removeImagesFromAlbum,
  moveImagesBetweenAlbums,
  processAndOptimizeImageFile,
  resolveImageUrl,
  getDeletedImageIds,
  recordDeletedImageIds,
  getStoredGalleryImagesSync,
  getStoredGalleryAlbumsSync,
  autoMigrateBrowserImagesToRepository
} from '../utils/galleryStorage';

interface GallerySectionProps {
  currentTheme: ThemeId;
}

const REMOVED_CATEGORIES = new Set([
  'Creative & Digital',
  'Campus & Events',
  'Certificates & Awards',
  'Culinary Craft',
  'Hospitality & Service',
  'Hospitality'
]);

export function GallerySection({ currentTheme }: GallerySectionProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  // Gallery state - initialized synchronously from bundled permanent data + cache
  const [images, setImages] = useState<GalleryImage[]>(() => getStoredGalleryImagesSync());
  const [albums, setAlbums] = useState<GalleryAlbum[]>(() => getStoredGalleryAlbumsSync());
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // View state: 'photos' or 'albums'
  const [activeTab, setActiveTab] = useState<'photos' | 'albums'>('photos');
  const [activeAlbum, setActiveAlbum] = useState<GalleryAlbum | null>(null);

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Management Mode (Multi-Select)
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Lightbox viewer
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Modals
  const [createAlbumModalOpen, setCreateAlbumModalOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');

  const [renameAlbumModal, setRenameAlbumModal] = useState<GalleryAlbum | null>(null);
  const [renameAlbumName, setRenameAlbumName] = useState('');
  const [renameAlbumDesc, setRenameAlbumDesc] = useState('');

  const [addToAlbumModal, setAddToAlbumModal] = useState<{
    open: boolean;
    imageIds: string[];
    isMove?: boolean;
    sourceAlbumId?: string;
  }>({ open: false, imageIds: [] });

  const [addPhotosToCurrentAlbumModal, setAddPhotosToCurrentAlbumModal] = useState(false);
  const [photosToAddToAlbum, setPhotosToAddToAlbum] = useState<Set<string>>(new Set());

  // Edit Image Modal
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Single file input reference (The ONE and ONLY upload button in the gallery)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addPhotosScrollRef = useRef<HTMLDivElement>(null);

  // Prevent background scroll and reset scroll position when "Add Photos to this Album" modal opens
  useEffect(() => {
    if (addPhotosToCurrentAlbumModal) {
      if (addPhotosScrollRef.current) {
        addPhotosScrollRef.current.scrollTop = 0;
      }
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [addPhotosToCurrentAlbumModal]);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Load all images and albums on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setIsLoading(true);
      try {
        const [storedImages, storedAlbums] = await Promise.all([
          loadGalleryImages(),
          loadGalleryAlbums()
        ]);
        if (isMounted) {
          setImages(storedImages);
          setAlbums(storedAlbums);
        }

        // Automatically scan and migrate any uploaded images from browser storage to permanent repository assets
        autoMigrateBrowserImagesToRepository((migrated, total) => {
          if (isMounted) {
            setUploadProgress(`Permanently saving photo ${migrated} of ${total} to repository assets...`);
          }
        }).then(async (result) => {
          if (isMounted && result.migratedCount > 0) {
            setUploadProgress(null);
            const [refreshedImages, refreshedAlbums] = await Promise.all([
              loadGalleryImages(),
              loadGalleryAlbums()
            ]);
            setImages(refreshedImages);
            setAlbums(refreshedAlbums);
            showToast(`Permanently saved ${result.migratedCount} gallery photos to repository assets!`, 'success');
          }
        }).catch(() => {
          if (isMounted) setUploadProgress(null);
        });
      } catch (err) {
        console.error('Failed to load gallery data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchData();

    const handleGalleryUpdate = async () => {
      const [refreshedImages, refreshedAlbums] = await Promise.all([
        loadGalleryImages(),
        loadGalleryAlbums(),
      ]);
      if (isMounted) {
        setImages(refreshedImages);
        setAlbums(refreshedAlbums);
      }
    };

    window.addEventListener('ja_gallery_images_updated', handleGalleryUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('ja_gallery_images_updated', handleGalleryUpdate);
    };
  }, []);

  const handleSyncBrowserImages = async () => {
    setIsUploading(true);
    setUploadProgress('Checking browser storage for photos...');
    try {
      const res = await autoMigrateBrowserImagesToRepository((migrated, total) => {
        setUploadProgress(`Saving photo ${migrated} of ${total} to repository assets...`);
      });
      if (res.migratedCount > 0) {
        const [refreshedImages, refreshedAlbums] = await Promise.all([
          loadGalleryImages(),
          loadGalleryAlbums()
        ]);
        setImages(refreshedImages);
        setAlbums(refreshedAlbums);
        showToast(`Successfully saved ${res.migratedCount} photos to repository assets!`, 'success');
      } else {
        showToast('All photos are already permanently saved in your repository.', 'info');
      }
    } catch (err) {
      console.error('Manual sync failed:', err);
      showToast('Sync check completed.', 'info');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // Gallery images list: user gallery uploads, filtering out deleted IDs
  const allImages = useMemo(() => {
    const deletedSet = getDeletedImageIds();
    return images.filter((img) => !deletedSet.has(img.id));
  }, [images]);

  // Gallery albums
  const displayAlbums = useMemo(() => {
    return albums;
  }, [albums]);

  // Sync activeAlbum with updated albums state
  useEffect(() => {
    if (activeAlbum) {
      const refreshed = displayAlbums.find((a) => a.id === activeAlbum.id);
      if (refreshed) {
        setActiveAlbum(refreshed);
      } else {
        setActiveAlbum(null);
      }
    }
  }, [displayAlbums]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : currentDisplayImages.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) => (prev !== null && prev < currentDisplayImages.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, images, activeAlbum]);

  // Handle file selection (single upload input for unlimited photos)
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
        setUploadProgress(`Processing original ${i + 1} of ${fileArray.length}: ${file.name}`);

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
            category: '',
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
        setUploadProgress('Saving to gallery repository storage...');
        const result = await saveMultipleGalleryImages(processedImages);
        const refreshed = await loadGalleryImages();
        setImages(refreshed);

        // If inside an active album, also add the newly uploaded photos to this album
        if (activeAlbum) {
          const newIds = processedImages.map((p) => p.id);
          await addImagesToAlbum(activeAlbum.id, newIds);
          const updatedAlbums = await loadGalleryAlbums();
          setAlbums(updatedAlbums);
        }

        showToast(`Successfully added ${result.added} photo(s) to gallery storage.`, 'success');
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

  /* =========================================================================
   * ALBUM ACTIONS
   * ========================================================================= */

  // Create a new album
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newAlbumName.trim();
    if (!name) return;

    // Check if initial images were selected to be added to this new album
    const initialImageIds = addToAlbumModal.open ? addToAlbumModal.imageIds : [];

    const newAlbum: GalleryAlbum = {
      id: `album_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      description: newAlbumDesc.trim() || undefined,
      coverImageId: initialImageIds[0] || undefined,
      imageIds: initialImageIds,
      createdAt: Date.now()
    };

    await saveGalleryAlbum(newAlbum);
    const refreshed = await loadGalleryAlbums();
    setAlbums(refreshed);
    setCreateAlbumModalOpen(false);
    setNewAlbumName('');
    setNewAlbumDesc('');

    if (addToAlbumModal.open) {
      setAddToAlbumModal({ open: false, imageIds: [] });
      setSelectedIds(new Set());
      setIsSelectMode(false);
      showToast(`Album "${name}" created with ${initialImageIds.length} photo(s)!`, 'success');
    } else {
      showToast(`Album "${name}" created!`, 'success');
      // Switch to albums view
      setActiveTab('albums');
    }
  };

  // Open Rename modal
  const handleOpenRenameAlbum = (album: GalleryAlbum, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRenameAlbumModal(album);
    setRenameAlbumName(album.name);
    setRenameAlbumDesc(album.description || '');
  };

  // Save album rename
  const handleSaveAlbumRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameAlbumModal) return;
    const name = renameAlbumName.trim();
    if (!name) return;

    await updateGalleryAlbum(renameAlbumModal.id, {
      name,
      description: renameAlbumDesc.trim() || undefined
    });

    const refreshed = await loadGalleryAlbums();
    setAlbums(refreshed);
    setRenameAlbumModal(null);
    showToast(`Album renamed to "${name}".`, 'success');
  };

  // Delete an album (Does NOT delete images inside it)
  const handleDeleteAlbum = async (albumId: string, albumName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete the album "${albumName}"?\n\nNote: The photos inside will NOT be deleted; they will remain available in your main Gallery.`
      )
    ) {
      await deleteGalleryAlbum(albumId);
      const refreshed = await loadGalleryAlbums();
      setAlbums(refreshed);
      if (activeAlbum?.id === albumId) {
        setActiveAlbum(null);
      }
      showToast(`Album "${albumName}" deleted. Photos remain in your Gallery.`, 'info');
    }
  };

  // Remove an image from an album (Does NOT delete it from main gallery)
  const handleRemoveFromAlbum = async (albumId: string, imageId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await removeImagesFromAlbum(albumId, [imageId]);
    const refreshed = await loadGalleryAlbums();
    setAlbums(refreshed);
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex(null);
    }
    showToast('Photo removed from this album (still available in main Gallery).', 'info');
  };

  // Bulk remove from album
  const handleBulkRemoveFromAlbum = async () => {
    if (!activeAlbum || selectedIds.size === 0) return;
    const toRemove = Array.from<string>(selectedIds);
    await removeImagesFromAlbum(activeAlbum.id, toRemove);
    const refreshed = await loadGalleryAlbums();
    setAlbums(refreshed);
    setSelectedIds(new Set());
    setIsSelectMode(false);
    showToast(`Removed ${toRemove.length} photo(s) from album.`, 'info');
  };

  // Add selected images to an album
  const handleConfirmAddToAlbum = async (targetAlbumId: string) => {
    const { imageIds, isMove, sourceAlbumId } = addToAlbumModal;
    if (isMove && sourceAlbumId) {
      await moveImagesBetweenAlbums(sourceAlbumId, targetAlbumId, imageIds);
      showToast(`Moved ${imageIds.length} photo(s) to album.`, 'success');
    } else {
      await addImagesToAlbum(targetAlbumId, imageIds);
      showToast(`Added ${imageIds.length} photo(s) to album.`, 'success');
    }

    const refreshed = await loadGalleryAlbums();
    setAlbums(refreshed);
    setAddToAlbumModal({ open: false, imageIds: [] });
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  // Add photos to the currently active album
  const handleSavePhotosToActiveAlbum = async () => {
    if (!activeAlbum) return;
    const imageIds = Array.from<string>(photosToAddToAlbum);
    if (imageIds.length > 0) {
      await addImagesToAlbum(activeAlbum.id, imageIds);
      const refreshed = await loadGalleryAlbums();
      setAlbums(refreshed);
      showToast(`Added ${imageIds.length} photo(s) to "${activeAlbum.name}".`, 'success');
    }
    setAddPhotosToCurrentAlbumModal(false);
    setPhotosToAddToAlbum(new Set());
  };

  /* =========================================================================
   * PHOTO ACTIONS
   * ========================================================================= */

  // Delete single photo from main gallery
  const handleDeleteImage = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    recordDeletedImageIds([id]);
    await deleteGalleryImage(id);
    const [refreshedImages, refreshedAlbums] = await Promise.all([
      loadGalleryImages(),
      loadGalleryAlbums()
    ]);
    setImages(refreshedImages);
    setAlbums(refreshedAlbums);
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex(null);
    }
    showToast('Photo permanently deleted from gallery.', 'info');
  };

  // Bulk delete selected photos
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const idsToDelete = Array.from<string>(selectedIds);
    recordDeletedImageIds(idsToDelete);
    await deleteMultipleGalleryImages(idsToDelete);

    const [refreshedImages, refreshedAlbums] = await Promise.all([
      loadGalleryImages(),
      loadGalleryAlbums()
    ]);
    setImages(refreshedImages);
    setAlbums(refreshedAlbums);

    setSelectedIds(new Set());
    setIsSelectMode(false);
    showToast(`Permanently deleted ${idsToDelete.length} photo(s).`, 'info');
  };

  // Clear all images in gallery
  const handleClearAll = async () => {
    if (allImages.length === 0) return;
    const allIds = allImages.map((img) => img.id);
    recordDeletedImageIds(allIds);
    await clearAllGalleryImages();
    setImages([]);
    const refreshedAlbums = await loadGalleryAlbums();
    setAlbums(refreshedAlbums);
    setSelectedIds(new Set());
    setIsSelectMode(false);
    showToast('Gallery cleared.', 'info');
  };

  // Edit photo info
  const handleOpenEditModal = (img: GalleryImage, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingImage(img);
    setEditTitle(img.title);
    setEditCaption(img.caption || '');
    setEditCategory(img.category && !REMOVED_CATEGORIES.has(img.category) ? img.category : '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    const trimmedCat = editCategory.trim();
    await updateGalleryImage(editingImage.id, {
      title: editTitle.trim() || 'Untitled Photo',
      caption: editCaption.trim(),
      category: !REMOVED_CATEGORIES.has(trimmedCat) ? trimmedCat : ''
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
    setSelectedIds(new Set(currentDisplayImages.map((i) => i.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Dynamically compute any user-defined categories (strictly excluding the removed categories)
  const availableCategories = useMemo(() => {
    const customSet = new Set<string>();
    allImages.forEach((img) => {
      if (img.category && !REMOVED_CATEGORIES.has(img.category)) {
        customSet.add(img.category);
      }
    });
    return customSet.size > 0 ? ['All', ...Array.from(customSet)] : [];
  }, [allImages]);

  useEffect(() => {
    if (selectedCategory !== 'All' && !availableCategories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [availableCategories, selectedCategory]);

  // Filtered Photos List for the current active view (either All Photos or Inside Active Album)
  const currentDisplayImages = useMemo(() => {
    let list: GalleryImage[] = [];

    if (activeAlbum) {
      // Show only images belonging to the active album
      const albumSet = new Set(activeAlbum.imageIds);
      list = allImages.filter((img) => albumSet.has(img.id));
    } else {
      // Main Gallery: show all uploaded images
      list = [...allImages];
    }

    if (selectedCategory !== 'All') {
      list = list.filter((img) => img.category === selectedCategory && !REMOVED_CATEGORIES.has(img.category));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (img) =>
          img.title.toLowerCase().includes(q) ||
          (img.caption && img.caption.toLowerCase().includes(q)) ||
          (img.category && !REMOVED_CATEGORIES.has(img.category) && img.category.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => b.uploadedAt - a.uploadedAt);
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => a.uploadedAt - b.uploadedAt);
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [allImages, activeAlbum, selectedCategory, searchQuery, sortBy]);

  // Helper to find cover image dataUrl for an album
  const getAlbumCoverDataUrl = (album: GalleryAlbum): string | null => {
    if (album.coverImageId) {
      const found = allImages.find((i) => i.id === album.coverImageId);
      if (found) return found.dataUrl;
    }
    if (album.imageIds.length > 0) {
      const first = allImages.find((i) => i.id === album.imageIds[0]);
      if (first) return first.dataUrl;
    }
    return null;
  };

  const activeLightboxImage =
    activeLightboxIndex !== null ? currentDisplayImages[activeLightboxIndex] : null;

  return (
    <section id="gallery" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header matching portfolio aesthetic */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
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

        {/* Control Bar: Tabs, Create Album & Single Upload Button */}
        <div className="bg-[#141414] border border-[#262626] p-4 sm:p-5 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: View Tabs (Photos / Albums) or Breadcrumb when in Album */}
            <div className="flex items-center gap-3">
              {activeAlbum ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAlbum(null);
                      setSelectedIds(new Set());
                      setIsSelectMode(false);
                    }}
                    className="p-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] hover:border-[#C5A059] text-white text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="hidden sm:inline">All Albums</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[#666666]">/</span>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                      {activeAlbum.name}
                    </h3>
                    <span className="text-[11px] font-mono text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 border border-[#C5A059]/20">
                      {activeAlbum.imageIds.length} {activeAlbum.imageIds.length === 1 ? 'Photo' : 'Photos'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-[#0F0F0F] p-1 border border-[#262626]">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('photos');
                      setSelectedIds(new Set());
                      setIsSelectMode(false);
                    }}
                    className={`px-4 py-1.5 text-xs uppercase tracking-wider font-medium transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'photos'
                        ? 'bg-[#C5A059] text-black font-semibold shadow-sm'
                        : 'text-[#888888] hover:text-white'
                    }`}
                  >
                    <Images className="w-3.5 h-3.5" />
                    <span>All Photos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('albums');
                      setSelectedIds(new Set());
                      setIsSelectMode(false);
                    }}
                    className={`px-4 py-1.5 text-xs uppercase tracking-wider font-medium transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'albums'
                        ? 'bg-[#C5A059] text-black font-semibold shadow-sm'
                        : 'text-[#888888] hover:text-white'
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>Albums ({albums.length})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right: The ONE Single Upload Button, Create Album Button, and Select Mode */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {/* Hidden file input controlled exclusively by the single upload button */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />

              {/* Clearly Visible Create Album Option */}
              <button
                type="button"
                onClick={() => setCreateAlbumModalOpen(true)}
                className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#C5A059]/60 hover:border-[#C5A059] text-[#C5A059] hover:text-white text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                title="Create a new album to organize photos"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Create Album</span>
              </button>

              {/* The EXACTLY ONE Single Upload Button */}
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

              {/* Sync uploaded photos to permanent repository assets */}
              <button
                type="button"
                onClick={handleSyncBrowserImages}
                disabled={isUploading}
                className="p-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] hover:border-[#C5A059] text-[#C5A059] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                title="Sync uploaded photos to permanent repository assets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
              </button>

              {/* Select Mode toggle (available when images exist in current view) */}
              {((!activeAlbum && activeTab === 'photos' && images.length > 0) ||
                (activeAlbum && activeAlbum.imageIds.length > 0)) && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSelectMode(!isSelectMode);
                    setSelectedIds(new Set());
                  }}
                  className={`px-3 py-2 text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelectMode
                      ? 'bg-[#C5A059] text-black border-[#C5A059] font-semibold'
                      : 'bg-[#1A1A1A] text-[#999999] hover:text-white border-[#333333]'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{isSelectMode ? 'Done' : 'Select'}</span>
                </button>
              )}

              {/* Album settings action if currently inside an album */}
              {activeAlbum && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAddPhotosToCurrentAlbumModal(true)}
                    className="p-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-[#C5A059] hover:text-white transition-colors"
                    title="Add existing photos to this album"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleOpenRenameAlbum(activeAlbum, e)}
                    className="p-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-white transition-colors"
                    title="Rename Album"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteAlbum(activeAlbum.id, activeAlbum.name, e)}
                    className="p-2 bg-[#1A1A1A] hover:bg-red-950 border border-[#333333] text-red-400 hover:text-red-200 transition-colors"
                    title="Delete Album (photos will remain in gallery)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                {selectedIds.size} of {currentDisplayImages.length} selected
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

            <div className="flex flex-wrap items-center gap-2">
              {/* If inside an album: allow removing from album or moving to another album */}
              {activeAlbum ? (
                <>
                  <button
                    type="button"
                    onClick={handleBulkRemoveFromAlbum}
                    disabled={selectedIds.size === 0}
                    className="px-3.5 py-1.5 bg-[#141414] hover:bg-amber-950/60 border border-amber-800 text-amber-200 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Remove selected from this album (photos remain in main gallery)"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>Remove from Album ({selectedIds.size})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAddToAlbumModal({
                        open: true,
                        imageIds: Array.from<string>(selectedIds),
                        isMove: true,
                        sourceAlbumId: activeAlbum.id
                      })
                    }
                    disabled={selectedIds.size === 0}
                    className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#252525] border border-[#C5A059] text-[#C5A059] text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <MoveRight className="w-3.5 h-3.5" />
                    <span>Move to Another Album</span>
                  </button>
                </>
              ) : (
                /* In Main Gallery: Add selected photos to album */
                <button
                  type="button"
                  onClick={() =>
                    setAddToAlbumModal({
                      open: true,
                      imageIds: Array.from<string>(selectedIds),
                      isMove: false
                    })
                  }
                  disabled={selectedIds.size === 0}
                  className="px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Add to Album ({selectedIds.size})</span>
                </button>
              )}

              {/* Delete permanently from gallery */}
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0}
                className="px-3.5 py-1.5 bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-200 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete from Gallery</span>
              </button>
            </div>
          </div>
        )}

        {/* Filter, Search & Sort Bar (shown when viewing photos list or inside album) */}
        {(activeTab === 'photos' || activeAlbum) && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
            {/* Category Tabs (dynamically rendered only if custom tags exist, strictly excluding removed categories) */}
            {availableCategories.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {availableCategories.map((cat) => (
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
            )}

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
        )}

        {/* MAIN CONTENT AREA */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-mono uppercase tracking-widest text-[#777777]">Loading Gallery...</p>
          </div>
        ) : activeTab === 'albums' && !activeAlbum ? (
          /* =========================================================================
           * ALBUMS GRID VIEW (Facebook / Instagram style album collection)
           * ========================================================================= */
          <div>
            {displayAlbums.length === 0 ? (
              <div className="bg-[#141414] border border-[#262626] py-16 px-6 text-center max-w-xl mx-auto my-8">
                <div className="w-16 h-16 border border-[#C5A059]/40 bg-[#1A1A1A] flex items-center justify-center text-[#C5A059] mx-auto mb-4">
                  <FolderPlus className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif italic text-white mb-2" style={{ fontFamily: themeConfig.fontHeadline }}>
                  No Albums Created Yet
                </h3>
                <p className="text-xs text-[#888888] font-light max-w-md mx-auto mb-6 leading-relaxed">
                  Organize your photos into custom albums like <strong>Travel</strong>, <strong>Events</strong>, <strong>School</strong>, <strong>Food</strong>, or <strong>Projects</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateAlbumModalOpen(true)}
                  className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Create Your First Album</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Create Album Card */}
                <div
                  onClick={() => setCreateAlbumModalOpen(true)}
                  className="group relative aspect-square bg-[#111111] border-2 border-dashed border-[#282828] hover:border-[#C5A059] flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#333333] group-hover:border-[#C5A059] flex items-center justify-center text-[#C5A059] mb-3 transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white group-hover:text-[#C5A059] transition-colors text-center">
                    Create New Album
                  </span>
                  <span className="text-[10px] text-[#777777] font-mono mt-1 text-center">
                    Organize photos
                  </span>
                </div>

                {/* Album Cards */}
                {displayAlbums.map((album) => {
                  const coverUrl = getAlbumCoverDataUrl(album);
                  return (
                    <div
                      key={album.id}
                      onClick={() => setActiveAlbum(album)}
                      className="group relative aspect-square bg-[#141414] border border-[#262626] hover:border-[#C5A059] overflow-hidden cursor-pointer shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col justify-end"
                    >
                      {/* Album Cover Photo */}
                      {coverUrl ? (
                        <img
                          src={resolveImageUrl(coverUrl)}
                          alt={album.name}
                          loading="lazy"
                          onError={(e) => {
                            if (e.currentTarget.src.includes('/uploads/gallery/')) {
                              e.currentTarget.src = e.currentTarget.src.replace('/uploads/gallery/', '/assets/gallery/');
                            }
                          }}
                          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#161616] flex flex-col items-center justify-center text-[#444444]">
                          <Folder className="w-12 h-12 mb-2" />
                          <span className="text-[11px] font-mono uppercase tracking-wider">Empty Album</span>
                        </div>
                      )}

                      {/* Gradient Backdrop for Text Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      {/* Top Action Options for Album */}
                      <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleOpenRenameAlbum(album, e)}
                          className="p-1.5 bg-black/80 hover:bg-[#C5A059] text-white hover:text-black border border-white/20 transition-colors"
                          title="Rename Album"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAlbum(album.id, album.name, e)}
                          className="p-1.5 bg-black/80 hover:bg-red-600 text-white border border-white/20 transition-colors"
                          title="Delete Album (photos remain in gallery)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bottom Album Info */}
                      <div className="relative z-10 p-3.5 sm:p-4">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5A059] block mb-0.5">
                          {album.imageIds.length} {album.imageIds.length === 1 ? 'Photo' : 'Photos'}
                        </span>
                        <h4 className="text-sm sm:text-base font-medium text-white truncate group-hover:text-[#C5A059] transition-colors">
                          {album.name}
                        </h4>
                        {album.description && (
                          <p className="text-[11px] text-[#A0A0A0] font-light line-clamp-1 mt-0.5">
                            {album.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
           * PHOTOS GRID VIEW (All Photos or Photos inside active album)
           * ========================================================================= */
          <div>
            {currentDisplayImages.length === 0 ? (
              <div className="bg-[#141414] border border-[#262626] py-16 px-6 text-center max-w-xl mx-auto my-8">
                <div className="w-16 h-16 border border-[#C5A059]/40 bg-[#1A1A1A] flex items-center justify-center text-[#C5A059] mx-auto mb-4">
                  {activeAlbum ? <Folder className="w-8 h-8" /> : <Images className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-serif italic text-white mb-2" style={{ fontFamily: themeConfig.fontHeadline }}>
                  {activeAlbum
                    ? `No Photos in "${activeAlbum.name}"`
                    : searchQuery || selectedCategory !== 'All'
                    ? 'No Matching Photos'
                    : 'No Photos in Gallery'}
                </h3>
                <p className="text-xs text-[#888888] font-light max-w-md mx-auto leading-relaxed mb-4">
                  {activeAlbum
                    ? 'This album is currently empty. You can add uploaded photos from your gallery or upload new photos.'
                    : searchQuery || selectedCategory !== 'All'
                    ? 'Try adjusting your search query or filters.'
                    : 'Click the "Upload Photos" button above to upload photos to your gallery.'}
                </p>

                {activeAlbum && images.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAddPhotosToCurrentAlbumModal(true)}
                    className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photos to this Album</span>
                  </button>
                )}
              </div>
            ) : (
              /* Facebook/Instagram-style square photo grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {currentDisplayImages.map((img, index) => {
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

                      {/* Photo Image Frame */}
                      <img
                        src={resolveImageUrl(img.dataUrl || img.imageUrl)}
                        alt={img.title}
                        loading="lazy"
                        onError={(e) => {
                          if (e.currentTarget.src.includes('/uploads/gallery/')) {
                            e.currentTarget.src = e.currentTarget.src.replace('/uploads/gallery/', '/assets/gallery/');
                          }
                        }}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Hover Overlay with Details & Quick Actions */}
                      {!isSelectMode && (
                        <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                          {/* Top Bar on Hover */}
                          <div className="flex items-center justify-between">
                            {img.category && !REMOVED_CATEGORIES.has(img.category) ? (
                              <span className="text-[9px] font-mono uppercase tracking-wider text-[#C5A059] bg-black/70 px-2 py-0.5 border border-[#C5A059]/30 truncate max-w-[120px]">
                                {img.category}
                              </span>
                            ) : (
                              <span />
                            )}
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

                          {/* Action Buttons on Hover */}
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

                            {/* If in an album: option to remove from album (keeps in gallery) */}
                            {activeAlbum ? (
                              <button
                                type="button"
                                onClick={(e) => handleRemoveFromAlbum(activeAlbum.id, img.id, e)}
                                className="p-1.5 bg-[#1A1A1A] hover:bg-amber-600 text-white border border-[#333333] transition-colors"
                                title="Remove from this album (keeps in main Gallery)"
                              >
                                <Folder className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              /* In main gallery: option to add to album */
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAddToAlbumModal({ open: true, imageIds: [img.id] });
                                }}
                                className="p-1.5 bg-[#1A1A1A] hover:bg-[#C5A059] text-white hover:text-black border border-[#333333] transition-colors"
                                title="Add to Album"
                              >
                                <FolderPlus className="w-3.5 h-3.5" />
                              </button>
                            )}

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
                              title="Delete from Gallery"
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
                  Photo {activeLightboxIndex + 1} of {currentDisplayImages.length}
                </span>
                {activeAlbum && (
                  <>
                    <span className="hidden sm:inline text-xs text-[#666666]">|</span>
                    <span className="hidden sm:inline text-xs text-[#C5A059] font-mono">
                      Album: {activeAlbum.name}
                    </span>
                  </>
                )}
                <span className="hidden sm:inline text-xs text-[#666666]">|</span>
                <span className="hidden sm:inline text-xs font-medium text-white/80">
                  {activeLightboxImage.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Remove from album button if viewing inside an album */}
                {activeAlbum && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFromAlbum(activeAlbum.id, activeLightboxImage.id)}
                    className="p-2 bg-[#1A1A1A] hover:bg-amber-600 text-white border border-[#333333] transition-colors"
                    title="Remove from this album (keeps in Gallery)"
                  >
                    <Folder className="w-4 h-4" />
                  </button>
                )}

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
              {currentDisplayImages.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveLightboxIndex((prev) =>
                      prev !== null && prev > 0 ? prev - 1 : currentDisplayImages.length - 1
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
                  src={resolveImageUrl(activeLightboxImage.dataUrl || activeLightboxImage.imageUrl)}
                  alt={activeLightboxImage.title}
                  onError={(e) => {
                    if (e.currentTarget.src.includes('/uploads/gallery/')) {
                      e.currentTarget.src = e.currentTarget.src.replace('/uploads/gallery/', '/assets/gallery/');
                    }
                  }}
                  className="max-w-full max-h-[75vh] object-contain shadow-2xl border border-[#222222]"
                />
              </div>

              {currentDisplayImages.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveLightboxIndex((prev) =>
                      prev !== null && prev < currentDisplayImages.length - 1 ? prev + 1 : 0
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
                {activeLightboxImage.category && !REMOVED_CATEGORIES.has(activeLightboxImage.category) ? (
                  <>{activeLightboxImage.category} · </>
                ) : null}
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

        {/* CREATE ALBUM MODAL */}
        {createAlbumModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setCreateAlbumModalOpen(false)}
          >
            <div
              className="bg-[#141414] border border-[#C5A059] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#262626] mb-5">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-[#C5A059]" />
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C5A059]">
                    Create New Album
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateAlbumModalOpen(false)}
                  className="text-[#888888] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAlbum} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#999999] mb-1.5">
                    Album Name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Travel, Events, School, Food, Projects"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#C5A059] text-sm text-white px-3 py-2 outline-none"
                  />
                  {/* Preset quick suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-[#666666] font-mono mr-1">Suggestions:</span>
                    {['Travel', 'Events', 'School', 'Food', 'Projects', 'Internship'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setNewAlbumName(sug)}
                        className="text-[10px] font-mono bg-[#1C1C1C] hover:bg-[#C5A059] hover:text-black text-[#A0A0A0] px-2 py-0.5 border border-[#303030] transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#999999] mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newAlbumDesc}
                    onChange={(e) => setNewAlbumDesc(e.target.value)}
                    placeholder="Add an optional note about this collection..."
                    className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#C5A059] text-xs text-white px-3 py-2 outline-none resize-none"
                  />
                </div>

                {addToAlbumModal.open && addToAlbumModal.imageIds.length > 0 && (
                  <p className="text-xs text-[#C5A059] font-mono bg-[#C5A059]/10 p-2.5 border border-[#C5A059]/20">
                    ✓ {addToAlbumModal.imageIds.length} selected photo(s) will be added to this new album.
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setCreateAlbumModalOpen(false)}
                    className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#222222] text-xs uppercase tracking-wider text-[#888888] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider"
                  >
                    Create Album
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* RENAME ALBUM MODAL */}
        {renameAlbumModal && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setRenameAlbumModal(null)}
          >
            <div
              className="bg-[#141414] border border-[#C5A059] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#262626] mb-5">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C5A059]">
                  Rename Album
                </span>
                <button
                  type="button"
                  onClick={() => setRenameAlbumModal(null)}
                  className="text-[#888888] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAlbumRename} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#999999] mb-1.5">
                    Album Name
                  </label>
                  <input
                    type="text"
                    required
                    value={renameAlbumName}
                    onChange={(e) => setRenameAlbumName(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#C5A059] text-sm text-white px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#999999] mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={renameAlbumDesc}
                    onChange={(e) => setRenameAlbumDesc(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#C5A059] text-xs text-white px-3 py-2 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setRenameAlbumModal(null)}
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

        {/* ADD TO ALBUM / MOVE TO ALBUM MODAL */}
        {addToAlbumModal.open && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setAddToAlbumModal({ open: false, imageIds: [] })}
          >
            <div
              className="bg-[#141414] border border-[#C5A059] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#262626] mb-5">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C5A059]">
                  {addToAlbumModal.isMove ? 'Move Photos to Album' : 'Add Photos to Album'}
                </span>
                <button
                  type="button"
                  onClick={() => setAddToAlbumModal({ open: false, imageIds: [] })}
                  className="text-[#888888] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#A0A0A0] mb-4">
                Select an album for {addToAlbumModal.imageIds.length} selected photo(s):
              </p>

              {/* Album List Selection */}
              <div className="max-h-60 overflow-y-auto space-y-2 mb-5 pr-1">
                {albums.length === 0 ? (
                  <p className="text-xs text-[#777777] italic py-2">
                    No albums exist yet. Create one below!
                  </p>
                ) : (
                  albums
                    .filter((a) => !addToAlbumModal.sourceAlbumId || a.id !== addToAlbumModal.sourceAlbumId)
                    .map((album) => {
                      const cover = getAlbumCoverDataUrl(album);
                      return (
                        <div
                          key={album.id}
                          onClick={() => handleConfirmAddToAlbum(album.id)}
                          className="flex items-center justify-between p-3 bg-[#1A1A1A] hover:bg-[#252525] border border-[#2D2D2D] hover:border-[#C5A059] cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-black border border-[#333333] overflow-hidden shrink-0 flex items-center justify-center">
                              {cover ? (
                                <img src={resolveImageUrl(cover)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Folder className="w-4 h-4 text-[#666666]" />
                              )}
                            </div>
                            <div>
                              <h5 className="text-xs font-medium text-white">{album.name}</h5>
                              <span className="text-[10px] font-mono text-[#888888]">
                                {album.imageIds.length} photos
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-[#C5A059] font-mono">Select →</span>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Or Create New Album on the fly */}
              <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCreateAlbumModalOpen(true)}
                  className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-[#222222] border border-[#C5A059]/60 text-[#C5A059] text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Album</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddToAlbumModal({ open: false, imageIds: [] })}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#888888] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADD PHOTOS TO CURRENT ALBUM MODAL */}
        {addPhotosToCurrentAlbumModal && activeAlbum && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-hidden overscroll-none"
            onClick={() => {
              setAddPhotosToCurrentAlbumModal(false);
              setPhotosToAddToAlbum(new Set());
            }}
          >
            <div
              className="bg-[#141414] border border-[#C5A059] max-w-4xl w-full p-3.5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col h-[90dvh] sm:h-[85vh] max-h-[92dvh] sm:max-h-[850px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Pinned Modal Header */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#262626] mb-2 sm:mb-3 shrink-0">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C5A059] block truncate">
                    Add Photos to "{activeAlbum.name}"
                  </span>
                  <p className="text-[11px] text-[#888888] mt-0.5 truncate">
                    Select photos from your Gallery to organize into this album
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAddPhotosToCurrentAlbumModal(false);
                    setPhotosToAddToAlbum(new Set());
                  }}
                  className="text-[#888888] hover:text-white p-1 shrink-0 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Photo selector scrollable area with smooth vertical mobile scrolling */}
              <div
                ref={addPhotosScrollRef}
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 sm:pr-2 my-1 touch-pan-y"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {allImages.length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <p className="text-xs text-[#777777] italic">
                      No photos uploaded to your gallery yet. Use the upload button in the header.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 pb-2">
                    {allImages.map((img) => {
                      const alreadyInAlbum = activeAlbum.imageIds.includes(img.id);
                      const isSelected = photosToAddToAlbum.has(img.id);

                      return (
                        <div
                          key={img.id}
                          onClick={() => {
                            if (alreadyInAlbum) return;
                            setPhotosToAddToAlbum((prev) => {
                              const next = new Set(prev);
                              if (next.has(img.id)) next.delete(img.id);
                              else next.add(img.id);
                              return next;
                            });
                          }}
                          className={`group relative flex flex-col border transition-all cursor-pointer bg-[#0D0D0D] overflow-hidden ${
                            alreadyInAlbum
                              ? 'opacity-45 border-[#222222] cursor-not-allowed'
                              : isSelected
                              ? 'border-[#C5A059] ring-2 ring-[#C5A059] shadow-md shadow-[#C5A059]/10'
                              : 'border-[#262626] hover:border-[#C5A059]/60 hover:bg-[#121212]'
                          }`}
                        >
                          {/* Landscape-friendly display container with 16:10 aspect ratio */}
                          <div className="relative w-full aspect-[16/10] bg-[#0A0A0A] flex items-center justify-center p-1.5 overflow-hidden">
                            <img
                              src={resolveImageUrl(img.dataUrl || img.imageUrl)}
                              alt={img.title || 'Gallery Photo'}
                              className="max-w-full max-h-full w-auto h-auto object-contain select-none pointer-events-none transition-transform duration-200 group-hover:scale-[1.02]"
                              loading="lazy"
                            />

                            {/* Already In Album Overlay */}
                            {alreadyInAlbum && (
                              <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] flex items-center justify-center p-2">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-[#B0B0B0] bg-black/90 px-2.5 py-1 border border-white/10">
                                  Already in Album
                                </span>
                              </div>
                            )}

                            {/* Selection Checkmark Indicator Badge */}
                            {!alreadyInAlbum && (
                              <div
                                className={`absolute top-2 right-2 w-6 h-6 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-[#C5A059] text-black shadow-md'
                                    : 'bg-black/75 text-transparent border border-white/20 group-hover:border-[#C5A059]'
                                }`}
                              >
                                <Check className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40 text-white'}`} />
                              </div>
                            )}
                          </div>

                          {/* Landscape Card Info Strip */}
                          <div className="px-3 py-2 bg-[#141414] border-t border-[#222222] flex items-center justify-between gap-2 shrink-0">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-white truncate" title={img.title || 'Untitled Photo'}>
                                {img.title || 'Untitled Photo'}
                              </p>
                              {img.category ? (
                                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block truncate">
                                  {img.category}
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-[#555555] block truncate">
                                  {img.width && img.height ? `${img.width} × ${img.height}` : 'Photo'}
                                </span>
                              )}
                            </div>

                            <div className="shrink-0">
                              {alreadyInAlbum ? (
                                <span className="text-[10px] font-mono text-[#666666]">
                                  In Album
                                </span>
                              ) : isSelected ? (
                                <span className="text-[10px] font-mono text-[#C5A059] font-semibold">
                                  Selected
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-[#777777] group-hover:text-white transition-colors">
                                  Select
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pinned Bottom Confirmation Actions */}
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[#262626] mt-auto shrink-0 bg-[#141414]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#C5A059] font-medium">
                    {photosToAddToAlbum.size} photo(s) selected
                  </span>
                  {photosToAddToAlbum.size > 0 && (
                    <button
                      type="button"
                      onClick={() => setPhotosToAddToAlbum(new Set())}
                      className="text-[11px] text-[#888888] hover:text-white underline ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAddPhotosToCurrentAlbumModal(false);
                      setPhotosToAddToAlbum(new Set());
                    }}
                    className="px-3.5 sm:px-4 py-2 bg-[#1A1A1A] hover:bg-[#222222] text-xs uppercase tracking-wider text-[#888888] hover:text-white border border-[#2D2D2D] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePhotosToActiveAlbum}
                    disabled={photosToAddToAlbum.size === 0}
                    className="px-4 sm:px-5 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Add to Album
                  </button>
                </div>
              </div>
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
                    Category / Tag <span className="text-[#666666] font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="Optional tag (e.g. Highlights, Travel)"
                    className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#C5A059] text-xs text-white px-3 py-2 outline-none"
                  />
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
