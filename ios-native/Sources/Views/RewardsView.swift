import SwiftUI

struct RewardsView: View {
    @EnvironmentObject var app: AppState

    private enum RewardsTab: Hashable {
        case shop
        case vouchers
    }

    @State private var tab: RewardsTab = .shop
    @Namespace private var toggleNamespace

    @State private var rewards: [Reward] = []
    @State private var rewardsLoaded = false
    @State private var isLoadingRewards = false
    @State private var rewardsError: String?

    @State private var redemptions: [Redemption] = []
    @State private var redemptionsLoaded = false
    @State private var isLoadingRedemptions = false
    @State private var redemptionsError: String?

    @State private var redeemingRewardId: String?
    @State private var redeemError: String?
    @State private var successReward: Reward?
    @State private var successCode: String?

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "de_DE")
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter
    }()

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.background.ignoresSafeArea()

                VStack(spacing: 0) {
                    tabToggle
                        .padding(.horizontal, 16)
                        .padding(.top, 8)
                        .padding(.bottom, 4)

                    switch tab {
                    case .shop:
                        shopTab
                    case .vouchers:
                        voucherTab
                    }
                }

                if successCode != nil {
                    successOverlay
                        .zIndex(1)
                }
            }
            .navigationTitle("Rewards")
        }
    }

    // MARK: - Tab Toggle

    private var tabToggle: some View {
        HStack(spacing: 4) {
            toggleButton(title: "Shop", value: .shop)
            toggleButton(title: "Meine Gutscheine", value: .vouchers)
        }
        .padding(4)
        .background(Theme.surface, in: Capsule())
        .overlay(Capsule().stroke(Theme.stroke, lineWidth: 1))
    }

    private func toggleButton(title: String, value: RewardsTab) -> some View {
        Button {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                tab = value
            }
        } label: {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .lineLimit(1)
                .minimumScaleFactor(0.85)
                .foregroundColor(tab == value ? Theme.background : Theme.textSecondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background {
                    if tab == value {
                        Capsule()
                            .fill(Theme.emerald)
                            .matchedGeometryEffect(id: "rewardsTabSelection", in: toggleNamespace)
                    }
                }
                .contentShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    // MARK: - Shop Tab

    private var shopTab: some View {
        ScrollView {
            VStack(spacing: 16) {
                balanceHeader

                if let redeemError {
                    ErrorBanner(message: redeemError)
                }

                if isLoadingRewards && rewards.isEmpty {
                    loadingIndicator
                } else if let rewardsError {
                    ErrorBanner(message: rewardsError)
                } else if rewards.isEmpty {
                    shopEmptyState
                } else {
                    ForEach(rewards) { reward in
                        rewardCard(reward)
                    }
                }
            }
            .padding(16)
        }
        .task {
            await loadRewardsIfNeeded()
        }
    }

    private var balanceHeader: some View {
        HStack {
            Text("Dein Guthaben")
                .font(.subheadline.weight(.medium))
                .foregroundColor(Theme.textSecondary)
            Spacer()
            KarmaCoinBadge(coins: app.profile?.coins ?? 0)
        }
        .card()
    }

    private func rewardCard(_ reward: Reward) -> some View {
        let balance = app.profile?.coins ?? 0
        let affordable = balance >= reward.coinCost
        let isRedeeming = redeemingRewardId == reward.id

        return VStack(alignment: .leading, spacing: 8) {
            Text(reward.title)
                .font(.headline)
                .foregroundColor(Theme.textPrimary)

            Text(reward.partner)
                .font(.caption.weight(.medium))
                .foregroundColor(Theme.emerald)

            Text(reward.description)
                .font(.subheadline)
                .foregroundColor(Theme.textSecondary)
                .lineLimit(2)

            HStack(spacing: 10) {
                Text(Theme.categoryLabel(reward.category))
                    .font(.caption)
                    .foregroundColor(Theme.textTertiary)

                Spacer(minLength: 8)

                KarmaCoinBadge(coins: reward.coinCost, compact: true)

                Button {
                    Task { await redeem(reward) }
                } label: {
                    Group {
                        if isRedeeming {
                            ProgressView()
                                .tint(Theme.background)
                                .scaleEffect(0.8)
                        } else {
                            Text(affordable ? "Einlösen" : "Zu wenig Punkte")
                                .font(.caption.weight(.semibold))
                        }
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(affordable ? Theme.emerald : Theme.surfaceLight, in: Capsule())
                    .foregroundColor(affordable ? Theme.background : Theme.textTertiary)
                }
                .buttonStyle(.plain)
                .disabled(!affordable || redeemingRewardId != nil)
            }
            .padding(.top, 4)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .card()
    }

    private var shopEmptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: "gift")
                .font(.system(size: 34, weight: .light))
                .foregroundColor(Theme.textTertiary)
            Text("Aktuell keine Prämien verfügbar.")
                .font(.headline)
                .foregroundColor(Theme.textPrimary)
            Text("Schau bald wieder vorbei – neue Partner-Angebote sind unterwegs.")
                .font(.subheadline)
                .foregroundColor(Theme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
        .padding(.horizontal, 24)
    }

    // MARK: - Voucher Tab

    private var voucherTab: some View {
        ScrollView {
            VStack(spacing: 14) {
                if isLoadingRedemptions && redemptions.isEmpty {
                    loadingIndicator
                } else if let redemptionsError {
                    ErrorBanner(message: redemptionsError)
                } else if redemptions.isEmpty {
                    voucherEmptyState
                } else {
                    ForEach(redemptions) { redemption in
                        voucherCard(redemption)
                    }
                }
            }
            .padding(16)
        }
        .task {
            await loadRewardsIfNeeded()
            await loadRedemptionsIfNeeded()
        }
    }

    private func voucherCard(_ redemption: Redemption) -> some View {
        let title = rewards.first(where: { $0.id == redemption.rewardId })?.title ?? redemption.rewardId

        return HStack(alignment: .top, spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(Theme.emerald.opacity(0.15))
                Image(systemName: "qrcode")
                    .font(.system(size: 22, weight: .medium))
                    .foregroundColor(Theme.emerald)
            }
            .frame(width: 48, height: 48)

            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.headline)
                    .foregroundColor(Theme.textPrimary)
                    .lineLimit(2)

                Text(redemption.code)
                    .font(.system(.caption, design: .monospaced, weight: .semibold))
                    .foregroundColor(Theme.amberLight)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Theme.amber.opacity(0.12), in: Capsule())

                if let createdAt = redemption.createdAt {
                    Text(Self.dateFormatter.string(from: createdAt))
                        .font(.caption)
                        .foregroundColor(Theme.textTertiary)
                }
            }

            Spacer(minLength: 0)
        }
        .card()
    }

    private var voucherEmptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: "ticket")
                .font(.system(size: 34, weight: .light))
                .foregroundColor(Theme.textTertiary)
            Text("Noch keine Gutscheine eingelöst.")
                .font(.headline)
                .foregroundColor(Theme.textPrimary)
            Text("Löse im Shop deine Karma-Punkte gegen Prämien lokaler Partner ein.")
                .font(.subheadline)
                .foregroundColor(Theme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
        .padding(.horizontal, 24)
    }

    // MARK: - Shared

    private var loadingIndicator: some View {
        VStack(spacing: 12) {
            ProgressView()
                .tint(Theme.emerald)
            Text("Wird geladen …")
                .font(.caption)
                .foregroundColor(Theme.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 56)
    }

    private var successOverlay: some View {
        ZStack {
            Theme.background.opacity(0.78)
                .ignoresSafeArea()
                .onTapGesture { dismissSuccess() }

            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(Theme.emerald.opacity(0.15))
                        .frame(width: 64, height: 64)
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 30))
                        .foregroundColor(Theme.emerald)
                }

                Text("Gutschein eingelöst!")
                    .font(.title3.weight(.bold))
                    .foregroundColor(Theme.textPrimary)

                if let reward = successReward {
                    Text(reward.title)
                        .font(.subheadline)
                        .foregroundColor(Theme.textSecondary)
                        .multilineTextAlignment(.center)
                }

                Text(successCode ?? "")
                    .font(.system(.title2, design: .monospaced, weight: .bold))
                    .foregroundColor(Theme.amber)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(Theme.surfaceLight, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(Theme.stroke, lineWidth: 1)
                    )

                Text("Zeig den Code beim Partner vor.")
                    .font(.footnote)
                    .foregroundColor(Theme.textSecondary)

                PrimaryButton(title: "Fertig") {
                    dismissSuccess()
                }
            }
            .frame(maxWidth: .infinity)
            .card(padding: 24)
            .padding(.horizontal, 28)
        }
        .transition(.opacity)
    }

    // MARK: - Actions

    private func loadRewardsIfNeeded() async {
        guard !rewardsLoaded, !isLoadingRewards else { return }
        isLoadingRewards = true
        rewardsError = nil
        do {
            rewards = try await app.loadRewards()
            rewardsLoaded = true
        } catch {
            rewardsError = error.localizedDescription
        }
        isLoadingRewards = false
    }

    private func loadRedemptionsIfNeeded() async {
        guard !redemptionsLoaded, !isLoadingRedemptions else { return }
        isLoadingRedemptions = true
        redemptionsError = nil
        do {
            redemptions = try await app.loadMyRedemptions()
            redemptionsLoaded = true
        } catch {
            redemptionsError = error.localizedDescription
        }
        isLoadingRedemptions = false
    }

    private func redeem(_ reward: Reward) async {
        guard redeemingRewardId == nil else { return }
        redeemError = nil
        redeemingRewardId = reward.id
        do {
            let code = try await app.redeemReward(reward)
            await app.refreshProfile()
            if let updated = try? await app.loadMyRedemptions() {
                redemptions = updated
                redemptionsLoaded = true
            }
            withAnimation(.easeOut(duration: 0.2)) {
                successReward = reward
                successCode = code
            }
        } catch {
            redeemError = error.localizedDescription
        }
        redeemingRewardId = nil
    }

    private func dismissSuccess() {
        withAnimation(.easeOut(duration: 0.2)) {
            successCode = nil
            successReward = nil
        }
    }
}
