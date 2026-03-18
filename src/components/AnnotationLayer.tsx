"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Annotation } from "@/store/deck-store";

interface AnnotationLayerProps {
  slideId: string;
  annotations: Annotation[];
  onUpdateAnnotation?: (id: string, updates: Partial<Annotation>) => void;
  onRemoveAnnotation?: (id: string) => void;
  readOnly?: boolean;
}

export function AnnotationLayer({
  slideId,
  annotations,
  onUpdateAnnotation,
  onRemoveAnnotation,
  readOnly = false,
}: AnnotationLayerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-10">
      <svg className="w-full h-full" aria-labelledby="annotations-title">
        <title id="annotations-title">Slide Annotations</title>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
          </marker>
        </defs>
        {annotations.map((ann) => {
          if (ann.type === "arrow") {
            return (
              <motion.g
                key={ann.id}
                drag={!readOnly}
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  if (!readOnly) {
                    onUpdateAnnotation?.(ann.id, {
                      x: ann.x + info.offset.x,
                      y: ann.y + info.offset.y,
                    });
                  }
                }}
                className={
                  !readOnly ? "pointer-events-auto cursor-move group" : ""
                }
              >
                <line
                  x1={ann.x}
                  y1={ann.y}
                  x2={ann.x + (ann.width || 50)}
                  y2={ann.y + (ann.height || 50)}
                  stroke={ann.color || "red"}
                  strokeWidth="4"
                  markerEnd="url(#arrowhead)"
                  className="group-hover:stroke-blue-500 transition-colors"
                />
                {!readOnly && (
                  <foreignObject
                    x={ann.x + (ann.width || 50) + 10}
                    y={ann.y + (ann.height || 50) - 10}
                    width="20"
                    height="20"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAnnotation?.(ann.id);
                      }}
                      className="bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer"
                      aria-label="Remove annotation"
                    >
                      <X size={12} />
                    </button>
                  </foreignObject>
                )}
              </motion.g>
            );
          }
          if (ann.type === "circle") {
            return (
              <motion.g
                key={ann.id}
                drag={!readOnly}
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  if (!readOnly) {
                    onUpdateAnnotation?.(ann.id, {
                      x: ann.x + info.offset.x,
                      y: ann.y + info.offset.y,
                    });
                  }
                }}
                className={
                  !readOnly ? "pointer-events-auto cursor-move group" : ""
                }
              >
                <ellipse
                  cx={ann.x}
                  cy={ann.y}
                  rx={ann.width || 30}
                  ry={ann.height || 30}
                  stroke={ann.color || "red"}
                  strokeWidth="4"
                  fill="none"
                  className="group-hover:stroke-blue-500 transition-colors"
                />
                {!readOnly && (
                  <foreignObject
                    x={ann.x + (ann.width || 30) + 5}
                    y={ann.y - (ann.height || 30) - 15}
                    width="20"
                    height="20"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAnnotation?.(ann.id);
                      }}
                      className="bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer"
                      aria-label="Remove annotation"
                    >
                      <X size={12} />
                    </button>
                  </foreignObject>
                )}
              </motion.g>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
}
