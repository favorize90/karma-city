import SwiftUI

// MARK: - MissionsView

struct MissionsView: View {
    @EnvironmentObject var app: AppState

    @State private var missions: [Mission] = []
    @State private var participations: [Participation] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var searchText = ""
    @State private var selectedCategory: String?

    private let categories = ["environment", "social", "culture", "education", "sport", "community"]

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.background.ignoresSafeArea()
                content
            }
            .navigationTitle("Missionen")
            .searchable(text: $searchText, prompt: "Titel oder Beschreibung suchen")
        }
        .task { await loadData() }
    }

    // MARK: Content states

    @ViewBuilder
    private var content: some View {
        if isLoading {
            VStack(spacing: 12) {
                ProgressView()
                    .tint(Theme.emerald)
                Text("Missionen werden geladen …")
                    .font(.subheadline)
                    .foregroundStyle(Theme.textSecondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else if let errorMessage {
            VStack(spacing: 16) {
                ErrorBanner(message: errorMessage)
                Button {
                    isLoading = true
                    Task { await loadData() }
                } label: {
                    Label("Erneut versuchen", systemImage: "arrow.clockwise")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.emerald)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        } else {
            VStack(spacing: 0) {
                categoryFilter
                    .padding(.vertical, 10)

                if filteredMissions.isEmpty {
                    emptyState
                } else {
                    ScrollView {
                        LazyVStack(spacing: 14) {
                            ForEach(filteredMissions) { mission in
                                NavigationLink {
                                    MissionDetailView(mission: mission)
                                } label: {
                                    missionCard(mission)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 4)
                        .padding(.bottom, 24)
                    }
                    .refreshable { await loadData() }
                }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "binoculars")
                .font(.system(size: 40, weight: .light))
                .foregroundStyle(Theme.textTertiary)
            Text("Keine Missionen gefunden")
                .font(.headline)
                .foregroundStyle(Theme.textPrimary)
            Text("Passe deine Suche oder den Kategorie-Filter an.")
                .font(.subheadline)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: Filter

    private var categoryFilter: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                filterChip(label: "Alle", isSelected: selectedCategory == nil) {
                    selectedCategory = nil
                }
                ForEach(categories, id: \.self) { category in
                    filterChip(label: Theme.categoryLabel(category), isSelected: selectedCategory == category) {
                        selectedCategory = selectedCategory == category ? nil : category
                    }
                }
            }
            .padding(.horizontal, 16)
        }
    }

    private func filterChip(label: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.subheadline.weight(.medium))
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .foregroundStyle(isSelected ? Theme.background : Theme.textSecondary)
                .background(isSelected ? Theme.emerald : Theme.surface, in: Capsule())
                .overlay(
                    Capsule()
                        .strokeBorder(isSelected ? Theme.emerald : Theme.stroke, lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }

    // MARK: Mission card

    private func missionCard(_ mission: Mission) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                CategoryPill(category: mission.category)
                Spacer()
                statusIndicator(for: mission)
            }
            Text(mission.title)
                .font(.headline)
                .foregroundStyle(Theme.textPrimary)
                .multilineTextAlignment(.leading)
            Text(mission.description)
                .font(.subheadline)
                .foregroundStyle(Theme.textSecondary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)
            HStack(spacing: 14) {
                metaLabel(mission.distance, icon: "figure.walk")
                metaLabel(mission.deadline, icon: "clock")
                Spacer()
                KarmaCoinBadge(coins: mission.coins, compact: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .card()
    }

    @ViewBuilder
    private func statusIndicator(for mission: Mission) -> some View {
        if let participation = participations.first(where: { $0.missionId == mission.id }) {
            Image(systemName: participation.completedAt != nil ? "trophy.fill" : "checkmark.seal.fill")
                .font(.subheadline)
                .foregroundStyle(participation.completedAt != nil ? Theme.amber : Theme.emerald)
        }
    }

    private func metaLabel(_ text: String, icon: String) -> some View {
        HStack(spacing: 5) {
            Image(systemName: icon)
                .font(.caption)
            Text(text)
                .font(.caption)
        }
        .foregroundStyle(Theme.textTertiary)
    }

    // MARK: Data

    private var filteredMissions: [Mission] {
        missions.filter { mission in
            let matchesCategory = selectedCategory == nil || mission.category == selectedCategory
            let matchesSearch = searchText.isEmpty
                || mission.title.localizedCaseInsensitiveContains(searchText)
                || mission.description.localizedCaseInsensitiveContains(searchText)
            return matchesCategory && matchesSearch
        }
    }

    private func loadData() async {
        errorMessage = nil
        do {
            missions = try await app.loadMissions()
            participations = try await app.loadMyParticipations()
        } catch {
            errorMessage = "Missionen konnten nicht geladen werden. Bitte versuche es erneut."
        }
        isLoading = false
    }
}

// MARK: - MissionDetailView

struct MissionDetailView: View {
    let mission: Mission

    @EnvironmentObject var app: AppState

    @State private var participation: Participation?
    @State private var isLoadingStatus = true
    @State private var isJoining = false
    @State private var isCompleting = false
    @State private var actionError: String?

    private var isCompleted: Bool {
        participation?.completedAt != nil
    }

    private var earnedCoins: Int {
        participation?.coinsEarned ?? mission.coins
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                header
                infoCard

                VStack(alignment: .leading, spacing: 10) {
                    SectionHeader(title: "Über diese Mission")
                    Text(mission.fullDescription)
                        .font(.body)
                        .foregroundStyle(Theme.textSecondary)
                        .lineSpacing(4)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

                actionSection
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
            .padding(.bottom, 32)
        }
        .background(Theme.background.ignoresSafeArea())
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadStatus() }
    }

    // MARK: Header

    private var header: some View {
        VStack(alignment: .leading, spacing: 12) {
            CategoryPill(category: mission.category)
            Text(mission.title)
                .font(.largeTitle.bold())
                .foregroundStyle(Theme.textPrimary)
                .fixedSize(horizontal: false, vertical: true)
            HStack(spacing: 6) {
                Image(systemName: "building.2")
                    .font(.subheadline)
                Text(mission.organizer)
                    .font(.subheadline)
            }
            .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: Info card

    private var infoCard: some View {
        VStack(spacing: 0) {
            infoRow(icon: "mappin", label: "Ort", value: mission.location)
            divider
            infoRow(icon: "clock", label: "Zeitraum", value: mission.deadline)
            divider
            infoRow(icon: "figure.walk", label: "Distanz", value: mission.distance)
            divider
            infoRow(icon: "flame", label: "Schwierigkeit", value: "\(mission.difficulty)/5")
            divider
            infoRow(icon: "person.2", label: "Max. Teilnehmer", value: "\(mission.participantsMax)")
            divider
            HStack(spacing: 12) {
                Image(systemName: "sparkles")
                    .font(.subheadline)
                    .foregroundStyle(Theme.emerald)
                    .frame(width: 22)
                Text("Belohnung")
                    .font(.subheadline)
                    .foregroundStyle(Theme.textSecondary)
                Spacer()
                KarmaCoinBadge(coins: mission.coins, compact: true)
            }
            .padding(.vertical, 10)
        }
        .card()
    }

    private var divider: some View {
        Rectangle()
            .fill(Theme.stroke)
            .frame(height: 1)
    }

    private func infoRow(icon: String, label: String, value: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.subheadline)
                .foregroundStyle(Theme.emerald)
                .frame(width: 22)
            Text(label)
                .font(.subheadline)
                .foregroundStyle(Theme.textSecondary)
            Spacer()
            Text(value)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Theme.textPrimary)
                .multilineTextAlignment(.trailing)
        }
        .padding(.vertical, 10)
    }

    // MARK: Action area

    @ViewBuilder
    private var actionSection: some View {
        VStack(spacing: 12) {
            if let actionError {
                ErrorBanner(message: actionError)
            }

            if isLoadingStatus {
                HStack(spacing: 10) {
                    ProgressView()
                        .tint(Theme.emerald)
                    Text("Status wird geladen …")
                        .font(.subheadline)
                        .foregroundStyle(Theme.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .card()
            } else if isCompleted {
                HStack(spacing: 12) {
                    Image(systemName: "trophy.fill")
                        .font(.title2)
                        .foregroundStyle(Theme.amber)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Abgeschlossen · +\(earnedCoins) Punkte verdient")
                            .font(.headline)
                            .foregroundStyle(Theme.textPrimary)
                        Text("Stark! Deine Karma-Punkte wurden gutgeschrieben.")
                            .font(.subheadline)
                            .foregroundStyle(Theme.textSecondary)
                    }
                    Spacer()
                }
                .card()
            } else if participation != nil {
                HStack(spacing: 12) {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.title2)
                        .foregroundStyle(Theme.emerald)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Du bist dabei!")
                            .font(.headline)
                            .foregroundStyle(Theme.textPrimary)
                        Text("Scanne vor Ort den QR-Code, um die Mission abzuschließen.")
                            .font(.subheadline)
                            .foregroundStyle(Theme.textSecondary)
                    }
                    Spacer()
                }
                .card()

                PrimaryButton(
                    title: "Mission abschließen (Demo-QR)",
                    systemImage: "qrcode.viewfinder",
                    loading: isCompleting,
                    disabled: isCompleting
                ) {
                    Task { await complete() }
                }
            } else {
                PrimaryButton(
                    title: "Ich bin dabei · +\(mission.coins) Punkte",
                    systemImage: "hand.raised.fill",
                    loading: isJoining,
                    disabled: isJoining
                ) {
                    Task { await join() }
                }
            }
        }
    }

    // MARK: Actions

    private func loadStatus() async {
        do {
            let all = try await app.loadMyParticipations()
            participation = all.first { $0.missionId == mission.id }
        } catch {
            actionError = "Status konnte nicht geladen werden. Bitte versuche es erneut."
        }
        isLoadingStatus = false
    }

    private func join() async {
        actionError = nil
        isJoining = true
        do {
            try await app.joinMission(mission.id)
            await loadStatus()
        } catch {
            let details = (String(describing: error) + " " + error.localizedDescription).lowercased()
            if details.contains("duplicate key") {
                actionError = "Du bist schon angemeldet."
                await loadStatus()
            } else {
                actionError = "Anmeldung fehlgeschlagen. Bitte versuche es erneut."
            }
        }
        isJoining = false
    }

    private func complete() async {
        actionError = nil
        isCompleting = true
        do {
            try await app.completeMission(mission)
            await app.refreshProfile()
            await loadStatus()
        } catch {
            actionError = "Abschluss fehlgeschlagen. Bitte versuche es erneut."
        }
        isCompleting = false
    }
}
