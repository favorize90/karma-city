"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, QrCode, CheckCircle2, ShoppingBag, Loader2 } from "lucide-react";
import { useProfile } from "@/components/UserProvider";
import { KarmaCoinBadge } from "@/components/KarmaCoin";
import { redeemReward } from "@/lib/db/actions";
import type { RewardRow, RedemptionRow } from "@/lib/db/queries";

type Props = {
  rewards: RewardRow[];
  redemptions: RedemptionRow[];
};

export function RewardsClient({ rewards, redemptions: initialRedemptions }: Props) {
  const profile = useProfile();
  const [tab, setTab] = useState<"shop" | "redeemed">("shop");
  const [justRedeemed, setJustRedeemed] = useState<{ id: string; code: string } | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleRedeem = (rewardId: string, coinCost: number, title: string) => {
    setError(null);
    setPendingId(rewardId);
    startTransition(async () => {
      const result = await redeemReward(rewardId, coinCost, title);
      setPendingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.data) {
        setJustRedeemed({ id: rewardId, code: result.data.code });
        setTimeout(() => setJustRedeemed(null), 4000);
      }
    });
  };

  const allRedemptions = justRedeemed && !initialRedemptions.some((r) => r.code === justRedeemed.code)
    ? [
        {
          id: justRedeemed.code,
          reward_id: justRedeemed.id,
          code: justRedeemed.code,
          created_at: new Date().toISOString(),
          redeemed_at: null,
          reward_title: rewards.find((r) => r.id === justRedeemed.id)?.title ?? null,
          reward_partner: rewards.find((r) => r.id === justRedeemed.id)?.partner ?? null,
        } as RedemptionRow,
        ...initialRedemptions,
      ]
    : initialRedemptions;

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Belohnungen</h1>
          <p className="mt-1 text-sm text-zinc-400">Löse deine Karma Coins ein</p>
        </div>
        <KarmaCoinBadge coins={profile.coins} size="md" />
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}

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
          {allRedemptions.length > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-white/20 px-1.5 text-[10px] font-mono">
              {allRedemptions.length}
            </span>
          )}
        </button>
      </div>

      {tab === "shop" && (
        <div className="mt-5 space-y-3 pb-4">
          {rewards.map((reward, i) => {
            const canAfford = profile.coins >= reward.coin_cost;
            const isJustRedeemed = justRedeemed?.id === reward.id;
            const isPending = pendingId === reward.id;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="overflow-hidden rounded-2xl border border-zinc-200/60 bg-white"
              >
                <div className="flex gap-4 p-4">
                  <div className="h-20 w-20 shrink-0 rounded-xl bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(https://picsum.photos/seed/${reward.image_seed ?? reward.id}/200/200)`,
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-800">
                          {reward.title}
                        </h3>
                        <p className="text-[11px] text-zinc-400 font-medium">
                          {reward.partner}
                        </p>
                      </div>
                      <KarmaCoinBadge coins={reward.coin_cost} size="sm" />
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
                            onClick={() =>
                              canAfford &&
                              !isPending &&
                              handleRedeem(reward.id, reward.coin_cost, reward.title)
                            }
                            disabled={!canAfford || isPending}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition ${
                              canAfford
                                ? "bg-karma-green text-white hover:bg-karma-green-dark disabled:opacity-70"
                                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                            }`}
                          >
                            {isPending ? (
                              <>
                                <Loader2 size={11} className="animate-spin" /> Speichere...
                              </>
                            ) : canAfford ? (
                              "Einlösen"
                            ) : (
                              "Nicht genug Coins"
                            )}
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
          {allRedemptions.length === 0 ? (
            <div className="mt-12 text-center">
              <Gift size={32} className="mx-auto text-zinc-300" />
              <p className="mt-3 text-sm text-zinc-400">
                Noch keine Gutscheine eingelöst.
              </p>
              <button
                onClick={() => setTab("shop")}
                className="mt-2 text-sm font-medium text-karma-green"
              >
                Zum Shop
              </button>
            </div>
          ) : (
            allRedemptions.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-zinc-200/60 bg-white p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                    <QrCode size={24} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-800">
                      {r.reward_title ?? "Reward"}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {r.reward_partner ?? ""} · Eingelöst am{" "}
                      {new Date(r.created_at).toLocaleDateString("de-DE")}
                    </p>
                    <p className="mt-1 font-mono text-xs text-zinc-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 inline-block">
                      {r.code}
                    </p>
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
