"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type Result<T = void> = { error?: string; data?: T };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function joinMission(missionId: string): Promise<Result<{ alreadyJoined: boolean }>> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("mission_participants")
    .insert({ user_id: user.id, mission_id: missionId });

  if (error) {
    if (error.code === "23505") {
      return { data: { alreadyJoined: true } };
    }
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/missions");
  return { data: { alreadyJoined: false } };
}

export async function completeMission(
  missionId: string,
  coinsEarned: number,
): Promise<Result> {
  const { supabase, user } = await requireUser();

  const { data: participation, error: pErr } = await supabase
    .from("mission_participants")
    .select("id, completed_at")
    .eq("user_id", user.id)
    .eq("mission_id", missionId)
    .maybeSingle();

  if (pErr) return { error: pErr.message };
  if (!participation) return { error: "Keine Anmeldung gefunden" };
  if (participation.completed_at) return { error: "Bereits abgeschlossen" };

  const { error: updErr } = await supabase
    .from("mission_participants")
    .update({
      completed_at: new Date().toISOString(),
      coins_earned: coinsEarned,
      qr_verified: true,
    })
    .eq("id", participation.id);

  if (updErr) return { error: updErr.message };

  await supabase.from("karma_transactions").insert({
    user_id: user.id,
    amount: coinsEarned,
    kind: "earn_mission",
    reference_id: missionId,
    description: "Mission abgeschlossen",
  });

  const { data: prof } = await supabase
    .from("profiles")
    .select("coins, total_coins_earned, missions_completed")
    .eq("id", user.id)
    .single();

  if (prof) {
    const newTotal = prof.total_coins_earned + coinsEarned;
    const newLevel =
      newTotal >= 1200 ? "Platin" :
      newTotal >= 700 ? "Gold" :
      newTotal >= 300 ? "Silber" : "Bronze";

    await supabase
      .from("profiles")
      .update({
        coins: prof.coins + coinsEarned,
        total_coins_earned: newTotal,
        missions_completed: prof.missions_completed + 1,
        level: newLevel,
      })
      .eq("id", user.id);
  }

  revalidatePath("/app");
  revalidatePath("/app/profile");
  revalidatePath("/app/missions");
  return {};
}

export async function redeemReward(
  rewardId: string,
  coinCost: number,
  title: string,
): Promise<Result<{ code: string }>> {
  const { supabase, user } = await requireUser();

  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("coins")
    .eq("id", user.id)
    .single();

  if (profErr) return { error: profErr.message };
  if (!prof || prof.coins < coinCost) {
    return { error: "Nicht genug Karma-Punkte" };
  }

  const code = `KC-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;

  const { error: redErr } = await supabase
    .from("reward_redemptions")
    .insert({ user_id: user.id, reward_id: rewardId, code });

  if (redErr) return { error: redErr.message };

  await supabase.from("karma_transactions").insert({
    user_id: user.id,
    amount: -coinCost,
    kind: "spend_reward",
    reference_id: rewardId,
    description: `Eingelöst: ${title}`,
  });

  await supabase
    .from("profiles")
    .update({ coins: prof.coins - coinCost })
    .eq("id", user.id);

  revalidatePath("/app/rewards");
  revalidatePath("/app");
  revalidatePath("/app/profile");
  return { data: { code } };
}

export async function saveOnboarding(interests: string[], district: string | null): Promise<Result> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({
      interests,
      district,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/app");
  return {};
}
