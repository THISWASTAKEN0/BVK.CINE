'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, CheckCircle, XCircle, RefreshCw, ImageIcon } from 'lucide-react';
import type { Photo, UploadItem } from '@/lib/types';

const MAX_CONCURRENT = 4;

interface Props {
  collectionId: string;
  onUploaded: (photo: Photo) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({ collectionId, onUploaded }: Props) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<UploadItem[]>([]);
  const activeUploads = useRef(0);

  // Update a single item by localId
  const updateItem = (
    localId: string,
    patch: Partial<UploadItem>
  ) => {
    setItems((prev) =>
      prev.map((it) => (it.localId === localId ? { ...it, ...patch } : it))
    );
    queueRef.current = queueRef.current.map((it) =>
      it.localId === localId ? { ...it, ...patch } : it
    );
  };

  const uploadOne = useCallback(
    async (item: UploadItem) => {
      activeUploads.current += 1;
      updateItem(item.localId, { status: 'uploading' });

      try {
        // Step 1: Get signed upload params
        const signRes = await fetch('/api/cloudinary/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collection_id: collectionId }),
        });

        if (!signRes.ok) throw new Error('Failed to get upload signature');
        const { signature, timestamp, folder, api_key, cloud_name } =
          await signRes.json();

        // Step 2: Upload directly to Cloudinary via XHR (for progress tracking)
        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('api_key', api_key);
        formData.append('timestamp', String(timestamp));
        formData.append('signature', signature);
        formData.append('folder', folder);

        const cloudResult = await new Promise<{
          public_id: string;
          secure_url: string;
        }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              updateItem(item.localId, {
                progress: Math.round((e.loaded / e.total) * 90), // cap at 90 until metadata saved
              });
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(`Cloudinary upload failed: ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error('Network error during upload'));

          xhr.open(
            'POST',
            `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`
          );
          xhr.send(formData);
        });

        // Step 3: Save metadata to Supabase
        const metaRes = await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collection_id: collectionId,
            cloudinary_public_id: cloudResult.public_id,
            cloudinary_url: cloudResult.secure_url,
            filename: item.file.name,
          }),
        });

        if (!metaRes.ok) throw new Error('Failed to save photo metadata');
        const photo: Photo = await metaRes.json();

        updateItem(item.localId, { status: 'done', progress: 100, photo });
        onUploaded(photo);
      } catch (err) {
        updateItem(item.localId, {
          status: 'error',
          error: err instanceof Error ? err.message : 'Upload failed',
        });
      } finally {
        activeUploads.current -= 1;
        processQueue();
      }
    },
    [collectionId, onUploaded]
  );

  const processQueue = useCallback(() => {
    const pending = queueRef.current.filter((it) => it.status === 'pending');
    const slots = MAX_CONCURRENT - activeUploads.current;
    const toStart = pending.slice(0, Math.max(0, slots));
    toStart.forEach((it) => uploadOne(it));
  }, [uploadOne]);

  const enqueue = useCallback(
    (files: File[]) => {
      const newItems: UploadItem[] = files.map((file) => ({
        localId: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: 'pending',
      }));

      setItems((prev) => [...prev, ...newItems]);
      queueRef.current = [...queueRef.current, ...newItems];
      // Small delay to allow state update before processing
      setTimeout(processQueue, 0);
    },
    [processQueue]
  );

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith('image/')
    );
    if (imageFiles.length > 0) enqueue(imageFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRetry = (item: UploadItem) => {
    updateItem(item.localId, { status: 'pending', progress: 0, error: undefined });
    queueRef.current = queueRef.current.map((it) =>
      it.localId === item.localId
        ? { ...it, status: 'pending', progress: 0, error: undefined }
        : it
    );
    setTimeout(processQueue, 0);
  };

  const uploading = items.filter((it) => it.status === 'uploading').length;
  const done = items.filter((it) => it.status === 'done').length;
  const errors = items.filter((it) => it.status === 'error').length;
  const pending = items.filter((it) => it.status === 'pending').length;
  const inProgress = uploading + pending;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center
          transition-all duration-200 cursor-pointer
          ${isDragOver
            ? 'border-accent bg-accent/5 scale-[1.01]'
            : 'border-black/10 bg-surface hover:border-accent/40 hover:bg-accent/3'
          }
        `}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload photos"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full transition-colors ${isDragOver ? 'bg-accent/10' : 'bg-white'}`}>
            <Upload size={28} className={isDragOver ? 'text-accent' : 'text-text-secondary'} />
          </div>
          <div>
            <p className="font-medium text-[15px] text-text-primary">
              {isDragOver ? 'Drop photos here' : 'Drop photos here'}
            </p>
            <p className="text-[13px] text-text-secondary mt-1">
              or <span className="text-accent">click to browse</span> · JPEG, PNG, WebP, HEIC
            </p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
        />
      </div>

      {/* Progress summary */}
      {items.length > 0 && (
        <div className="text-[13px] text-text-secondary flex items-center gap-3">
          {inProgress > 0 && (
            <span className="text-accent font-medium">
              {inProgress} uploading…
            </span>
          )}
          {done > 0 && (
            <span className="text-green-600 font-medium">{done} done</span>
          )}
          {errors > 0 && (
            <span className="text-destructive font-medium">{errors} failed</span>
          )}
        </div>
      )}

      {/* Per-file queue */}
      {items.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.localId}
              className="flex items-center gap-3 bg-surface rounded-xl px-4 py-3"
            >
              <div className="p-1.5 bg-white rounded-lg flex-shrink-0">
                <ImageIcon size={14} className="text-text-secondary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[13px] text-text-primary truncate">
                    {item.file.name}
                  </span>
                  <span className="text-[11px] text-text-secondary flex-shrink-0">
                    {formatBytes(item.file.size)}
                  </span>
                </div>

                {item.status === 'uploading' || item.status === 'pending' ? (
                  <div className="upload-progress-bar">
                    <div
                      className="upload-progress-fill"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                ) : item.status === 'error' ? (
                  <p className="text-[11px] text-destructive truncate">{item.error}</p>
                ) : null}
              </div>

              <div className="flex-shrink-0">
                {item.status === 'done' && (
                  <CheckCircle size={16} className="text-green-500" />
                )}
                {item.status === 'error' && (
                  <button
                    onClick={() => handleRetry(item)}
                    className="flex items-center gap-1 text-[12px] text-destructive hover:opacity-70 transition-opacity"
                    aria-label="Retry upload"
                  >
                    <RefreshCw size={13} />
                    Retry
                  </button>
                )}
                {(item.status === 'uploading' || item.status === 'pending') && (
                  <span className="text-[12px] text-accent font-medium tabular-nums">
                    {item.progress}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
