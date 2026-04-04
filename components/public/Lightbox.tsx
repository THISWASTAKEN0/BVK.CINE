'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { fullUrl, filmstripUrl } from '@/lib/cloudinary';
import type { Photo } from '@/lib/types';

interface Props {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

export default function Lightbox({ photos, initialIndex, onClose }: Props) {
  const [current, setCurrent] = useState(initialIndex);
  const filmRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [imgKey, setImgKey] = useState(0); // triggers fade-in on change

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= photos.length) return;
      setCurrent(index);
      setImgKey((k) => k + 1);
    },
    [photos.length]
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, onClose]);

  // Auto-scroll filmstrip to keep active thumb centred
  useEffect(() => {
    const thumb = thumbRefs.current[current];
    if (thumb) {
      thumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [current]);

  // Touch swipe support
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only treat as horizontal swipe if dx > dy and displacement > 50px
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  const photo = photos[current];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#080808] flex flex-col select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${current + 1} of ${photos.length}`}
    >
      {/* ── Top bar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
        <span className="text-white/50 text-sm tabular-nums">
          {current + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Close lightbox"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Main image area ──────────────────────────────── */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Click outside image to close */}
        <button
          className="absolute inset-0 w-full h-full cursor-default"
          onClick={onClose}
          aria-label="Close lightbox"
          tabIndex={-1}
        />

        {/* Previous button */}
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          disabled={current === 0}
          aria-label="Previous photo"
          className={`
            absolute left-4 z-10 p-3 rounded-full
            bg-white/10 backdrop-blur-sm hover:bg-white/20
            transition-all duration-150 text-white
            disabled:opacity-0 disabled:pointer-events-none
          `}
        >
          <ChevronLeft size={22} />
        </button>

        {/* Image — crossfade on change via key */}
        <div
          key={imgKey}
          className="relative max-w-[90vw] max-h-[88vh] animate-fade-in pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={fullUrl(photo.cloudinary_public_id)}
            alt={photo.filename}
            width={1920}
            height={1280}
            className="object-contain max-h-[88vh] w-auto"
            priority
            style={{ maxWidth: '90vw', maxHeight: '88vh' }}
          />
        </div>

        {/* Next button */}
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          disabled={current === photos.length - 1}
          aria-label="Next photo"
          className={`
            absolute right-4 z-10 p-3 rounded-full
            bg-white/10 backdrop-blur-sm hover:bg-white/20
            transition-all duration-150 text-white
            disabled:opacity-0 disabled:pointer-events-none
          `}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* ── Filmstrip ───────────────────────────────────── */}
      <div
        ref={filmRef}
        className="flex gap-2 px-4 pb-4 pt-2 overflow-x-auto flex-shrink-0 scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {photos.map((p, i) => (
          <button
            key={p.id}
            ref={(el) => { thumbRefs.current[i] = el; }}
            onClick={() => goTo(i)}
            aria-label={`Go to photo ${i + 1}`}
            className={`
              flex-shrink-0 w-[60px] h-[60px] relative rounded overflow-hidden
              transition-all duration-150
              ${i === current ? 'ring-2 ring-white opacity-100' : 'opacity-40 hover:opacity-70'}
            `}
          >
            <Image
              src={filmstripUrl(p.cloudinary_public_id)}
              alt=""
              fill
              className="object-cover"
              sizes="60px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
