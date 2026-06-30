"use client";

import { createContext, useContext } from "react";

export type ProfileLevel = "Bronze" | "Silber" | "Gold" | "Platin";

export type Profile = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_seed: string | null;
  district: string | null;
  city_id: string;
  level: ProfileLevel;
  coins: number;
  total_coins_earned: number;
  interests: string[];
  missions_completed: number;
  onboarding_completed: boolean;
  joined_at: string;
};

const UserContext = createContext<Profile | null>(null);

export function UserProvider({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={profile}>{children}</UserContext.Provider>;
}

export function useProfile(): Profile {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useProfile must be used inside <UserProvider>");
  }
  return ctx;
}
