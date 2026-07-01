import SwiftUI

struct LeaderboardView: View {
    @EnvironmentObject var app: AppState

    @State private var entries: [LeaderboardEntry] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    if let errorMessage, !entries.isEmpty {
                        ErrorBanner(message: errorMessage)
                    }

                    if isLoading && entries.isEmpty {
                        loadingState
                    } else if entries.isEmpty {
                        if let errorMessage {
                            failureState(errorMessage)
                        } else {
                            emptyState
                        }
                    } else {
                        podium

                        if entries.count > 3 {
                            VStack(alignment: .leading, spacing: 12) {
                                SectionHeader(title: "Weitere Plätze")

                                LazyVStack(spacing: 10) {
                                    ForEach(Array(entries.dropFirst(3).enumerated()), id: \.element.id) { index, entry in
                                        leaderboardRow(entry: entry, rank: index + 4)
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 24)
            }
            .background(Theme.background.ignoresSafeArea())
            .refreshable { await load() }
            .navigationTitle("Rangliste")
        }
        .task { await load() }
    }

    // MARK: - Podium

    private var podium: some View {
        HStack(alignment: .bottom, spacing: 12) {
            if entries.count > 1 {
                podiumColumn(entry: entries[1], rank: 2)
            }
            podiumColumn(entry: entries[0], rank: 1)
            if entries.count > 2 {
                podiumColumn(entry: entries[2], rank: 3)
            }
        }
        .padding(.top, 8)
    }

    private func podiumColumn(entry: LeaderboardEntry, rank: Int) -> some View {
        let accent = podiumAccent(for: rank)
        let pillarHeight: CGFloat = rank == 1 ? 96 : (rank == 2 ? 66 : 50)
        let avatarSize: CGFloat = rank == 1 ? 64 : 52
        let isMe = entry.id == app.profile?.id

        return VStack(spacing: 8) {
            if rank == 1 {
                Image(systemName: "crown.fill")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(accent)
            }

            AvatarView(initials: initials(from: entry.name), level: entry.level, size: avatarSize)
                .overlay(
                    Circle()
                        .stroke(isMe ? Theme.emerald : accent.opacity(0.7), lineWidth: 2)
                )

            Text(entry.name)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(Theme.textPrimary)
                .lineLimit(1)

            HStack(spacing: 4) {
                CoinIcon(size: 12)
                Text("\(entry.coins)")
                    .font(.caption.weight(.semibold).monospacedDigit())
                    .foregroundStyle(Theme.amber)
            }

            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [accent.opacity(0.32), accent.opacity(0.06)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(accent.opacity(0.4), lineWidth: 1)
                )
                .overlay(
                    Text("\(rank)")
                        .font(.title3.weight(.bold).monospacedDigit())
                        .foregroundStyle(accent)
                )
                .frame(height: pillarHeight)
        }
        .frame(maxWidth: .infinity)
    }

    private func podiumAccent(for rank: Int) -> Color {
        switch rank {
        case 1: return Theme.levelColor("Gold")
        case 2: return Theme.levelColor("Silber")
        default: return Theme.levelColor("Bronze")
        }
    }

    // MARK: - Liste ab Platz 4

    private func leaderboardRow(entry: LeaderboardEntry, rank: Int) -> some View {
        let isMe = entry.id == app.profile?.id

        return HStack(spacing: 12) {
            Text("\(rank)")
                .font(.subheadline.monospaced())
                .foregroundStyle(Theme.textTertiary)
                .frame(width: 28, alignment: .trailing)

            AvatarView(initials: initials(from: entry.name), level: entry.level, size: 36)

            VStack(alignment: .leading, spacing: 2) {
                Text(entry.name)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(1)

                if let district = entry.district, !district.isEmpty {
                    Text(district)
                        .font(.caption)
                        .foregroundStyle(Theme.textTertiary)
                        .lineLimit(1)
                }
            }

            Spacer(minLength: 8)

            VStack(alignment: .trailing, spacing: 4) {
                KarmaCoinBadge(coins: entry.coins, compact: true)

                Text("\(entry.missionsCompleted) Missionen")
                    .font(.caption)
                    .foregroundStyle(Theme.textTertiary)
            }
        }
        .card(padding: 12)
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(isMe ? Theme.emerald : Color.clear, lineWidth: 1.5)
        )
    }

    // MARK: - Zustände

    private var loadingState: some View {
        VStack(spacing: 16) {
            ProgressView()
                .tint(Theme.emerald)
            Text("Rangliste wird geladen …")
                .font(.subheadline)
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 96)
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "trophy")
                .font(.system(size: 40, weight: .light))
                .foregroundStyle(Theme.textTertiary)

            Text("Noch keine Platzierungen")
                .font(.headline)
                .foregroundStyle(Theme.textPrimary)

            Text("Schließe deine erste Mission ab, um in der Rangliste aufzutauchen.")
                .font(.subheadline)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 24)
        .padding(.top, 80)
    }

    private func failureState(_ message: String) -> some View {
        VStack(spacing: 16) {
            ErrorBanner(message: message)

            PrimaryButton(title: "Erneut versuchen", systemImage: "arrow.clockwise") {
                Task { await load() }
            }
        }
        .padding(.top, 48)
    }

    // MARK: - Laden & Helfer

    @MainActor
    private func load() async {
        if entries.isEmpty {
            isLoading = true
        }
        errorMessage = nil
        do {
            entries = try await app.loadLeaderboard()
        } catch {
            errorMessage = "Die Rangliste konnte nicht geladen werden. Bitte versuche es später erneut."
        }
        isLoading = false
    }

    private func initials(from name: String) -> String {
        let words = name.split(separator: " ").filter { !$0.isEmpty }.prefix(2)
        let letters = words.compactMap { $0.first }.map(String.init)
        let result = letters.joined().uppercased()
        return result.isEmpty ? "?" : result
    }
}
