import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

// Build a Cloudinary delivery URL with transformation string
export function getCloudinaryUrl(publicId: string, transforms = 'q_auto,f_auto'): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloud}/image/upload/${transforms}/${publicId}`;
}

// Thumbnail for grids — 600px wide
export function thumbUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, 'w_600,q_auto,f_auto');
}

// Small thumbnail for admin grid — 400px wide
export function adminThumbUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, 'w_400,q_auto,f_auto');
}

// Filmstrip thumbnail — square crop 120px
export function filmstripUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, 'w_120,h_120,c_fill,q_auto,f_auto');
}

// Hero image — 1920px wide
export function heroUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, 'w_1920,q_auto,f_auto');
}

// Full-resolution for lightbox
export function fullUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, 'q_auto,f_auto');
}

// Force-download URL — fl_attachment sets Content-Disposition: attachment
// so the browser downloads the file instead of displaying it, even cross-origin
export function downloadUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, 'fl_attachment,q_auto');
}
