'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDeckStore, Slide } from '@/store/deck-store';
import { GripVertical } from 'lucide-react';

function SortableItem({ slide, index }: { slide: Slide; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 border rounded text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 group"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing">
         <GripVertical size={14} />
      </div>
      <div className="truncate flex-1">
        Slide {index + 1}
      </div>
    </div>
  );
}

export function SortableSlideList() {
  const { slides, moveSlide } = useDeckStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
       const oldIndex = slides.findIndex((s) => s.id === active.id);
       const newIndex = slides.findIndex((s) => s.id === over?.id);
       
       if (oldIndex !== -1 && newIndex !== -1) {
           moveSlide(oldIndex, newIndex);
       }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={slides.map(s => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
            {slides.map((slide, index) => (
                <SortableItem key={slide.id} slide={slide} index={index} />
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
