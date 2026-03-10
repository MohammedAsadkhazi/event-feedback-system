import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

const sizeMap = {
  sm: 14,
  md: 18,
  lg: 28,
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  showValue = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const starSize = sizeMap[size];
  const display = hovered || value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`transition-all duration-150 ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} focus:outline-none`}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            size={starSize}
            className={`transition-all duration-150 ${
              star <= display
                ? "fill-accent text-accent drop-shadow-[0_0_4px_oklch(0.78_0.17_55/0.6)]"
                : "text-muted fill-transparent"
            }`}
          />
        </button>
      ))}
      {showValue && value > 0 && (
        <span className="ml-1.5 text-sm font-semibold text-accent">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export function DisplayStars({
  rating,
  size = "sm",
}: { rating: number; size?: "sm" | "md" | "lg" }) {
  const starSize = sizeMap[size];
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={starSize}
          className={`${
            star <= Math.round(rating)
              ? "fill-accent text-accent"
              : star - 0.5 <= rating
                ? "fill-accent/50 text-accent"
                : "text-muted fill-transparent"
          }`}
        />
      ))}
    </div>
  );
}
