import SwiftUI

@main
struct KarmaCityApp: App {
    @StateObject private var app = AppState.shared

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(app)
                .preferredColorScheme(.dark)
                .tint(Theme.emerald)
                .task { await app.bootstrap() }
        }
    }
}

struct RootView: View {
    @EnvironmentObject var app: AppState

    var body: some View {
        ZStack {
            Theme.background.ignoresSafeArea()

            if !app.bootstrapped {
                VStack(spacing: 16) {
                    CoinIcon(size: 64)
                    ProgressView().tint(Theme.emerald)
                }
            } else if app.session == nil {
                LoginView()
            } else if let profile = app.profile {
                if profile.onboardingCompleted {
                    MainTabView()
                } else {
                    OnboardingView()
                }
            } else {
                // Session exists but the profile hasn't arrived: show progress,
                // surface errors with a retry instead of hanging forever.
                VStack(spacing: 20) {
                    CoinIcon(size: 64)
                    if let error = app.profileError {
                        ErrorBanner(message: error)
                            .padding(.horizontal, 24)
                        PrimaryButton(title: "Erneut versuchen") {
                            Task { await app.refreshProfile() }
                        }
                        .padding(.horizontal, 48)
                        Button("Abmelden") {
                            Task { await app.signOut() }
                        }
                        .font(.footnote)
                        .foregroundStyle(Theme.textTertiary)
                    } else {
                        ProgressView().tint(Theme.emerald)
                        Text("Profil wird geladen …")
                            .font(.footnote)
                            .foregroundStyle(Theme.textTertiary)
                    }
                }
            }
        }
        .animation(.easeInOut(duration: 0.25), value: app.session != nil)
        .animation(.easeInOut(duration: 0.25), value: app.profile?.onboardingCompleted)
    }
}
