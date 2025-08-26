"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Paintbrush } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sketch } from "@uiw/react-color";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-8 w-8 rounded-full border flex items-center justify-center transition-transform transform hover:scale-110",
            className
          )}
          style={{ backgroundColor: value }}
          aria-label="Select color"
        >
          <Paintbrush className="h-5 w-5 text-white mix-blend-difference" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Sketch
          style={{ marginLeft: 20 }}
          color={value}
          onChange={(color) => {
            onChange(color.hex);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
