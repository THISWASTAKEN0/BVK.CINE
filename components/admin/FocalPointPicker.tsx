'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { thumbUrl } from '@/lib/cloudinary';

interface Props {
  cloudinaryPublicId: string;
  position: string;
  onChange: (position: string) => Promise<boolean>;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function parsePosition(pos: string): { x: number; y: number } {
  const parts = pos.split(' ');
  const x = parseFloat(parts[0]) || 50;
  const y = parseFloat(parts[1]) || 50;
  return { x, y };
}

export default function FocalPointPicker({ cloudinaryPublicId, position, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState<{ x: number; y: number }>(parsePosition(position));
  const [dragging, setDragging] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const calcFromEvent = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)));
    return { x, y };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    setSaveState('idle');
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const pos = calcFromEvent(e.clientX, e.clientY);
    if (pos) setLocal(pos);
  }, [calcFromEvent]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const pos = calcFromEvent(e.clientX, e.clientY);
    if (pos) setLocal(pos);
  }, [dragging, calcFromEvent]);

  const handlePointerUp = useCallback(async () => {
    setDragging(false);
    setSaveState('saving');
    const ok = await onChange(`${local.x}% ${local.y}%`);
    setSaveState(ok ? 'saved' : 'error');
  }, [local, onChange]);

  const statusText = dragging
    ? 'Drag to position…'
    : saveState === 'saving' ? 'Saving…'
    : saveState === 'saved'  ? `Saved — ${local.x}% ${local.y}%`
    : saveState === 'error'  ? 'Save failed — is the column added in Supabase?'
    : `Position: ${local.x}% ${local.y}%`;

  const statusColor = saveState === 'error'
    ? 'text-red-500'
    : saveState === 'saved'
    ? 'text-green-600'
    : 'text-text-secondary/60';

  return (
    <div className="space-y-2">
      <p className="text-[12px] text-text-secondary">
        Click or drag to set the focal point — controls which part stays visible when cropped.
      </p>
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden cursor-crosshair select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <Image
          src={thumbUrl(cloudinaryPublicId)}
          alt="Cover photo focal point"
          fill
          className="object-cover pointer-events-none"
          style={{ objectPosition: `${local.x}% ${local.y}%` }}
          sizes="(max-width: 768px) 100vw, 600px"
          draggable={false}
        />

        {/* Rule-of-thirds grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '33.33% 33.33%',
        }} />

        {/* Focal point crosshair */}
        <div
          className="absolute pointer-events-none"
          style={{ left: `${local.x}%`, top: `${local.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div
            className={`w-8 h-8 rounded-full border-2 border-white transition-transform ${dragging ? 'scale-125' : ''}`}
            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.5)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-px bg-white/60" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-12 bg-white/60" />
        </div>
      </div>

      <p className={`text-[11px] font-mono ${statusColor}`}>
        {statusText}
      </p>
    </div>
  );
}
