"use client";

import { KarmaCoinIcon } from "./KarmaCoin";
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export function CoinCounter({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    spring.set(value);
    const unsub = display.on("change", (v) => {
      if (ref.current) ref.current.textContent = String(v);
    });
    return unsub;
  }, [value, spring, display]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="inline-flex items-center gap-3.5 rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-amber-50 to-yellow-50 px-5 py-3.5 shadow-[0_4px_20px_-6px_rgba(245,158,11,0.15)]"
    >
      <motion.div
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
      >
        <KarmaCoinIcon size={38} />
      </motion.div>
      <div className="flex flex-col">
        <span ref={ref} className="text-2xl font-extrabold text-amber-800 font-mono tracking-tighter leading-none">
          {value}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber-500/70 mt-0.5">
          Karma-Punkte
        </span>
      </div>
    </motion.div>
  );
}
