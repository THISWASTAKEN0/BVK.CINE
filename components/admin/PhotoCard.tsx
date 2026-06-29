'use client';

import Image from 'next/image';
import { X, Star, Layers } from 'lucide-react';
import { adminThumbUrl } from '@/lib/cloudinary';
import type { Photo } from '@/lib/types';

interface Props {
  photo: Photo;
  isCover: boolean;
  isHoverPhoto: boolean;
  onDelete: (id: string) => void;
  onSetCover: (id: string) => void;
  onSetHoverPhoto: (id: string) => void;
  isDragging?: boolean;
}

export default function PhotoCard({
  photo,
  isCover,
  isHoverPhoto,
  onDelete,
  onSetCover,
  onSetHoverPhoto,
  isDragging,
}: Props) {
  return (
    <div
      className={`relative group rounded-xl overflow-hidden aspect-square bg-surface cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-40 shadow-lg scale-105' : 'opacity-100'}
        transition-opacity duration-150
      `}
    >
      <Image
        src={adminThumbUrl(photo.cloudinary_public_id)}
        alt={photo.filename}
        fill
        className="object-cover pointer-events-none"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        draggable={false}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200 rounded-xl" />

      {/* Cover star — top-left */}
      <button
        onClick={(e) => { e.stopPropagation(); onSetCover(photo.id); }}
        aria-label={isCover ? 'Cover photo' : 'Set as cover photo'}
        className={`
          absolute top-2 left-2 p-1.5 rounded-lg
          transition-all duration-150 backdrop-blur-sm
          ${isCover
            ? 'opacity-100 bg-amber-500/90 text-white'
            : 'opacity-0 group-hover:opacity-100 bg-black/40 text-white hover:bg-amber-500/90'
          }
        `}
      >
        <Star size={14} fill={isCover ? 'currentColor' : 'none'} />
      </button>

      {/* Hover photo layers icon — below the star */}
      <button
        onClick={(e) => { e.stopPropagation(); onSetHoverPhoto(photo.id); }}
        aria-label={isHoverPhoto ? 'Hover photo' : 'Set as hover photo'}
        className={`
          absolute top-9 left-2 p-1.5 rounded-lg
          transition-all duration-150 backdrop-blur-sm
          ${isHoverPhoto
            ? 'opacity-100 bg-sky-500/90 text-white'
            : 'opacity-0 group-hover:opacity-100 bg-black/40 text-white hover:bg-sky-500/90'
          }
        `}
      >
        <Layers size={14} />
      </button>

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(photo.id); }}
        aria-label={`Delete ${photo.filename}`}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-destructive/90 transition-all duration-150 backdrop-blur-sm"
      >
        <X size={14} />
      </button>

      {/* Filename tooltip */}
      <div className="absolute bottom-0 inset-x-0 px-2 pb-2 pt-6 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-b-xl">
        <p className="text-white text-[11px] truncate leading-tight">{photo.filename}</p>
      </div>
    </div>
  );
}
