"use client";

interface TagProps {
  label: string;
  color: string;
}

export default function Tag({ label, color }: TagProps) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: `${color}18`,
        color: color,
        border: `1px solid ${color}28`,
      }}
    >
      {label}
    </span>
  );
}
