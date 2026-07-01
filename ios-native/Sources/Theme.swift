import SwiftUI

/// Karma City design tokens — mirrors the web brand (zinc-950 base, emerald
/// accent, amber coin) translated into native SwiftUI.
enum Theme {
    // Base surfaces
    static let background = Color(hex: 0x09090B)      // zinc-950
    static let surface = Color(hex: 0x18181B)         // zinc-900
    static let surfaceLight = Color(hex: 0x27272A)    // zinc-800
    static let stroke = Color.white.opacity(0.08)

    // Brand
    static let emerald = Color(hex: 0x10B981)
    static let emeraldDark = Color(hex: 0x059669)
    static let amber = Color(hex: 0xF59E0B)
    static let amberLight = Color(hex: 0xFBBF24)

    // Text
    static let textPrimary = Color(hex: 0xFAFAFA)     // zinc-50
    static let textSecondary = Color(hex: 0xA1A1AA)   // zinc-400
    static let textTertiary = Color(hex: 0x71717A)    // zinc-500

    // Category colors (match web categoryColors)
    static func categoryColor(_ category: String) -> Color {
        switch category {
        case "environment": return Color(hex: 0x34D399)
        case "social": return Color(hex: 0xFB7185)
        case "culture": return Color(hex: 0xA78BFA)
        case "elderly": return Color(hex: 0x38BDF8)
        case "food": return Color(hex: 0xFB923C)
        case "digital": return Color(hex: 0x22D3EE)
        default: return emerald
        }
    }

    static func categoryLabel(_ category: String) -> String {
        switch category {
        case "environment": return "Umwelt"
        case "social": return "Soziales"
        case "culture": return "Kultur"
        case "elderly": return "Seniorenhilfe"
        case "food": return "Ernährung"
        case "digital": return "Digital"
        default: return category
        }
    }

    static func levelColor(_ level: String) -> Color {
        switch level {
        case "Platin": return Color(hex: 0x818CF8)
        case "Gold": return Color(hex: 0xFACC15)
        case "Silber": return Color(hex: 0xA1A1AA)
        default: return Color(hex: 0xD97706) // Bronze
        }
    }
}

extension Color {
    init(hex: UInt, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }
}

/// Card container matching the web's rounded-2xl surface style.
struct CardStyle: ViewModifier {
    var padding: CGFloat = 16
    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(Theme.surface)
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(Theme.stroke, lineWidth: 1)
            )
    }
}

extension View {
    func card(padding: CGFloat = 16) -> some View {
        modifier(CardStyle(padding: padding))
    }
}
