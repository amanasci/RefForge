"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  totalStars?: number;
  className?: string;
  size?: number;
}

export function StarRating({
  rating,
  setRating,
  totalStars = 5,
  className,
  size = 16,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);
  const handleSetRating = setRating ? setRating : () => {};
  const handleSetHoverRating = setRating ? setHoverRating : () => {};

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverRating || rating);
        
        return (
          <button
            key={starValue}
            onClick={() => handleSetRating(starValue)}
            onMouseEnter={() => handleSetHoverRating(starValue)}
            onMouseLeave={() => handleSetHoverRating(0)}
            disabled={!setRating}
            className={cn("p-0 bg-transparent border-none", setRating && "cursor-pointer")}
            aria-label={`Set rating to ${starValue}`}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                isFilled
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
