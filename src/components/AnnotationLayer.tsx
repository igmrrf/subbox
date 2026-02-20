"use client";

import type { Annotation } from "@/store/deck-store";
import { motion } from "framer-motion";

interface AnnotationLayerProps {
  annotations: Annotation[];
  onAddAnnotation?: (annotation: Annotation) => void;
  onRemoveAnnotation?: (id: string) => void;
  readOnly?: boolean;
}

export function AnnotationLayer({
  annotations,
  onAddAnnotation,
  onRemoveAnnotation,
  readOnly = false,
}: AnnotationLayerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-10">
      <svg className="w-full h-full">
        {annotations.map((ann) => {
          if (ann.type === "arrow") {
            return (
              <motion.g
                key={ann.id}
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                className={!readOnly ? "pointer-events-auto cursor-pointer" : ""}
                onClick={() => !readOnly && onRemoveAnnotation?.(ann.id)}
              >
                <line
                  x1={ann.x}
                  y1={ann.y}
                  x2={ann.x + (ann.width || 50)}
                  y2={ann.y + (ann.height || 50)}
                  stroke={ann.color || "red"}
                  strokeWidth="4"
                  markerEnd="url(#arrowhead)"
                />
              </motion.g>
            );
          }
          if (ann.type === "circle") {
            return (
              <motion.ellipse
                key={ann.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                cx={ann.x}
                cy={ann.y}
                rx={ann.width || 30}
                ry={ann.height || 30}
                stroke={ann.color || "red"}
                strokeWidth="4"
                fill="none"
                className={!readOnly ? "pointer-events-auto cursor-pointer" : ""}
                onClick={() => !readOnly && onRemoveAnnotation?.(ann.id)}
              />
            );
          }
          if (ann.type === "highlight") {
             return (
                 <motion.rect
                    key={ann.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    x={ann.x}
                    y={ann.y}
                    width={ann.width}
                    height={ann.height}
                    fill={ann.color || "yellow"}
                    className={!readOnly ? "pointer-events-auto cursor-pointer" : ""}
                    onClick={() => !readOnly && onRemoveAnnotation?.(ann.id)}
                 />
             )
          }
          return null;
        })}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="red" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
