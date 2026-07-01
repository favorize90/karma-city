import Foundation

// Codable models matching the Supabase public schema. CodingKeys are explicit
// because the PostgREST decoder delivers snake_case column names as-is.

struct Profile: Codable, Identifiable, Equatable {
    let id: UUID
    var fullName: String?
    var displayName: String?
    var avatarSeed: String?
    var district: String?
    var cityId: String
    var level: String
    var coins: Int
    var totalCoinsEarned: Int
    var interests: [String]
    var missionsCompleted: Int
    var onboardingCompleted: Bool
    var joinedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case fullName = "full_name"
        case displayName = "display_name"
        case avatarSeed = "avatar_seed"
        case district
        case cityId = "city_id"
        case level
        case coins
        case totalCoinsEarned = "total_coins_earned"
        case interests
        case missionsCompleted = "missions_completed"
        case onboardingCompleted = "onboarding_completed"
        case joinedAt = "joined_at"
    }

    var greetingName: String {
        displayName ?? fullName?.components(separatedBy: " ").first ?? "Karma-Bürger"
    }

    var initials: String {
        let name = fullName ?? displayName ?? "K"
        let parts = name.components(separatedBy: " ").filter { !$0.isEmpty }
        let letters = parts.prefix(2).compactMap { $0.first }
        return String(letters).uppercased()
    }

    /// Coins still needed to reach the next level; nil when Platin.
    var nextLevel: (name: String, threshold: Int)? {
        switch level {
        case "Bronze": return ("Silber", 300)
        case "Silber": return ("Gold", 700)
        case "Gold": return ("Platin", 1200)
        default: return nil
        }
    }
}

struct Mission: Codable, Identifiable, Equatable {
    let id: String
    let cityId: String
    let title: String
    let description: String
    let fullDescription: String
    let category: String
    let coins: Int
    let difficulty: Int
    let distance: String
    let deadline: String
    let organizer: String
    let location: String
    let participantsMax: Int
    let imageSeed: String

    enum CodingKeys: String, CodingKey {
        case id
        case cityId = "city_id"
        case title
        case description
        case fullDescription = "full_description"
        case category
        case coins
        case difficulty
        case distance
        case deadline
        case organizer
        case location
        case participantsMax = "participants_max"
        case imageSeed = "image_seed"
    }
}

struct Reward: Codable, Identifiable, Equatable {
    let id: String
    let cityId: String
    let title: String
    let partner: String
    let coinCost: Int
    let description: String
    let category: String
    let imageSeed: String

    enum CodingKeys: String, CodingKey {
        case id
        case cityId = "city_id"
        case title
        case partner
        case coinCost = "coin_cost"
        case description
        case category
        case imageSeed = "image_seed"
    }
}

struct Redemption: Codable, Identifiable, Equatable {
    let id: UUID
    let rewardId: String
    let code: String
    let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case rewardId = "reward_id"
        case code
        case createdAt = "created_at"
    }
}

struct Participation: Codable, Identifiable, Equatable {
    let id: UUID
    let missionId: String
    let completedAt: Date?
    let coinsEarned: Int?

    enum CodingKeys: String, CodingKey {
        case id
        case missionId = "mission_id"
        case completedAt = "completed_at"
        case coinsEarned = "coins_earned"
    }
}

/// Leaderboard entry — a slim public projection of profiles.
struct LeaderboardEntry: Codable, Identifiable, Equatable {
    let id: UUID
    let displayName: String?
    let fullName: String?
    let district: String?
    let level: String
    let coins: Int
    let missionsCompleted: Int

    enum CodingKeys: String, CodingKey {
        case id
        case displayName = "display_name"
        case fullName = "full_name"
        case district
        case level
        case coins
        case missionsCompleted = "missions_completed"
    }

    var name: String { displayName ?? fullName ?? "Anonym" }
}
