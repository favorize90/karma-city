import { Capacitor } from "@capacitor/core";

/**
 * QR / reward-code scanning with a graceful web + simulator fallback.
 *
 * - On the web build (the live SSR app on Vercel, also what the native shell loads
 *   via server.url) `Capacitor.isNativePlatform()` is false → we run the existing
 *   2-second mock so the partner terminal demo behaves exactly as before.
 * - On a native build WITH a working camera and the ML Kit plugin compiled in, we
 *   open the native scanner and return the decoded value.
 * - On the iOS Simulator / an emulator without a camera, or when the ML Kit plugin
 *   is not integrated (e.g. an SPM-only iOS build), every native call is wrapped so
 *   it falls back to the mock instead of throwing — the pitch demo never breaks.
 */

const MOCK_CODE = "KC-2026-0847";

export interface ScanOutcome {
  value: string; // decoded QR / reward code
  isMock: boolean; // true when the native scanner was unavailable
}

async function mock(delay = 2000): Promise<ScanOutcome> {
  await new Promise((r) => setTimeout(r, delay));
  return { value: MOCK_CODE, isMock: true };
}

export async function scanRewardCode(): Promise<ScanOutcome> {
  // Web / hybrid WebView content → existing mock behaviour.
  if (!Capacitor.isNativePlatform()) {
    return mock();
  }

  try {
    // Dynamic import: the native plugin never enters the web/Vercel bundle.
    const mod = await import("@capacitor-mlkit/barcode-scanning");
    const { BarcodeScanner, BarcodeFormat } = mod;

    // Plugin present but device/platform may still not support it (Simulator).
    const { supported } = await BarcodeScanner.isSupported();
    if (!supported) return mock(1200);

    // Android: install the on-device Google module so no camera permission prompt
    // is needed; harmless no-op on iOS.
    if (Capacitor.getPlatform() === "android") {
      try {
        const { available } =
          await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
        if (!available) {
          await BarcodeScanner.installGoogleBarcodeScannerModule();
        }
      } catch {
        // Module check unavailable → continue; scan() will request what it needs.
      }
    }

    const { barcodes } = await BarcodeScanner.scan({
      formats: [BarcodeFormat.QrCode],
    });

    const raw = barcodes[0]?.rawValue ?? barcodes[0]?.displayValue;
    if (!raw) {
      throw new Error("Kein QR-Code erkannt");
    }
    return { value: raw, isMock: false };
  } catch (err) {
    // Plugin not implemented (SPM build), permission denied, or user cancelled.
    // Re-throw genuine cancellations so the UI can return to idle; otherwise mock.
    const message = err instanceof Error ? err.message : String(err);
    if (/cancel/i.test(message)) throw err;
    return mock(1200);
  }
}
