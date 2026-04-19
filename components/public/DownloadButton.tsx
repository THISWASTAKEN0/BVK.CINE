'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface Props {
  publicId:  string;
  filename?: string;
  /** Extra Tailwind / class names for the button wrapper */
  className?: string;
  iconSize?: number;
}

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/** Full-res URL safe for client-side fetch (no fl_attachment so CORS is clean) */
function fullResUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/q_auto/${publicId}`;
}

/** Force-download URL — sets Content-Disposition: attachment server-side */
function forceDownloadUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/fl_attachment,q_auto/${publicId}`;
}

export default function DownloadButton({
  publicId,
  filename = 'photo',
  className = '',
  iconSize = 14,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    /*
      iOS Safari sends fl_attachment downloads to the Files app, not Photos.
      Web Share API with a File object triggers the native share sheet, where
      "Save Image" saves directly to the Photos app.

      Strategy:
        1. If navigator.canShare({ files }) is supported → fetch blob → share
           (iOS 15+, Android Chrome, desktop Chrome/Edge)
        2. Otherwise → open the fl_attachment URL (desktop Safari / older browsers)
    */
    if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function') {
      setLoading(true);
      try {
        const res  = await fetch(fullResUrl(publicId));
        const blob = await res.blob();
        const ext  = blob.type.split('/')[1] || 'jpg';
        const file = new File([blob], `${filename}.${ext}`, { type: blob.type });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          return; // done — user picked "Save Image" → Photos
        }
      } catch {
        // User cancelled the share sheet or share failed — fall through to URL download
      } finally {
        setLoading(false);
      }
    }

    // Fallback: open fl_attachment URL in new tab (desktop browsers)
    window.open(forceDownloadUrl(publicId), '_blank');
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label="Download photo"
      className={className}
    >
      {loading
        ? <Loader2 size={iconSize} className="animate-spin" />
        : <Download size={iconSize} />}
    </button>
  );
}
