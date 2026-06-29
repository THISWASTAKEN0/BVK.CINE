'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Collection, CollectionFormData } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: CollectionFormData) => Promise<void>;
  initial?: Collection | null;
  title?: string;
}

const defaultForm: CollectionFormData = {
  name: '',
  description: '',
  shoot_date: '',
  is_published: true,
};

const inputBase =
  'w-full px-3.5 py-2.5 rounded-xl text-[15px] text-text-primary placeholder:text-text-secondary focus:outline-none transition';

function useInputStyle() {
  const base = { background: 'var(--surface-2)', border: '1px solid var(--border-strong)' };
  const focused = { ...base, borderColor: 'var(--accent)' };
  return { base, focused };
}

export default function CollectionForm({
  open, onClose, onSave, initial, title = 'New Collection',
}: Props) {
  const [form, setForm]     = useState<CollectionFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const { base: inputStyle, focused: inputFocus } = useInputStyle();

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        description: initial.description ?? '',
        shoot_date: initial.shoot_date ?? '',
        is_published: initial.is_published,
      });
    } else {
      setForm(defaultForm);
    }
    setError('');
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Collection name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col animate-slide-in-right"
        style={{
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-32px 0 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="font-semibold text-[17px] text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-2"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="cname" className="block text-[13px] font-medium text-text-primary mb-1.5">
              Collection Name <span style={{ color: 'var(--destructive)' }}>*</span>
            </label>
            <input
              id="cname"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Senior Portraits — Spring 2025"
              className={inputBase}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="cdesc" className="block text-[13px] font-medium text-text-primary mb-1.5">
              Description
            </label>
            <textarea
              id="cdesc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="A brief description of the shoot…"
              className={`${inputBase} resize-none`}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
            />
          </div>

          {/* Shoot Date */}
          <div>
            <label htmlFor="cdate" className="block text-[13px] font-medium text-text-primary mb-1.5">
              Shoot Date
            </label>
            <input
              id="cdate"
              type="date"
              value={form.shoot_date}
              onChange={(e) => setForm({ ...form, shoot_date: e.target.value })}
              className={inputBase}
              style={{ ...inputStyle, colorScheme: 'dark' }}
              onFocus={(e) => Object.assign(e.target.style, { ...inputFocus, colorScheme: 'dark' })}
              onBlur={(e) => Object.assign(e.target.style, { ...inputStyle, colorScheme: 'dark' })}
            />
          </div>

          {/* Published toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-[14px] font-medium text-text-primary">Published</p>
              <p className="text-[12px] text-text-secondary mt-0.5">
                Visible to the public when turned on
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.is_published}
              onClick={() => setForm({ ...form, is_published: !form.is_published })}
              className="toggle-track"
              style={{ background: form.is_published ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="toggle-thumb"
                style={{ transform: form.is_published ? 'translateX(18px)' : 'translateX(0)' }}
              />
            </button>
          </div>

          {error && (
            <div
              className="px-3.5 py-2.5 rounded-xl text-[13px]"
              style={{ background: 'rgba(255,77,79,0.1)', color: 'var(--destructive)', border: '1px solid rgba(255,77,79,0.2)' }}
            >
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div
          className="px-6 py-4 flex gap-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors"
            style={{ border: '1px solid var(--border-strong)', background: 'var(--surface-2)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-white text-[14px] font-semibold transition-opacity disabled:opacity-50"
            style={{ background: 'var(--accent)' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
}
