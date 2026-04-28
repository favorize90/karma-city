"use client";

import { useState } from "react";
import { rewards, currentUser } from "@/data/mockData";
import { KarmaCoinBadge } from "@/components/KarmaCoin";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, QrCode, CheckCircle2, ShoppingBag } from "lucide-react";

export default function RewardsPage() {
  const [tab, setTab] = useState<"shop" | "redeemed">("shop");
  const [justRedeemed, setJustRedeemed] = useState<string | null>(null);

  const handleRedeem = (rewardId: string) => {
    setJustRedeemed(rewardId);
    setTimeout(() => setJustRedeemed(null), 3000);
  };

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Belohnungen</h1>
          <p className="mt-1 text-sm text-zinc-400">Löse deine Karma Coins ein</p>
        </div>
        <KarmaCoinBadge coins={currentUser.coins} size="md" />
      </div>

      {/* Tabs */}
      <div className="mt-5 flex rounded-xl bg-white border border-zinc-200 p-1">
        <button
          onClick={() => setTab("shop")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
            tab === "shop" ? "bg-karma-green text-white shadow-sm" : "text-zinc-400"
          }`}
        >
          <ShoppingBag size={14} /> Shop
        </button>
        <button
          onClick={() => setTab("redeemed")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
            tab === "redeemed" ? "bg-karma-green text-white shadow-sm" : "text-zinc-400"
          }`}
        >
          <Gift size={14} /> Meine Gutscheine
        </button>
      </div>

      {tab === "shop" && (
        <div className="mt-5 space-y-3 pb-4">
          {rewards.map((reward, i) => {
            const canAfford = currentUser.coins >= reward.coinCost;
            const isJustRedeemed = justRedeemed === reward.id;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="overflow-hidden rounded-2xl border border-zinc-200/60 bg-white"
              >
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="h-20 w-20 shrink-0 rounded-xl bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(https://picsum.photos/seed/${reward.imageSeed}/200/200)`,
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-800">{reward.title}</h3>
                        <p className="text-[11px] text-zinc-400 font-medium">{reward.partner}</p>
                      </div>
                      <KarmaCoinBadge coins={reward.coinCost} size="sm" />
                    </div>
                    <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                      {reward.description}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                        {reward.category}
                      </span>
                      <AnimatePresence mode="wait">
                        {isJustRedeemed ? (
                          <motion.span
                            key="done"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium"
                          >
                            <CheckCircle2 size={13} /> Eingelöst!
                          </motion.span>
                        ) : (
                          <motion.button
                            key="btn"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => canAfford && handleRedeem(reward.id)}
                            disabled={!canAfford}
                            className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                              canAfford
                                ? "bg-karma-green text-white hover:bg-karma-green-dark"
                                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                            }`}
                          >
                            {canAfford ? "Einlösen" : "Nicht genug Coins"}
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === "redeemed" && (
        <div className="mt-5 space-y-3 pb-4">
          {currentUser.redeemedRewards.length === 0 ? (
            <div className="mt-12 text-center">
              <Gift size={32} className="mx-auto text-zinc-300" />
              <p className="mt-3 text-sm text-zinc-400">Noch keine Gutscheine eingelöst.</p>
              <button
                onClick={() => setTab("shop")}
                className="mt-2 text-sm font-medium text-karma-green"
              >
                Zum Shop
              </button>
            </div>
          ) : (
            currentUser.redeemedRewards.map((r, i) => (
              <motion.div
                key={r.rewardId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-zinc-200/60 bg-white p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                    <QrCode size={24} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-800">{r.title}</h3>
                    <p className="text-[11px] text-zinc-400">Eingelöst am {new Date(r.redeemedDate).toLocaleDateString("de-DE")}</p>
                    <p className="mt-1 font-mono text-xs text-zinc-500 bg-zinc-50 rounded px-2 py-0.5 inline-block">{r.code}</p>
                  </div>
                </div>

                {/* QR Code placeholder */}
                <div className="mt-3 flex items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100 py-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="grid grid-cols-5 gap-[2px]">
                      {Array.from({ length: 25 }).map((_, j) => (
                        <div
                          key={j}
                          className={`h-2.5 w-2.5 ${
                            Math.random() > 0.4 ? "bg-zinc-800" : "bg-white"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-zinc-400">QR-Code vorzeigen</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
