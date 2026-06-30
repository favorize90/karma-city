import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Mission, MissionCategory } from "@/data/mockData";

export type MissionRow = {
  id: string;
  city_id: string;
  title: string;
  description: string;
  full_description: string;
  category: MissionCategory;
  coins: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  distance: string | null;
  deadline: string | null;
  organizer: string | null;
  location: string | null;
  participants_max: number;
  image_seed: string | null;
};

export type MissionWithStats = MissionRow & {
  participants_current: number;
};

export type RewardRow = {
  id: string;
  city_id: string;
  title: string;
  partner: string;
  coin_cost: number;
  description: string;
  category: string;
  image_seed: string | null;
};

export type LeaderboardRow = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  avatar_seed: string | null;
  district: string | null;
  level: "Bronze" | "Silber" | "Gold" | "Platin";
  coins: number;
  missions_completed: number;
};

export type RedemptionRow = {
  id: string;
  reward_id: string;
  code: string;
  created_at: string;
  redeemed_at: string | null;
  reward_title: string | null;
  reward_partner: string | null;
};

/**
 * Fetch all active missions for the given city plus their current participant
 * counts. One round-trip thanks to the embedded count.
 */
export async function getMissionsWithStats(
  cityId = "soest",
): Promise<MissionWithStats[]> {
  const supabase = await createClient();
  const [missionsRes, participantsRes] = await Promise.all([
    supabase
      .from("missions")
      .select("*")
      .eq("city_id", cityId)
      .eq("active", true)
      .order("coins", { ascending: false }),
    supabase.from("mission_participants").select("mission_id"),
  ]);

  if (missionsRes.error || !missionsRes.data) return [];

  const counts = new Map<string, number>();
  for (const row of participantsRes.data ?? []) {
    const id = (row as { mission_id: string }).mission_id;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return missionsRes.data.map((m) => ({
    id: m.id,
    city_id: m.city_id,
    title: m.title,
    description: m.description,
    full_description: m.full_description,
    category: m.category,
    coins: m.coins,
    difficulty: m.difficulty,
    distance: m.distance,
    deadline: m.deadline,
    organizer: m.organizer,
    location: m.location,
    participants_max: m.participants_max,
    image_seed: m.image_seed,
    participants_current: counts.get(m.id) ?? 0,
  }));
}

export async function getRewards(cityId = "soest"): Promise<RewardRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("city_id", cityId)
    .eq("active", true)
    .order("coin_cost", { ascending: true });

  return error || !data ? [] : (data as RewardRow[]);
}

export async function getLeaderboard(
  cityId = "soest",
  limit = 20,
): Promise<LeaderboardRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, full_name, avatar_seed, district, level, coins, missions_completed",
    )
    .eq("city_id", cityId)
    .order("coins", { ascending: false })
    .order("missions_completed", { ascending: false })
    .limit(limit);

  return error || !data ? [] : (data as LeaderboardRow[]);
}

/** Map a DB row to the legacy Mission shape so MissionCard/MissionDetail stay unchanged. */
export function toMission(row: MissionWithStats): Mission {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    fullDescription: row.full_description,
    category: row.category,
    coins: row.coins,
    difficulty: row.difficulty,
    distance: row.distance ?? "",
    deadline: row.deadline ?? "",
    organizer: row.organizer ?? "",
    location: row.location ?? "",
    participantsMax: row.participants_max,
    participantsCurrent: row.participants_current,
    imageSeed: row.image_seed ?? row.id,
  };
}

export type CommunityStats = {
  total_coins_earned: number;
  active_volunteers: number;
  missions_completed_total: number;
};

export async function getCommunityStats(cityId = "soest"): Promise<CommunityStats> {
  const supabase = await createClient();
  const [profilesRes, completedRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("total_coins_earned")
      .eq("city_id", cityId),
    supabase
      .from("mission_participants")
      .select("*", { count: "exact", head: true })
      .not("completed_at", "is", null),
  ]);

  const profiles = profilesRes.data ?? [];
  const totalCoinsEarned = profiles.reduce(
    (sum, p) => sum + ((p as { total_coins_earned: number | null }).total_coins_earned ?? 0),
    0,
  );

  return {
    total_coins_earned: totalCoinsEarned,
    active_volunteers: profiles.length,
    missions_completed_total: completedRes.count ?? 0,
  };
}

export type DistrictStat = { name: string; missions: number };

export async function getDistrictStats(cityId = "soest"): Promise<DistrictStat[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("district, missions_completed")
    .eq("city_id", cityId)
    .not("district", "is", null);

  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    const d = (row as { district: string | null; missions_completed: number }).district;
    if (!d) continue;
    totals.set(d, (totals.get(d) ?? 0) + ((row as { missions_completed: number }).missions_completed ?? 0));
  }
  return Array.from(totals.entries())
    .map(([name, missions]) => ({ name, missions }))
    .filter((d) => d.missions > 0)
    .sort((a, b) => b.missions - a.missions)
    .slice(0, 5);
}

export async function getMyRedemptions(): Promise<RedemptionRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [redemptionsRes, rewardsRes] = await Promise.all([
    supabase
      .from("reward_redemptions")
      .select("id, reward_id, code, created_at, redeemed_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("rewards").select("id, title, partner"),
  ]);

  if (redemptionsRes.error || !redemptionsRes.data) return [];

  const rewardById = new Map<string, { title: string; partner: string }>();
  for (const r of rewardsRes.data ?? []) {
    rewardById.set(
      (r as { id: string }).id,
      { title: (r as { title: string }).title, partner: (r as { partner: string }).partner },
    );
  }

  return redemptionsRes.data.map((r) => {
    const reward = rewardById.get(r.reward_id);
    return {
      id: r.id,
      reward_id: r.reward_id,
      code: r.code,
      created_at: r.created_at,
      redeemed_at: r.redeemed_at,
      reward_title: reward?.title ?? null,
      reward_partner: reward?.partner ?? null,
    };
  });
}
