'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Check, Loader } from 'lucide-react';

interface Props {
  currentUrl: string;
  onSaved: (url: string) => void;
}

type Status = 'idle' | 'uploading' | 'saved' | 'error';

export default function PortraitUpload({ currentUrl, onSaved }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(currentUrl);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file.');
      setStatus('error');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setStatus('uploading');
    setErrorMsg('');

    try {
      // Step 1 — get Cloudinary signature
      const signRes = await fetch('/api/settings/sign-portrait', { method: 'POST' });
      if (!signRes.ok) {
        const body = await signRes.json().catch(() => ({}));
        throw new Error(`Sign failed (${signRes.status}): ${body.error ?? 'unknown'}`);
      }
      const { signature, timestamp, folder, api_key, cloud_name } = await signRes.json();

      // Step 2 — upload directly to Cloudinary via fetch (no XHR needed for single file)
      const form = new FormData();
      form.append('file', file);
      form.append('api_key', api_key);
      form.append('timestamp', String(timestamp));
      form.append('signature', signature);
      form.append('folder', folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        { method: 'POST', body: form }
      );
      if (!uploadRes.ok) {
        const body = await uploadRes.json().catch(() => ({}));
        throw new Error(`Cloudinary error (${uploadRes.status}): ${body.error?.message ?? 'unknown'}`);
      }
      const { secure_url } = await uploadRes.json();

      // Step 3 — save URL to site_settings
      const saveRes = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'portrait_url', value: secure_url }),
      });
      if (!saveRes.ok) {
        const body = await saveRes.json().catch(() => ({}));
        throw new Error(`Save failed (${saveRes.status}): ${body.error ?? 'Did you create the site_settings table in Supabase?'}`);
      }

      setPreview(secure_url);
      onSaved(secure_url);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('[portrait upload]', err);
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      {/* Portrait preview */}
      <div className="relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-surface border border-black/8">
        {preview ? (
          <Image src={preview} alt="Portrait" fill className="object-cover" sizes="128px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#e8e8ed]" />
          </div>
        )}
      </div>

      {/* Upload area */}
      <div className="flex-1 w-full">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        <div
          className="w-full border-2 border-dashed border-black/10 rounded-2xl p-6 text-center cursor-pointer hover:border-accent hover:bg-accent/[0.03] transition-colors"
          onClick={() => status !== 'uploading' && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {status === 'uploading' && (
            <div className="flex flex-col items-center gap-2">
              <Loader size={20} className="animate-spin text-accent" />
              <p className="text-[13px] text-text-secondary">Uploading…</p>
            </div>
          )}

          {status === 'saved' && (
            <div className="flex flex-col items-center gap-2">
              <Check size={20} className="text-green-600" />
              <p className="text-[13px] text-green-600 font-medium">Portrait saved!</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-2">
              <X size={20} className="text-destructive" />
              <p className="text-[13px] text-destructive font-medium">Upload failed</p>
              <p className="text-[12px] text-text-secondary break-all px-2">{errorMsg}</p>
              <p className="text-[12px] text-accent mt-1">Click to try again</p>
            </div>
          )}

          {status === 'idle' && (
            <div className="flex flex-col items-center gap-2">
              <Upload size={20} className="text-text-secondary" />
              <p className="text-[13px] font-medium text-text-primary">
                {preview ? 'Replace portrait' : 'Upload portrait'}
              </p>
              <p className="text-[12px] text-text-secondary">Click or drag an image here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
