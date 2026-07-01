import SwiftUI
import Foundation

struct ProfileView: View {
    @EnvironmentObject var app: AppState

    @State private var participations: [Participation] = []
    @State private var loadingActivity = true
    @State private var activityError: String?
    @State private var showSignOutDialog = false
    @State private var signingOut = false

    private static let joinedFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "de_DE")
        formatter.dateFormat = "LLLL yyyy"
        return formatter
    }()

    private static let activityFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "de_DE")
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter
    }()

    private let interestColumns = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10)
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.background.ignoresSafeArea()

                if let profile = app.profile {
                    ScrollView {
                        VStack(spacing: 16) {
                            headerCard(profile)
                            karmaCard(profile)
                            interestsCard(profile)
                            activitySection
                            signOutButton
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 8)
                        .padding(.bottom, 32)
                    }
                    .refreshable {
                        await app.refreshProfile()
                        await loadActivity()
                    }
                } else {
                    VStack(spacing: 12) {
                        ProgressView()
                            .tint(Theme.emerald)
                        Text("Profil wird geladen …")
                            .font(.subheadline)
                            .foregroundStyle(Theme.textTertiary)
                    }
                }
            }
            .navigationTitle("Profil")
            .task {
                await loadActivity()
            }
            .confirmationDialog(
                "Wirklich abmelden?",
                isPresented: $showSignOutDialog,
                titleVisibility: .visible
            ) {
                Button("Abmelden", role: .destructive) {
                    Task {
                        signingOut = true
                        await app.signOut()
                        signingOut = false
                    }
                }
                Button("Abbrechen", role: .cancel) {}
            } message: {
                Text("Du kannst dich jederzeit wieder anmelden. Deine Karma-Punkte bleiben erhalten.")
            }
        }
    }

    // MARK: - Kopfkarte

    private func headerCard(_ profile: Profile) -> some View {
        HStack(alignment: .center, spacing: 16) {
            AvatarView(initials: profile.initials, level: profile.level, size: 72)

            VStack(alignment: .leading, spacing: 6) {
                Text(profile.fullName ?? profile.displayName ?? profile.greetingName)
                    .font(.title3.bold())
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(2)

                LevelBadge(level: profile.level)

                if let district = profile.district, !district.isEmpty {
                    Text(district)
                        .font(.subheadline)
                        .foregroundStyle(Theme.textSecondary)
                }

                if let joined = profile.joinedAt {
                    Text("Dabei seit \(Self.joinedFormatter.string(from: joined))")
                        .font(.caption)
                        .foregroundStyle(Theme.textTertiary)
                }
            }

            Spacer(minLength: 0)
        }
        .card()
    }

    // MARK: - Karma-Karte

    private func karmaCard(_ profile: Profile) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .firstTextBaseline, spacing: 10) {
                CoinIcon(size: 30)
                Text("\(profile.coins)")
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .foregroundStyle(Theme.textPrimary)
                Text("Karma-Punkte")
                    .font(.subheadline)
                    .foregroundStyle(Theme.textSecondary)
                Spacer(minLength: 0)
            }

            if let next = profile.nextLevel {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("Nächstes Level: \(next.name)")
                            .font(.caption.weight(.medium))
                            .foregroundStyle(Theme.textSecondary)
                        Spacer()
                        Text("\(profile.totalCoinsEarned) / \(next.threshold)")
                            .font(.caption.weight(.semibold))
                            .monospacedDigit()
                            .foregroundStyle(Theme.textTertiary)
                    }
                    progressBar(fraction: levelFraction(profile, threshold: next.threshold))
                }
            } else {
                HStack(spacing: 6) {
                    Image(systemName: "crown.fill")
                        .font(.caption)
                        .foregroundStyle(Theme.amber)
                    Text("Höchstes Level erreicht")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.textSecondary)
                }
            }

            Grid(horizontalSpacing: 12, verticalSpacing: 12) {
                GridRow {
                    statTile(value: profile.missionsCompleted, label: "Missionen")
                    statTile(value: profile.totalCoinsEarned, label: "Punkte gesamt")
                }
            }
        }
        .card()
    }

    private func levelFraction(_ profile: Profile, threshold: Int) -> Double {
        guard threshold > 0 else { return 0 }
        let fraction = Double(profile.totalCoinsEarned) / Double(threshold)
        return min(max(fraction, 0), 1)
    }

    private func progressBar(fraction: Double) -> some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Theme.surfaceLight)
                Capsule()
                    .fill(Theme.emerald)
                    .frame(width: max(geo.size.width * fraction, fraction > 0 ? 8 : 0))
            }
        }
        .frame(height: 8)
    }

    private func statTile(value: Int, label: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("\(value)")
                .font(.title2.bold())
                .monospacedDigit()
                .foregroundStyle(Theme.textPrimary)
            Text(label)
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Theme.surfaceLight)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(Theme.stroke, lineWidth: 1)
        )
    }

    // MARK: - Interessen

    private func interestsCard(_ profile: Profile) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Interessen")

            if profile.interests.isEmpty {
                Text("Noch keine Interessen ausgewählt")
                    .font(.subheadline)
                    .foregroundStyle(Theme.textTertiary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.vertical, 8)
            } else {
                LazyVGrid(columns: interestColumns, spacing: 10) {
                    ForEach(profile.interests, id: \.self) { interest in
                        interestChip(interest)
                    }
                }
            }
        }
        .card()
    }

    private func interestChip(_ category: String) -> some View {
        let color = Theme.categoryColor(category)
        return HStack(spacing: 6) {
            Circle()
                .fill(color)
                .frame(width: 6, height: 6)
            Text(Theme.categoryLabel(category))
                .font(.caption.weight(.semibold))
                .foregroundStyle(color)
                .lineLimit(1)
                .minimumScaleFactor(0.85)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 9)
        .padding(.horizontal, 10)
        .background(
            Capsule().fill(color.opacity(0.12))
        )
        .overlay(
            Capsule().stroke(color.opacity(0.3), lineWidth: 1)
        )
    }

    // MARK: - Aktivität

    private var completedParticipations: [Participation] {
        participations
            .filter { $0.completedAt != nil }
            .sorted { ($0.completedAt ?? .distantPast) > ($1.completedAt ?? .distantPast) }
    }

    private var activitySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Aktivität")

            if let activityError {
                ErrorBanner(message: activityError)
            } else if loadingActivity {
                HStack {
                    Spacer()
                    ProgressView()
                        .tint(Theme.emerald)
                    Spacer()
                }
                .padding(.vertical, 28)
                .card()
            } else if completedParticipations.isEmpty {
                VStack(spacing: 10) {
                    Image(systemName: "trophy")
                        .font(.title2)
                        .foregroundStyle(Theme.textTertiary)
                    Text("Noch keine Missionen abgeschlossen")
                        .font(.subheadline)
                        .foregroundStyle(Theme.textSecondary)
                    Text("Starte deine erste Mission und sammle Karma-Punkte.")
                        .font(.caption)
                        .foregroundStyle(Theme.textTertiary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .card()
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(completedParticipations.enumerated()), id: \.element.id) { index, participation in
                        activityRow(participation)
                        if index < completedParticipations.count - 1 {
                            Divider()
                                .overlay(Theme.stroke)
                        }
                    }
                }
                .card()
            }
        }
    }

    private func activityRow(_ participation: Participation) -> some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Theme.amber.opacity(0.15))
                    .frame(width: 36, height: 36)
                Image(systemName: "trophy.fill")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Theme.amber)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text("Mission abgeschlossen")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
                if let date = participation.completedAt {
                    Text(Self.activityFormatter.string(from: date))
                        .font(.caption)
                        .foregroundStyle(Theme.textTertiary)
                }
            }

            Spacer(minLength: 8)

            if let coins = participation.coinsEarned, coins > 0 {
                KarmaCoinBadge(coins: coins, compact: true)
            }
        }
        .padding(.vertical, 10)
    }

    // MARK: - Abmelden

    private var signOutButton: some View {
        Button {
            showSignOutDialog = true
        } label: {
            HStack(spacing: 8) {
                if signingOut {
                    ProgressView()
                        .tint(Color.red.opacity(0.9))
                } else {
                    Image(systemName: "rectangle.portrait.and.arrow.right")
                        .font(.system(size: 15, weight: .semibold))
                }
                Text("Abmelden")
                    .font(.subheadline.weight(.semibold))
            }
            .foregroundStyle(Color.red.opacity(0.9))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(Color.red.opacity(0.1))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(Color.red.opacity(0.25), lineWidth: 1)
            )
            .contentShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
        .buttonStyle(.plain)
        .disabled(signingOut)
        .padding(.top, 8)
    }

    // MARK: - Laden

    private func loadActivity() async {
        loadingActivity = participations.isEmpty
        activityError = nil
        do {
            participations = try await app.loadMyParticipations()
        } catch {
            activityError = "Aktivität konnte nicht geladen werden. Bitte versuche es erneut."
        }
        loadingActivity = false
    }
}
