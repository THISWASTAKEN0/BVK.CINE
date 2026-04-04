'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Pencil,
  Trash2,
  ChevronRight,
  ImageIcon,
  Calendar,
} from 'lucide-react';
import { adminThumbUrl } from '@/lib/cloudinary';
import type { Collection } from '@/lib/types';

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="toggle-track"
      style={{ background: value ? 'var(--accent)' : undefined }}
    >
      <div
        className="toggle-thumb"
        style={{ transform: value ? 'translateX(18px)' : 'translateX(0)' }}
      />
    </button>
  );
}

// ── Confirmation dialog ───────────────────────────────────────────────────────
function DeleteDialog({
  name,
  photoCount,
  onConfirm,
  onCancel,
}: {
  name: string;
  photoCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fade-in-up">
        <h3 className="font-semibold text-[17px] text-text-primary">Delete collection?</h3>
        <p className="text-[14px] text-text-secondary mt-2 leading-relaxed">
          <strong className="text-text-primary">{name}</strong> and its{' '}
          {photoCount} {photoCount === 1 ? 'photo' : 'photos'} will be permanently
          deleted from Cloudinary and cannot be recovered.
        </p>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-black/10 text-[14px] font-medium text-text-secondary hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-[14px] font-medium hover:opacity-90 transition-opacity"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sortable row ──────────────────────────────────────────────────────────────
function SortableRow({
  collection,
  onTogglePublished,
  onEdit,
  onDelete,
}: {
  collection: Collection & { photo_count: number };
  onTogglePublished: (id: string, value: boolean) => void;
  onEdit: (c: Collection) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const coverPublicId = collection.cover_photo?.cloudinary_public_id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white rounded-2xl border border-black/8 flex items-center gap-3 px-4 py-3 shadow-sm"
    >
      {/* Drag handle */}
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        className="text-text-secondary/40 hover:text-text-secondary cursor-grab active:cursor-grabbing p-1 -ml-1 touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </div>

      {/* Cover thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface flex-shrink-0">
        {coverPublicId ? (
          <Image
            src={adminThumbUrl(coverPublicId)}
            alt=""
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary/30">
            <ImageIcon size={18} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] text-text-primary truncate">
          {collection.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[12px] text-text-secondary">
            {collection.photo_count} {collection.photo_count === 1 ? 'photo' : 'photos'}
          </span>
          {collection.shoot_date && (
            <>
              <span className="text-text-secondary/40 text-[12px]">·</span>
              <span className="flex items-center gap-1 text-[12px] text-text-secondary">
                <Calendar size={10} />
                {new Date(collection.shoot_date + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Toggle
          value={collection.is_published}
          onChange={(v) => onTogglePublished(collection.id, v)}
        />

        <button
          onClick={() => onEdit(collection)}
          className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
          aria-label="Edit collection"
        >
          <Pencil size={15} />
        </button>

        <Link
          href={`/admin/collections/${collection.id}`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface text-text-primary text-[13px] font-medium hover:bg-[#e8e8ed] transition-colors"
        >
          Manage
          <ChevronRight size={13} />
        </Link>

        <button
          onClick={() => onDelete(collection.id)}
          className="p-2 rounded-lg text-text-secondary hover:bg-red-50 hover:text-destructive transition-colors"
          aria-label="Delete collection"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
interface Props {
  collections: (Collection & { photo_count: number })[];
  onReorder: (ordered: (Collection & { photo_count: number })[]) => void;
  onTogglePublished: (id: string, value: boolean) => void;
  onEdit: (c: Collection) => void;
  onDelete: (id: string, name: string, photoCount: number) => void;
}

export default function SortableCollectionList({
  collections,
  onReorder,
  onTogglePublished,
  onEdit,
  onDelete,
}: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    photoCount: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = collections.findIndex((c) => c.id === active.id);
      const newIndex = collections.findIndex((c) => c.id === over.id);
      onReorder(arrayMove(collections, oldIndex, newIndex));
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={collections.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {collections.map((col) => (
              <SortableRow
                key={col.id}
                collection={col}
                onTogglePublished={onTogglePublished}
                onEdit={onEdit}
                onDelete={(id) =>
                  setDeleteTarget({ id, name: col.name, photoCount: col.photo_count })
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {deleteTarget && (
        <DeleteDialog
          name={deleteTarget.name}
          photoCount={deleteTarget.photoCount}
          onConfirm={() => {
            onDelete(deleteTarget.id, deleteTarget.name, deleteTarget.photoCount);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
