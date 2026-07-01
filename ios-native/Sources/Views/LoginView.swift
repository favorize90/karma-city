import SwiftUI

struct LoginView: View {

    private enum Field: Hashable {
        case name
        case email
        case password
    }

    @EnvironmentObject var app: AppState

    @State private var isSignUp = false
    @State private var fullName = ""
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?

    @FocusState private var focusedField: Field?

    private var trimmedName: String {
        fullName.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private var trimmedEmail: String {
        email.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private var formIsValid: Bool {
        let emailValid = trimmedEmail.contains("@") && trimmedEmail.contains(".")
        if isSignUp {
            return emailValid && password.count >= 6 && !trimmedName.isEmpty
        }
        return emailValid && !password.isEmpty
    }

    var body: some View {
        ZStack {
            Theme.background
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 28) {
                    header

                    if let errorMessage {
                        ErrorBanner(message: errorMessage)
                            .transition(.opacity.combined(with: .move(edge: .top)))
                    }

                    formCard

                    actionSection

                    footer
                }
                .padding(.horizontal, 20)
                .padding(.top, 56)
                .padding(.bottom, 32)
                .frame(maxWidth: 480)
                .frame(maxWidth: .infinity)
            }
            .scrollDismissesKeyboard(.interactively)
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: isSignUp)
        .animation(.easeOut(duration: 0.2), value: errorMessage)
    }

    // MARK: - Header

    private var header: some View {
        VStack(spacing: 18) {
            CoinIcon(size: 72)

            VStack(spacing: 8) {
                Text("Karma City")
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.textPrimary)

                Text("Mach Gutes. Sammle Karma. Werde belohnt.")
                    .font(.system(size: 15, weight: .medium, design: .rounded))
                    .foregroundStyle(Theme.textSecondary)
                    .multilineTextAlignment(.center)
            }
        }
    }

    // MARK: - Form

    private var formCard: some View {
        VStack(alignment: .leading, spacing: 20) {
            if isSignUp {
                VStack(alignment: .leading, spacing: 8) {
                    fieldLabel("Name")

                    TextField(
                        "",
                        text: $fullName,
                        prompt: Text("Dein Name").foregroundStyle(Theme.textTertiary)
                    )
                    .textContentType(.name)
                    .textInputAutocapitalization(.words)
                    .autocorrectionDisabled()
                    .focused($focusedField, equals: .name)
                    .submitLabel(.next)
                    .onSubmit { focusedField = .email }
                    .modifier(InputFieldStyle(isFocused: focusedField == .name))
                }
                .transition(.opacity.combined(with: .move(edge: .top)))
            }

            VStack(alignment: .leading, spacing: 8) {
                fieldLabel("E-Mail")

                TextField(
                    "",
                    text: $email,
                    prompt: Text("name@beispiel.de").foregroundStyle(Theme.textTertiary)
                )
                .keyboardType(.emailAddress)
                .textContentType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .focused($focusedField, equals: .email)
                .submitLabel(.next)
                .onSubmit { focusedField = .password }
                .modifier(InputFieldStyle(isFocused: focusedField == .email))
            }

            VStack(alignment: .leading, spacing: 8) {
                fieldLabel("Passwort")

                SecureField(
                    "",
                    text: $password,
                    prompt: Text(isSignUp ? "Mindestens 6 Zeichen" : "Dein Passwort")
                        .foregroundStyle(Theme.textTertiary)
                )
                .textContentType(isSignUp ? .newPassword : .password)
                .focused($focusedField, equals: .password)
                .submitLabel(.go)
                .onSubmit {
                    if formIsValid { submit() }
                }
                .modifier(InputFieldStyle(isFocused: focusedField == .password))

                if isSignUp {
                    Text("Mindestens 6 Zeichen, am besten mit Zahlen und Sonderzeichen.")
                        .font(.system(size: 12, design: .rounded))
                        .foregroundStyle(Theme.textTertiary)
                }
            }
        }
        .card(padding: 20)
        .disabled(isLoading)
    }

    private func fieldLabel(_ text: String) -> some View {
        Text(text.uppercased())
            .font(.system(size: 12, weight: .semibold, design: .rounded))
            .tracking(0.8)
            .foregroundStyle(Theme.textSecondary)
    }

    // MARK: - Actions

    private var actionSection: some View {
        VStack(spacing: 16) {
            PrimaryButton(
                title: isSignUp ? "Konto erstellen" : "Anmelden",
                systemImage: isSignUp ? "person.crop.circle.badge.plus" : "arrow.right",
                loading: isLoading,
                disabled: !formIsValid || isLoading
            ) {
                submit()
            }

            Button {
                focusedField = nil
                errorMessage = nil
                isSignUp.toggle()
            } label: {
                Group {
                    if isSignUp {
                        Text("Ich habe schon ein Konto")
                    } else {
                        Text("Neu hier? ")
                            .foregroundStyle(Theme.textSecondary)
                        + Text("Konto erstellen")
                            .foregroundStyle(Theme.emerald)
                    }
                }
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(Theme.emerald)
                .padding(.vertical, 6)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .disabled(isLoading)
        }
    }

    // MARK: - Footer

    private var footer: some View {
        Text("Pilot-Projekt Soest · DSGVO-konform, Hosting in der EU")
            .font(.system(size: 12, design: .rounded))
            .foregroundStyle(Theme.textTertiary)
            .multilineTextAlignment(.center)
            .padding(.top, 8)
    }

    // MARK: - Submit

    private func submit() {
        guard formIsValid, !isLoading else { return }
        focusedField = nil
        errorMessage = nil
        isLoading = true

        let signUp = isSignUp
        let emailValue = trimmedEmail
        let passwordValue = password
        let nameValue = trimmedName

        Task { @MainActor in
            do {
                if signUp {
                    try await app.signUp(email: emailValue, password: passwordValue, fullName: nameValue)
                } else {
                    try await app.signIn(email: emailValue, password: passwordValue)
                }
                // Success: RootView reacts to the published session and navigates automatically.
            } catch {
                let prefix = signUp ? "Registrierung fehlgeschlagen: " : "Anmeldung fehlgeschlagen: "
                errorMessage = prefix + error.localizedDescription
            }
            isLoading = false
        }
    }
}

// MARK: - Input field styling

private struct InputFieldStyle: ViewModifier {
    let isFocused: Bool

    func body(content: Content) -> some View {
        content
            .font(.system(size: 16, design: .rounded))
            .foregroundStyle(Theme.textPrimary)
            .tint(Theme.emerald)
            .padding(.horizontal, 14)
            .padding(.vertical, 13)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(Theme.surfaceLight)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .strokeBorder(isFocused ? Theme.emerald.opacity(0.55) : Theme.stroke, lineWidth: 1)
            )
            .animation(.easeOut(duration: 0.15), value: isFocused)
    }
}
