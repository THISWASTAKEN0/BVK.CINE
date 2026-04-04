export interface Collection {
  id: string;
  name: string;
  description: string | null;
  shoot_date: string | null;
  cover_photo_id: string | null;
  cover_photo_position: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  cover_photo?: CoverPhoto | null;
  photo_count?: number;
}

export interface CoverPhoto {
  id: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
}

export interface Photo {
  id: string;
  collection_id: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  filename: string;
  display_order: number;
  created_at: string;
}

export interface UploadItem {
  localId: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
  photo?: Photo;
}

export interface CollectionFormData {
  name: string;
  description: string;
  shoot_date: string;
  is_published: boolean;
}
