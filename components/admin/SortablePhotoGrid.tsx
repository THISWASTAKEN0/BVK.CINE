'use client';

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
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PhotoCard from './PhotoCard';
import type { Photo } from '@/lib/types';

function SortablePhoto({
  photo,
  isCover,
  isHoverPhoto,
  onDelete,
  onSetCover,
  onSetHoverPhoto,
}: {
  photo: Photo;
  isCover: boolean;
  isHoverPhoto: boolean;
  onDelete: (id: string) => void;
  onSetCover: (id: string) => void;
  onSetHoverPhoto: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PhotoCard
        photo={photo}
        isCover={isCover}
        isHoverPhoto={isHoverPhoto}
        onDelete={onDelete}
        onSetCover={onSetCover}
        onSetHoverPhoto={onSetHoverPhoto}
        isDragging={isDragging}
      />
    </div>
  );
}

interface Props {
  photos: Photo[];
  coverPhotoId: string | null;
  hoverPhotoId: string | null;
  onReorder: (photos: Photo[]) => void;
  onDelete: (id: string) => void;
  onSetCover: (id: string) => void;
  onSetHoverPhoto: (id: string) => void;
}

export default function SortablePhotoGrid({
  photos,
  coverPhotoId,
  hoverPhotoId,
  onReorder,
  onDelete,
  onSetCover,
  onSetHoverPhoto,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      onReorder(arrayMove(photos, oldIndex, newIndex));
    }
  };

  if (photos.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-text-secondary/50 border-2 border-dashed border-black/8 rounded-2xl">
        <p className="text-sm">No photos yet. Upload some above.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <SortablePhoto
              key={photo.id}
              photo={photo}
              isCover={photo.id === coverPhotoId}
              isHoverPhoto={photo.id === hoverPhotoId}
              onDelete={onDelete}
              onSetCover={onSetCover}
              onSetHoverPhoto={onSetHoverPhoto}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
