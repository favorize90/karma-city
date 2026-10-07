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

// Coin values are never taken from the caller. Both RPCs read the price or
// reward from the database and apply every write in one transaction (see
// supabase/migrations/0007_server_authoritative_karma.sql). Their p_coins,
// p_coin_cost and p_title parameters are ignored server-side and only exist
// so shipped iOS builds keep working.

export async function completeMission(missionId: string): Promise<Result> {
  const { supabase } = await requireUser();

  const { error } = await supabase.rpc("complete_mission", {
    p_mission_id: missionId,
    p_coins: 0,
  });
  if (error) return { error: error.message };

  revalidatePath("/app");
  revalidatePath("/app/profile");
  revalidatePath("/app/missions");
  return {};
}

export async function redeemReward(rewardId: string): Promise<Result<{ code: string }>> {
  const { supabase } = await requireUser();

  const { data, error } = await supabase.rpc("redeem_reward", {
    p_reward_id: rewardId,
    p_coin_cost: 0,
    p_title: "",
  });
  if (error) return { error: error.message };

  const code = (data as { code: string }[] | null)?.[0]?.code;
  if (!code) return { error: "Einlösung fehlgeschlagen" };

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
