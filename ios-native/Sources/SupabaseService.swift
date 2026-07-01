import Foundation
import Supabase

/// Session storage backed by UserDefaults.
///
/// Demo/pilot tradeoff: the default KeychainLocalStorage silently loses the
/// session in unsigned/ad-hoc builds (errSecMissingEntitlement), which made
/// data requests run unauthenticated after login. UserDefaults persists in
/// every build type. Before a public store release, switch back to the
/// Keychain (signed builds) for at-rest encryption of the refresh token.
struct UserDefaultsLocalStorage: AuthLocalStorage {
    private let defaults = UserDefaults.standard

    func store(key: String, value: Data) throws {
        defaults.set(value, forKey: key)
    }

    func retrieve(key: String) throws -> Data? {
        defaults.data(forKey: key)
    }

    func remove(key: String) throws {
        defaults.removeObject(forKey: key)
    }
}

/// Central Supabase gateway for the native app.
@MainActor
final class AppState: ObservableObject {
    static let shared = AppState()

    let client = SupabaseClient(
        supabaseURL: URL(string: "https://jwztffvzmuegeihrrfep.supabase.co")!,
        supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3enRmZnZ6bXVlZ2VpaHJyZmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzYwNDMsImV4cCI6MjA5MzA1MjA0M30.YmevuYd0qgA_KjtvGj4JGhYZ3COBz4iI80TMqooT0Oc",
        options: SupabaseClientOptions(
            auth: .init(storage: UserDefaultsLocalStorage())
        )
    )

    @Published var session: Session?
    @Published var profile: Profile?
    @Published var bootstrapped = false
    @Published var profileError: String?

    private init() {}

    /// Start listening for auth changes; resolves the initial session.
    func bootstrap() async {
        for await change in client.auth.authStateChanges {
            NSLog("KC bootstrap event=%@ session=%@", String(describing: change.event), change.session == nil ? "nil" : "vorhanden")
            session = change.session
            if change.session != nil {
                await refreshProfile()
            } else {
                profile = nil
            }
            bootstrapped = true
        }
    }

    func refreshProfile() async {
        guard let uid = session?.user.id else {
            NSLog("KC refreshProfile: keine Session")
            return
        }
        do {
            let result: Profile = try await client
                .from("profiles")
                .select()
                .eq("id", value: uid)
                .single()
                .execute()
                .value
            profile = result
            profileError = nil
            NSLog("KC profile geladen: %@ coins=%d", result.greetingName, result.coins)
        } catch {
            profileError = "Profil konnte nicht geladen werden: \(error.localizedDescription)"
            NSLog("KC profile load FAILED: %@", String(describing: error))
        }
    }

    // MARK: - Auth

    func signIn(email: String, password: String) async throws {
        try await client.auth.signIn(email: email, password: password)
    }

    func signUp(email: String, password: String, fullName: String) async throws {
        try await client.auth.signUp(
            email: email,
            password: password,
            data: ["full_name": .string(fullName)]
        )
        // Accounts are auto-confirmed (demo mode); if no session came back,
        // sign in directly so the user lands in the app immediately.
        if (try? await client.auth.session) == nil {
            try await client.auth.signIn(email: email, password: password)
        }
    }

    func signOut() async {
        try? await client.auth.signOut()
    }

    // MARK: - Data

    func loadMissions() async throws -> [Mission] {
        try await client
            .from("missions")
            .select()
            .eq("active", value: true)
            .eq("city_id", value: "soest")
            .order("coins", ascending: false)
            .execute()
            .value
    }

    func loadRewards() async throws -> [Reward] {
        try await client
            .from("rewards")
            .select()
            .eq("active", value: true)
            .eq("city_id", value: "soest")
            .order("coin_cost", ascending: true)
            .execute()
            .value
    }

    func loadLeaderboard() async throws -> [LeaderboardEntry] {
        try await client
            .from("profiles")
            .select("id, display_name, full_name, district, level, coins, missions_completed")
            .order("coins", ascending: false)
            .limit(25)
            .execute()
            .value
    }

    func loadMyParticipations() async throws -> [Participation] {
        guard let uid = session?.user.id else { return [] }
        return try await client
            .from("mission_participants")
            .select("id, mission_id, completed_at, coins_earned")
            .eq("user_id", value: uid)
            .execute()
            .value
    }

    func loadMyRedemptions() async throws -> [Redemption] {
        guard let uid = session?.user.id else { return [] }
        return try await client
            .from("reward_redemptions")
            .select("id, reward_id, code, created_at")
            .eq("user_id", value: uid)
            .order("created_at", ascending: false)
            .execute()
            .value
    }

    // MARK: - Actions

    func joinMission(_ missionId: String) async throws {
        guard let uid = session?.user.id else { throw AppError.notAuthenticated }
        try await client
            .from("mission_participants")
            .insert(["user_id": uid.uuidString, "mission_id": missionId])
            .execute()
    }

    struct RedeemResult: Codable { let code: String }

    func redeemReward(_ reward: Reward) async throws -> String {
        let rows: [RedeemResult] = try await client
            .rpc("redeem_reward", params: [
                "p_reward_id": AnyJSON.string(reward.id),
                "p_coin_cost": AnyJSON.integer(reward.coinCost),
                "p_title": AnyJSON.string(reward.title),
            ])
            .execute()
            .value
        await refreshProfile()
        guard let code = rows.first?.code else { throw AppError.unexpected }
        return code
    }

    func completeMission(_ mission: Mission) async throws {
        try await client
            .rpc("complete_mission", params: [
                "p_mission_id": AnyJSON.string(mission.id),
                "p_coins": AnyJSON.integer(mission.coins),
            ])
            .execute()
        await refreshProfile()
    }

    func saveOnboarding(interests: [String], district: String?) async throws {
        guard let uid = session?.user.id else { throw AppError.notAuthenticated }
        struct OnboardingUpdate: Encodable {
            let interests: [String]
            let district: String?
            let onboarding_completed: Bool
        }
        try await client
            .from("profiles")
            .update(OnboardingUpdate(interests: interests, district: district, onboarding_completed: true))
            .eq("id", value: uid)
            .execute()
        await refreshProfile()
    }
}

enum AppError: LocalizedError {
    case notAuthenticated
    case unexpected

    var errorDescription: String? {
        switch self {
        case .notAuthenticated: return "Nicht angemeldet"
        case .unexpected: return "Unerwarteter Fehler"
        }
    }
}
