import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            DashboardView()
                .darkTabBar()
                .tabItem { Label("Home", systemImage: "house.fill") }

            MissionsView()
                .darkTabBar()
                .tabItem { Label("Missionen", systemImage: "scope") }

            LeaderboardView()
                .darkTabBar()
                .tabItem { Label("Rangliste", systemImage: "trophy.fill") }

            RewardsView()
                .darkTabBar()
                .tabItem { Label("Rewards", systemImage: "gift.fill") }

            ProfileView()
                .darkTabBar()
                .tabItem { Label("Profil", systemImage: "person.fill") }
        }
        .tint(Theme.emerald)
        .preferredColorScheme(.dark)
    }
}

private extension View {
    // Shared dark tab bar styling, applied per tab so it stays visible on every selection
    func darkTabBar() -> some View {
        self
            .toolbarBackground(Theme.surface, for: .tabBar)
            .toolbarBackground(.visible, for: .tabBar)
            .toolbarColorScheme(.dark, for: .tabBar)
    }
}
