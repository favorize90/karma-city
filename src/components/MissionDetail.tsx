"use client";

import { Mission, categoryLabels, categoryColors } from "@/data/mockData";
import { KarmaCoinBadge } from "./KarmaCoin";
import { MapPin, Clock, Star, Users, X, Building2, CheckCircle2, Camera, QrCode, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function MissionDetail({
  mission,
  onClose,
}: {
  mission: Mission | null;
  onClose: () => void;
}) {
  const [signedUp, setSignedUp] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  if (!mission) return null;

  const handleSignup = () => {
    setSignedUp(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 backdrop-blur-md sm:items-center"
        onClick={onClose}
      >
        {/* Confetti particles */}
        {showConfetti && (
          <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  x: "50vw",
                  y: "50vh",
                  scale: 0,
                }}
                animate={{
                  opacity: [1, 1, 0],
                  x: `${20 + Math.random() * 60}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1, 0.5],
                  rotate: Math.random() * 720,
                }}
                transition={{ duration: 1.5 + Math.random(), ease: "easeOut" }}
                className="absolute h-2.5 w-2.5 rounded-sm"
                style={{
                  backgroundColor: ["#16a34a", "#f59e0b", "#84cc16", "#22d3ee", "#f43f5e", "#a855f7"][i % 6],
                }}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg overflow-hidden rounded-t-[2rem] bg-white sm:rounded-[2rem] sm:m-4 max-h-[92vh] overflow-y-auto"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-0 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-zinc-200" />
          </div>

          {/* Header image */}
          <div className="relative h-52 overflow-hidden bg-gradient-to-br from-emerald-100 to-zinc-200">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(https://picsum.photos/seed/${mission.imageSeed}/800/500)`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-950/20 to-transparent" />
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-zinc-950/30 p-2 text-white/90 backdrop-blur-md transition hover:bg-zinc-950/50 border border-white/10"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-4 left-5 right-5">
              <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${categoryColors[mission.category]}`}>
                {categoryLabels[mission.category]}
              </span>
              <h2 className="mt-2 text-xl font-extrabold text-white leading-tight font-display tracking-tight">
                {mission.title}
              </h2>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Stats row */}
            <div className="flex flex-wrap gap-2">
              <KarmaCoinBadge coins={mission.coins} size="md" />
              <span className="inline-flex items-center gap-1 rounded-xl bg-zinc-100 px-3 py-1 text-[11px] font-medium text-zinc-600">
                <MapPin size={12} /> {mission.distance}
              </span>
              <span className="inline-flex items-center gap-1 rounded-xl bg-zinc-100 px-3 py-1 text-[11px] text-zinc-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={10} className={i <= mission.difficulty ? "fill-amber-400 text-amber-400" : "text-zinc-300"} />
                ))}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-600 leading-relaxed">
              {mission.fullDescription}
            </p>

            {/* Validation method */}
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-center">
                <QrCode size={18} className="mx-auto text-emerald-600 mb-1" />
                <p className="text-[10px] font-semibold text-emerald-700">QR-Code Check-in</p>
              </div>
              <div className="flex-1 rounded-xl bg-sky-50 border border-sky-100 p-3 text-center">
                <Camera size={18} className="mx-auto text-sky-600 mb-1" />
                <p className="text-[10px] font-semibold text-sky-700">Foto-Nachweis</p>
              </div>
              <div className="flex-1 rounded-xl bg-violet-50 border border-violet-100 p-3 text-center">
                <Users size={18} className="mx-auto text-violet-600 mb-1" />
                <p className="text-[10px] font-semibold text-violet-700">Community-Check</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 rounded-[1.25rem] bg-zinc-50 border border-zinc-100 p-4">
              <div className="flex items-start gap-3 text-sm">
                <Building2 size={15} className="mt-0.5 text-zinc-400 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Organisator</p>
                  <p className="text-sm text-zinc-700 font-medium">{mission.organizer}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={15} className="mt-0.5 text-zinc-400 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Treffpunkt</p>
                  <p className="text-sm text-zinc-700 font-medium">{mission.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Clock size={15} className="mt-0.5 text-zinc-400 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Termin</p>
                  <p className="text-sm text-zinc-700 font-medium">{mission.deadline}</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-zinc-400 font-medium flex items-center gap-1"><Users size={11} /> Teilnehmer</span>
                <span className="font-mono font-bold text-zinc-600">{mission.participantsCurrent}/{mission.participantsMax}</span>
              </div>
              <div className="h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(mission.participantsCurrent / mission.participantsMax) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                />
              </div>
            </div>

            {/* Map placeholder */}
            <div className="h-28 rounded-[1.25rem] bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-[11px] text-zinc-400 font-medium">
              <MapPin size={14} className="mr-1.5" /> Kartenansicht wird geladen...
            </div>

            {/* CTA */}
            <AnimatePresence mode="wait">
              {signedUp ? (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="flex flex-col items-center justify-center gap-2 rounded-[1.25rem] bg-emerald-50 border border-emerald-200 py-5"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                  >
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  </motion.div>
                  <p className="text-sm font-bold text-emerald-700">Du bist dabei!</p>
                  <p className="text-[11px] text-emerald-600">QR-Code wird am Treffpunkt bereitgestellt</p>
                </motion.div>
              ) : (
                <motion.button
                  key="signup"
                  whileTap={{ scale: 0.97, y: 1 }}
                  onClick={handleSignup}
                  className="w-full rounded-[1.25rem] bg-zinc-900 py-4 text-sm font-bold text-white transition hover:bg-emerald-600 flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  Ich bin dabei  +{mission.coins} Karma-Punkte
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
