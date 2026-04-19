'use client';

import { useState } from 'react';
import Image from 'next/image';
import { thumbUrl, downloadUrl } from '@/lib/cloudinary';
import { Download } from 'lucide-react';
import Lightbox from './Lightbox';
import type { Photo } from '@/lib/types';

interface Props {
  photos: Photo[];
}

export default function PhotoMasonryGrid({ photos }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-24 text-text-secondary">
        <p className="font-light">No photos in this collection yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="masonry-grid">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            className="masonry-item block w-full text-left group relative rounded-xl overflow-hidden cursor-pointer"
            onClick={() => setLightboxIndex(index)}
            aria-label={`Open photo: ${photo.filename}`}
          >
            <div className="relative w-full overflow-hidden rounded-xl">
              <Image
                src={thumbUrl(photo.cloudinary_public_id)}
                alt={photo.filename}
                width={600}
                height={400}
                className="w-full h-auto object-cover transition-transform duration-500 ease-apple group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-xl" />

              {/* Download button — appears on hover */}
              <a
                href={downloadUrl(photo.cloudinary_public_id)}
                download
                onClick={(e) => e.stopPropagation()}
                aria-label="Download photo"
                className="absolute bottom-2.5 right-2.5 p-2 rounded-full text-white
                  opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                  transition-all duration-200 liquid-glass-pill"
              >
                <Download size={14} />
              </a>
            </div>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
