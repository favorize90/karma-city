import { MissionsClient } from "./MissionsClient";
import { getMissionsWithStats, toMission } from "@/lib/db/queries";

export default async function MissionsPage() {
  const rows = await getMissionsWithStats("soest");
  const missions = rows.map(toMission);
  return <MissionsClient missions={missions} />;
}
