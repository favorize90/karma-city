export function KarmaCoinIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="24" cy="24" r="22" fill="#f59e0b" />
      <circle cx="24" cy="24" r="19" fill="#fbbf24" />
      <circle cx="24" cy="24" r="17" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* Leaf / Heart hybrid symbol */}
      <path
        d="M24 14c-3 0-8 4-8 10 0 5 3.5 8 8 10 4.5-2 8-5 8-10 0-6-5-10-8-10z"
        fill="#15803d"
        opacity="0.9"
      />
      <path
        d="M24 18v12M24 18c-2 2-4 5-4 8"
        stroke="#f0fdf4"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function KarmaCoinBadge({ coins, size = "md" }: { coins: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "text-xs gap-1 px-2 py-0.5",
    md: "text-sm gap-1.5 px-3 py-1",
    lg: "text-lg gap-2 px-4 py-1.5 font-semibold",
  };
  const iconSize = { sm: 14, md: 18, lg: 24 };

  return (
    <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono ${sizeClasses[size]}`}>
      <KarmaCoinIcon size={iconSize[size]} />
      {coins}
    </span>
  );
}
