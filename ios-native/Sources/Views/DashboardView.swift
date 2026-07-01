import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var app: AppState

    @State private var missions: [Mission] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.background
                    .ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        headerSection
                        karmaCard
                        missionsSection
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 12)
                    .padding(.bottom, 40)
                }
                .refreshable {
                    await refresh()
                }
            }
            .task {
                await loadMissions()
            }
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        HStack(alignment: .center, spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Text("WILLKOMMEN ZURÜCK")
                    .font(.caption2.weight(.semibold))
                    .tracking(1.6)
                    .foregroundStyle(Theme.textTertiary)

                Text(app.profile?.greetingName ?? "Nachbar")
                    .font(.system(size: 30, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }

            Spacer(minLength: 12)

            if let profile = app.profile {
                AvatarView(initials: profile.initials, level: profile.level, size: 48)
            }
        }
    }

    // MARK: - Karma-Karte

    @ViewBuilder
    private var karmaCard: some View {
        if let profile = app.profile {
            VStack(alignment: .leading, spacing: 20) {
                HStack(alignment: .center, spacing: 16) {
                    CoinIcon(size: 44)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(profile.coins)")
                            .font(.system(size: 40, weight: .bold, design: .rounded))
                            .monospacedDigit()
                            .foregroundStyle(Theme.textPrimary)

                        Text("KARMA-PUNKTE")
                            .font(.caption2.weight(.semibold))
                            .tracking(1.4)
                            .foregroundStyle(Theme.textTertiary)
                    }

                    Spacer(minLength: 8)

                    LevelBadge(level: profile.level)
                }

                levelProgress(for: profile)
            }
            .card()
        }
    }

    @ViewBuilder
    private func levelProgress(for profile: Profile) -> some View {
        if let next = profile.nextLevel {
            let lower = Self.levelFloor(for: profile.level)
            let span = max(Double(next.threshold) - lower, 1)
            let progress = min(max((Double(profile.totalCoinsEarned) - lower) / span, 0), 1)
            let remaining = max(next.threshold - profile.totalCoinsEarned, 0)

            VStack(alignment: .leading, spacing: 8) {
                ProgressView(value: progress)
                    .progressViewStyle(.linear)
                    .tint(Theme.emerald)

                Text("Noch \(remaining) Punkte bis \(next.name)")
                    .font(.footnote)
                    .monospacedDigit()
                    .foregroundStyle(Theme.textSecondary)
            }
        } else {
            HStack(spacing: 8) {
                Image(systemName: "crown.fill")
                    .font(.footnote)
                    .foregroundStyle(Theme.amber)

                Text("Höchstes Level erreicht")
                    .font(.footnote.weight(.medium))
                    .foregroundStyle(Theme.textSecondary)
            }
        }
    }

    private static func levelFloor(for level: String) -> Double {
        switch level.lowercased() {
        case "silber", "silver":
            return 300
        case "gold":
            return 700
        case "platin", "platinum":
            return 1200
        default:
            return 0
        }
    }

    // MARK: - Missionen

    private var missionsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionHeader(title: "Missionen in deiner Nähe")

            if isLoading {
                HStack {
                    Spacer()
                    ProgressView()
                        .tint(Theme.emerald)
                        .padding(.vertical, 28)
                    Spacer()
                }
            } else if let errorMessage {
                ErrorBanner(message: errorMessage)
            } else if missions.isEmpty {
                missionsEmptyState
            } else {
                VStack(spacing: 12) {
                    ForEach(Array(missions.prefix(4))) { mission in
                        NavigationLink {
                            MissionDetailView(mission: mission)
                        } label: {
                            DashboardMissionCard(mission: mission)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private var missionsEmptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: "sparkles")
                .font(.title2)
                .foregroundStyle(Theme.emerald)

            Text("Keine Missionen gefunden")
                .font(.headline)
                .foregroundStyle(Theme.textPrimary)

            Text("Schau später wieder vorbei – neue Missionen erscheinen regelmäßig.")
                .font(.footnote)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .card(padding: 24)
    }

    // MARK: - Laden

    private func loadMissions() async {
        if missions.isEmpty {
            isLoading = true
        }
        errorMessage = nil
        do {
            missions = try await app.loadMissions()
        } catch {
            errorMessage = "Missionen konnten nicht geladen werden. Bitte versuche es erneut."
        }
        isLoading = false
    }

    private func refresh() async {
        await app.refreshProfile()
        do {
            missions = try await app.loadMissions()
            errorMessage = nil
        } catch {
            errorMessage = "Missionen konnten nicht geladen werden. Bitte versuche es erneut."
        }
        isLoading = false
    }
}

// MARK: - Missions-Karte

private struct DashboardMissionCard: View {
    let mission: Mission

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                CategoryPill(category: mission.category)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.textTertiary)
            }

            Text(mission.title)
                .font(.headline)
                .foregroundStyle(Theme.textPrimary)
                .multilineTextAlignment(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 6) {
                Image(systemName: "mappin.and.ellipse")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)

                Text(mission.location)
                    .font(.subheadline)
                    .foregroundStyle(Theme.textSecondary)
                    .lineLimit(1)

                Spacer(minLength: 8)

                KarmaCoinBadge(coins: mission.coins, compact: true)
            }
        }
        .card()
    }
}
