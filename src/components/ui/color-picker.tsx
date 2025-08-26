"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#14b8a6",
  "#0ea5e9", "#3b82f6", "#8b5cf6", "#d946ef", "#ec4899", "#78716c"
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn("grid grid-cols-6 gap-2", className)}>
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={cn(
            "h-8 w-8 rounded-full border flex items-center justify-center transition-transform transform hover:scale-110",
            value === color && "ring-2 ring-ring ring-offset-2 ring-offset-background"
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
          aria-label={`Select color ${color}`}
        >
          {value === color && <Check className="h-5 w-5 text-white mix-blend-difference" />}
        </button>
      ))}
    </div>
  );
}
