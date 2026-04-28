import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karma City - Social Impact Gamification",
  description: "Engagiere dich in deiner Stadt, verdiene Karma-Punkte und löse sie bei lokalen Partnern ein.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased text-zinc-900 noise-overlay">
        {children}
      </body>
    </html>
  );
}
