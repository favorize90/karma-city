import { LeaderboardClient } from "./LeaderboardClient";
import { getDistrictStats, getLeaderboard } from "@/lib/db/queries";

export default async function LeaderboardPage() {
  const [rows, districtStats] = await Promise.all([
    getLeaderboard("soest", 30),
    getDistrictStats("soest"),
  ]);
  return <LeaderboardClient rows={rows} districtStats={districtStats} />;
}
