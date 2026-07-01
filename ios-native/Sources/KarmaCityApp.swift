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
            } else if let profile = app.profile, !profile.onboardingCompleted {
                OnboardingView()
            } else {
                MainTabView()
            }
        }
        .animation(.easeInOut(duration: 0.25), value: app.session != nil)
        .animation(.easeInOut(duration: 0.25), value: app.profile?.onboardingCompleted)
    }
}
