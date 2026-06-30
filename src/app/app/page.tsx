import { DashboardClient } from "./DashboardClient";
import {
  getCommunityStats,
  getMissionsWithStats,
  toMission,
} from "@/lib/db/queries";

export default async function DashboardPage() {
  const [missionsWithStats, communityStats] = await Promise.all([
    getMissionsWithStats("soest"),
    getCommunityStats("soest"),
  ]);

  const topMissions = missionsWithStats.slice(0, 4).map(toMission);

  return (
    <DashboardClient topMissions={topMissions} communityStats={communityStats} />
  );
}
