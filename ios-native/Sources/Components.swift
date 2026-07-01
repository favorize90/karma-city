import SwiftUI

/// Amber karma-coin chip, e.g. "◉ 50".
struct KarmaCoinBadge: View {
    let coins: Int
    var compact = false

    var body: some View {
        HStack(spacing: 4) {
            CoinIcon(size: compact ? 12 : 16)
            Text("\(coins)")
                .font(.system(compact ? .caption : .subheadline, design: .rounded).weight(.bold))
                .monospacedDigit()
        }
        .foregroundStyle(Theme.amberLight)
        .padding(.horizontal, compact ? 8 : 10)
        .padding(.vertical, compact ? 3 : 5)
        .background(Theme.amber.opacity(0.15))
        .clipShape(Capsule())
        .overlay(Capsule().stroke(Theme.amber.opacity(0.3), lineWidth: 1))
    }
}

/// The brand mark: amber coin with green leaf.
struct CoinIcon: View {
    var size: CGFloat = 20

    var body: some View {
        ZStack {
            Circle()
                .fill(
                    RadialGradient(
                        colors: [Theme.amberLight, Theme.amber],
                        center: .init(x: 0.4, y: 0.35),
                        startRadius: 0,
                        endRadius: size
                    )
                )
            Image(systemName: "leaf.fill")
                .font(.system(size: size * 0.45, weight: .bold))
                .foregroundStyle(Color(hex: 0x15803D))
        }
        .frame(width: size, height: size)
    }
}

/// Colored category pill ("Umwelt", "Soziales", …).
struct CategoryPill: View {
    let category: String

    var body: some View {
        Text(Theme.categoryLabel(category))
            .font(.caption2.weight(.semibold))
            .foregroundStyle(Theme.categoryColor(category))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(Theme.categoryColor(category).opacity(0.15))
            .clipShape(Capsule())
    }
}

/// Level badge (Bronze/Silber/Gold/Platin).
struct LevelBadge: View {
    let level: String

    var body: some View {
        Text(level)
            .font(.caption2.weight(.bold))
            .foregroundStyle(Theme.levelColor(level))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(Theme.levelColor(level).opacity(0.15))
            .clipShape(Capsule())
    }
}

/// Initials avatar with level-colored ring.
struct AvatarView: View {
    let initials: String
    let level: String
    var size: CGFloat = 44

    var body: some View {
        Text(initials)
            .font(.system(size: size * 0.36, weight: .bold, design: .rounded))
            .foregroundStyle(Theme.textPrimary)
            .frame(width: size, height: size)
            .background(Theme.surfaceLight)
            .clipShape(Circle())
            .overlay(Circle().stroke(Theme.levelColor(level).opacity(0.7), lineWidth: 2))
    }
}

/// Primary emerald action button with loading state.
struct PrimaryButton: View {
    let title: String
    var systemImage: String? = nil
    var loading = false
    var disabled = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if loading {
                    ProgressView().tint(.white)
                } else if let systemImage {
                    Image(systemName: systemImage)
                }
                Text(title).font(.headline)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 15)
            .background(disabled ? Theme.surfaceLight : Theme.emerald)
            .foregroundStyle(disabled ? Theme.textTertiary : .white)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
        .disabled(disabled || loading)
        .buttonStyle(.plain)
    }
}

/// Inline error banner.
struct ErrorBanner: View {
    let message: String

    var body: some View {
        Text(message)
            .font(.footnote)
            .foregroundStyle(Color(hex: 0xFDA4AF))
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(12)
            .background(Color(hex: 0xF43F5E).opacity(0.12))
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

/// Section header in the web app's uppercase style.
struct SectionHeader: View {
    let title: String

    var body: some View {
        Text(title.uppercased())
            .font(.caption2.weight(.bold))
            .kerning(1.2)
            .foregroundStyle(Theme.textTertiary)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}
