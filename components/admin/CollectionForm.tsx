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

export default function CollectionForm({
  open,
  onClose,
  onSave,
  initial,
  title = 'New Collection',
}: Props) {
  const [form, setForm] = useState<CollectionFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing
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
    if (!form.name.trim()) {
      setError('Collection name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <h2 className="font-semibold text-[17px]">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="cname"
              className="block text-[13px] font-medium text-text-primary mb-1.5"
            >
              Collection Name <span className="text-destructive">*</span>
            </label>
            <input
              id="cname"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Senior Portraits — Spring 2025"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[15px] placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="cdesc"
              className="block text-[13px] font-medium text-text-primary mb-1.5"
            >
              Description
            </label>
            <textarea
              id="cdesc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="A brief description of the shoot…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[15px] placeholder:text-text-secondary/50 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
            />
          </div>

          {/* Shoot Date */}
          <div>
            <label
              htmlFor="cdate"
              className="block text-[13px] font-medium text-text-primary mb-1.5"
            >
              Shoot Date
            </label>
            <input
              id="cdate"
              type="date"
              value={form.shoot_date}
              onChange={(e) => setForm({ ...form, shoot_date: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[15px] focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
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
              onClick={() =>
                setForm({ ...form, is_published: !form.is_published })
              }
              className="toggle-track"
              style={{ background: form.is_published ? 'var(--accent)' : undefined }}
            >
              <div
                className="toggle-thumb"
                style={{
                  transform: form.is_published
                    ? 'translateX(18px)'
                    : 'translateX(0)',
                }}
              />
            </button>
          </div>

          {error && (
            <p className="text-[13px] text-destructive bg-red-50 px-3.5 py-2.5 rounded-xl">
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-black/10 text-[14px] font-medium text-text-secondary hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-accent text-white text-[14px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Collection'}
          </button>
        </div>
      </div>
    </>
  );
}
