import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var app: AppState

    @State private var step = 0
    @State private var selected: Set<String> = []
    @State private var isSaving = false
    @State private var errorMessage: String?

    private let interests: [(key: String, label: String, icon: String)] = [
        ("environment", "Umwelt", "leaf.fill"),
        ("social", "Soziales", "heart.fill"),
        ("culture", "Kultur", "paintpalette.fill"),
        ("digital", "Digital", "desktopcomputer"),
        ("food", "Ernährung", "fork.knife"),
        ("elderly", "Seniorenhilfe", "figure.2")
    ]

    var body: some View {
        ZStack {
            Theme.background.ignoresSafeArea()

            VStack(spacing: 0) {
                progressDots
                    .padding(.top, 20)
                    .padding(.bottom, 8)

                if step == 0 {
                    welcomeStep
                        .transition(
                            .asymmetric(
                                insertion: .move(edge: .leading).combined(with: .opacity),
                                removal: .move(edge: .leading).combined(with: .opacity)
                            )
                        )
                } else {
                    interestsStep
                        .transition(
                            .asymmetric(
                                insertion: .move(edge: .trailing).combined(with: .opacity),
                                removal: .move(edge: .trailing).combined(with: .opacity)
                            )
                        )
                }
            }
        }
        .animation(.spring(response: 0.45, dampingFraction: 0.85), value: step)
    }

    // MARK: - Progress Dots

    private var progressDots: some View {
        HStack(spacing: 8) {
            ForEach(0..<2, id: \.self) { index in
                Capsule()
                    .fill(index == step ? Theme.emerald : Theme.surfaceLight)
                    .frame(width: index == step ? 24 : 8, height: 8)
                    .animation(.spring(response: 0.35, dampingFraction: 0.8), value: step)
            }
        }
        .accessibilityLabel("Schritt \(step + 1) von 2")
    }

    // MARK: - Step 0: Welcome

    private var welcomeStep: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: 28) {
                    VStack(alignment: .leading, spacing: 20) {
                        CoinIcon(size: 88)
                            .padding(.top, 24)

                        VStack(alignment: .leading, spacing: 8) {
                            Text("Willkommen bei\nKarma City")
                                .font(.system(size: 34, weight: .bold, design: .rounded))
                                .foregroundStyle(Theme.textPrimary)
                                .lineSpacing(2)

                            Text("Tu Gutes in deiner Stadt und werde dafür belohnt.")
                                .font(.body)
                                .foregroundStyle(Theme.textSecondary)
                        }
                    }

                    VStack(spacing: 12) {
                        OnboardingBulletCard(
                            icon: "sparkles",
                            title: "Missionen entdecken",
                            subtitle: "Finde Aufgaben in deiner Nähe, die wirklich etwas bewegen."
                        )
                        OnboardingBulletCard(
                            icon: "leaf.fill",
                            title: "Karma-Punkte sammeln",
                            subtitle: "Verdiene Coins für jede abgeschlossene Mission."
                        )
                        OnboardingBulletCard(
                            icon: "gift.fill",
                            title: "Rewards einlösen",
                            subtitle: "Tausche deine Coins bei lokalen Partnern gegen echte Prämien."
                        )
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }

            PrimaryButton(title: "Los geht's", systemImage: "arrow.right") {
                step = 1
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 16)
        }
    }

    // MARK: - Step 1: Interests

    private var interestsStep: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Was ist dein Ding?")
                            .font(.system(size: 30, weight: .bold, design: .rounded))
                            .foregroundStyle(Theme.textPrimary)
                            .padding(.top, 24)

                        Text("Wähle mindestens ein Thema – wir zeigen dir passende Missionen.")
                            .font(.body)
                            .foregroundStyle(Theme.textSecondary)
                    }

                    LazyVGrid(
                        columns: [
                            GridItem(.flexible(), spacing: 12),
                            GridItem(.flexible(), spacing: 12)
                        ],
                        spacing: 12
                    ) {
                        ForEach(interests, id: \.key) { interest in
                            InterestTile(
                                label: interest.label,
                                icon: interest.icon,
                                isSelected: selected.contains(interest.key)
                            ) {
                                toggle(interest.key)
                            }
                        }
                    }

                    if let errorMessage {
                        ErrorBanner(message: errorMessage)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }

            PrimaryButton(
                title: "Loslegen",
                systemImage: "checkmark",
                loading: isSaving,
                disabled: selected.isEmpty || isSaving
            ) {
                save()
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 16)
        }
    }

    // MARK: - Actions

    private func toggle(_ key: String) {
        withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) {
            if selected.contains(key) {
                selected.remove(key)
            } else {
                selected.insert(key)
            }
        }
    }

    private func save() {
        guard !isSaving, !selected.isEmpty else { return }
        errorMessage = nil
        isSaving = true
        Task {
            do {
                try await app.saveOnboarding(interests: Array(selected), district: nil)
            } catch {
                errorMessage = "Speichern fehlgeschlagen. Bitte prüfe deine Verbindung und versuche es erneut."
                isSaving = false
            }
        }
    }
}

// MARK: - Bullet Card

private struct OnboardingBulletCard: View {
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(Theme.emerald.opacity(0.14))
                Image(systemName: icon)
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(Theme.emerald)
            }
            .frame(width: 44, height: 44)

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)

                Text(subtitle)
                    .font(.footnote)
                    .foregroundStyle(Theme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 0)
        }
        .card()
    }
}

// MARK: - Interest Tile

private struct InterestTile: View {
    let label: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 10) {
                Image(systemName: icon)
                    .font(.system(size: 26, weight: .semibold))
                    .foregroundStyle(isSelected ? Theme.background : Theme.emerald)
                    .frame(height: 30)

                Text(label)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(isSelected ? Theme.background : Theme.textPrimary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.85)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 104)
            .background(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(isSelected ? Theme.emerald : Theme.surface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .strokeBorder(isSelected ? Theme.emerald : Theme.stroke, lineWidth: 1)
            )
            .overlay(alignment: .topTrailing) {
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(Theme.background)
                        .padding(10)
                        .transition(.scale.combined(with: .opacity))
                }
            }
            .scaleEffect(isSelected ? 1.0 : 0.99)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(label)
        .accessibilityAddTraits(isSelected ? [.isSelected] : [])
    }
}
