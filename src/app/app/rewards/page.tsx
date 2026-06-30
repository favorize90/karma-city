import { RewardsClient } from "./RewardsClient";
import { getMyRedemptions, getRewards } from "@/lib/db/queries";

export default async function RewardsPage() {
  const [rewards, redemptions] = await Promise.all([
    getRewards("soest"),
    getMyRedemptions(),
  ]);
  return <RewardsClient rewards={rewards} redemptions={redemptions} />;
}
