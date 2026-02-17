"use client";

interface StarRatingProps {
  rating?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
}

export default function StarRating({ rating, onChange, readonly }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => !readonly && onChange?.(n)}
          className="text-sm transition-all leading-none"
          style={{
            color: n <= (rating || 0) ? "#d97706" : "#e5e7eb",
            cursor: readonly ? "default" : "pointer",
            transform: "scale(1)",
            transition: "transform 0.1s ease, color 0.1s ease",
          }}
          onMouseEnter={(e) => {
            if (!readonly) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.25)";
          }}
          onMouseLeave={(e) => {
            if (!readonly) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
