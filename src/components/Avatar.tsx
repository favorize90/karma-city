import { levelConfig } from "@/data/mockData";

export function Avatar({
  name,
  seed,
  size = "md",
  level,
}: {
  name: string;
  seed: string;
  size?: "sm" | "md" | "lg" | "xl";
  level?: "Bronze" | "Silber" | "Gold" | "Platin";
}) {
  const sizeClasses = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg", xl: "w-20 h-20 text-2xl" };
  const ringSize = { sm: "ring-2", md: "ring-2", lg: "ring-[3px]", xl: "ring-4" };
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  const colors = [
    "bg-emerald-100 text-emerald-700",
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-cyan-100 text-cyan-700",
    "bg-indigo-100 text-indigo-700",
  ];
  const colorIndex = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;

  const levelRing = level ? levelConfig[level] : null;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full font-semibold ${sizeClasses[size]} ${colors[colorIndex]} ${
        levelRing ? `${ringSize[size]} ${levelRing.border} ring-offset-2` : ""
      }`}
    >
      {initials}
    </div>
  );
}
