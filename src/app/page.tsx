"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { KarmaCoinIcon } from "@/components/KarmaCoin";
import { cities, CityConfig } from "@/data/cityConfig";
import {
  ArrowRight,
  Leaf,
  Users,
  QrCode,
  Gift,
  BarChart3,
  Shield,
  Smartphone,
  Building2,
  ChevronDown,
  CheckCircle2,
  Zap,
  Globe,
  Heart,
} from "lucide-react";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

function ImpactChain() {
  const steps = [
    { icon: Smartphone, label: "Mission entdecken", desc: "Finde Einsätze in deiner Nähe" },
    { icon: Heart, label: "Engagement zeigen", desc: "Hilf mit und mach den Unterschied" },
    { icon: QrCode, label: "QR-Code scannen", desc: "Dein Einsatz wird verifiziert" },
    { icon: KarmaCoinIcon, label: "Karma-Punkte sammeln", desc: "Jede gute Tat zählt" },
    { icon: Gift, label: "Rewards einlösen", desc: "Freibad, Cafe, Kino und mehr" },
  ];

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-0">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2 md:flex-col md:gap-3 md:text-center flex-1"
          >
            <div className="flex h-12 w-12 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800">{step.label}</p>
              <p className="text-xs text-zinc-500">{step.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute right-0 translate-x-1/2">
                <ArrowRight size={14} className="text-zinc-300" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function LandingPage() {
  const [activeCity, setActiveCity] = useState<CityConfig>(cities.soest);
  const [cityDropdown, setCityDropdown] = useState(false);

  return (
    <div className="relative bg-zinc-950 text-white overflow-hidden">
      {/* Mesh gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="mesh-blob absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="mesh-blob-delayed absolute top-1/3 -right-20 h-[400px] w-[400px] rounded-full bg-lime-500/15 blur-[100px]" />
        <div className="mesh-blob absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-amber-500/10 blur-[80px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2.5">
          <KarmaCoinIcon size={28} />
          <span className="font-display text-lg font-bold tracking-tight">Karma City</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Whitelabel city switcher */}
          <div className="relative">
            <button
              onClick={() => setCityDropdown(!cityDropdown)}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-sm transition hover:bg-white/10"
            >
              <Globe size={12} />
              {activeCity.name}
              <ChevronDown size={12} />
            </button>
            {cityDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl p-1.5 shadow-2xl">
                {Object.values(cities).map((city) => (
                  <button
                    key={city.id}
                    onClick={() => { setActiveCity(city); setCityDropdown(false); }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                      activeCity.id === city.id ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-400 hover:bg-white/5"
                    }`}
                  >
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: city.primaryColor }} />
                    {city.name}
                    <span className="ml-auto text-[10px] text-zinc-600">{city.region}</span>
                  </button>
                ))}
                <div className="mt-1 border-t border-white/5 pt-1.5">
                  <div className="px-3 py-1.5 text-[10px] text-zinc-600">
                    Whitelabel-Plattform -- funktioniert für jede Stadt
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link
            href="/app"
            className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-400 active:scale-[0.97]"
          >
            App starten
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 px-6 pt-16 pb-20 md:px-12 md:pt-28 md:pb-32 max-w-5xl mx-auto"
      >
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400 mb-6">
          <Zap size={12} /> Pilot-Projekt {activeCity.name}
        </motion.div>

        <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-7xl font-extrabold tracking-tighter leading-[0.95]">
          Mach Gutes.{" "}
          <span className="text-gradient-karma">Sammle Karma.</span>
          <br />
          Werde belohnt.
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base md:text-lg text-zinc-400 leading-relaxed">
          Karma City macht bürgerschaftliches Engagement sichtbar und belohnt es.
          Entdecke Missionen in <strong className="text-zinc-200">{activeCity.name}</strong>,
          sammle Karma-Punkte und löse sie bei lokalen Partnern ein.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 active:scale-[0.97] shadow-lg shadow-emerald-500/20"
          >
            Jetzt mitmachen <ArrowRight size={16} />
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10 backdrop-blur-sm"
          >
            <Building2 size={15} /> Admin-Dashboard
          </Link>
          <Link
            href="/partner"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10 backdrop-blur-sm"
          >
            <Gift size={15} /> Partner-Terminal
          </Link>
        </motion.div>

        {/* Hero stats */}
        <motion.div variants={fadeUp} className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: activeCity.heroStats.volunteers, label: "Aktive Helfer", suffix: "" },
            { value: activeCity.heroStats.missions, label: "Missionen erledigt", suffix: "" },
            { value: activeCity.heroStats.hoursVolunteered, label: "Stunden Ehrenamt", suffix: "h" },
            { value: activeCity.heroStats.partners, label: "Lokale Partner", suffix: "" },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm px-4 py-4"
            >
              <p className="font-display text-2xl md:text-3xl font-bold text-white font-mono tracking-tight">
                {stat.value > 0 ? stat.value.toLocaleString("de-DE") : "--"}{stat.suffix}
              </p>
              <p className="mt-1 text-xs text-zinc-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* How it works */}
      <section className="relative z-10 px-6 py-20 md:px-12 bg-white text-zinc-900">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-2">So funktioniert es</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Von der Mission zur Belohnung
            </h2>
          </motion.div>
          <ImpactChain />
        </div>
      </section>

      {/* Why it works - Impact section */}
      <section className="relative z-10 px-6 py-20 md:px-12 bg-zinc-50 text-zinc-900">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-2">Wirkungskette</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Alle profitieren
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Für Bürger:innen",
                points: [
                  "Engagement wird sichtbar und wertgeschätzt",
                  "Echte Belohnungen bei lokalen Partnern",
                  "Community-Erlebnis statt Einzelkämpfer",
                  "Level-System motiviert langfristig",
                ],
                color: "emerald",
              },
              {
                icon: Building2,
                title: "Für die Stadt",
                points: [
                  "Messbare Impact-Daten für Förderanträge",
                  "Stärkung des Ehrenamts ohne Mehraufwand",
                  "Digitale Sichtbarkeit und Bürgerbindung",
                  "Whitelabel: sofort einsatzbereit",
                ],
                color: "sky",
              },
              {
                icon: Gift,
                title: "Für lokale Partner",
                points: [
                  "Neue Kunden durch Reward-Einlösungen",
                  "Positive Markenassoziation",
                  "Einfache Integration per QR-Code",
                  "Kein technischer Aufwand nötig",
                ],
                color: "amber",
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-zinc-200 bg-white p-6"
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-${card.color}-100 text-${card.color}-600 mb-4`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-3">{card.title}</h3>
                  <ul className="space-y-2">
                    {card.points.map((point, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-zinc-600">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 px-6 py-20 md:px-12 bg-white text-zinc-900">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-2">Plattform</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Durchdacht bis ins Detail
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: QrCode, title: "QR-Code Validierung", desc: "Duale Verifizierung: Scan bei Start und Abschluss jeder Mission" },
              { icon: Shield, title: "Anti-Fraud", desc: "Geo-Tags, Foto-Beweis und Community-Checks verhindern Missbrauch" },
              { icon: BarChart3, title: "Impact-Dashboard", desc: "Echtzeitdaten für Stadt und Förderer über den sozialen Impact" },
              { icon: Globe, title: "Whitelabel", desc: "Eine Plattform, unendlich viele Städte -- sofort anpassbar" },
              { icon: Smartphone, title: "Progressive Web App", desc: "Kein App-Store nötig -- funktioniert direkt im Browser" },
              { icon: Leaf, title: "DSGVO-konform", desc: "Datensparsamkeit und Transparenz als Designprinzip" },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5"
                >
                  <Icon size={20} className="text-emerald-600 mb-3" />
                  <h3 className="text-sm font-semibold text-zinc-800 mb-1">{feature.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact model */}
      <section className="relative z-10 px-6 py-20 md:px-12 bg-zinc-950 text-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">Wirkungsmodell</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Was wäre wenn?
            </h2>
            <p className="mt-3 text-zinc-500 text-sm max-w-lg mx-auto">
              Hochrechnung für {activeCity.name} ({activeCity.population} Einwohner) bei 500 aktiven Nutzern
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "52.000", unit: "Stunden", desc: "Ehrenamt pro Jahr" },
              { value: "2.600", unit: "Missionen", desc: "abgeschlossen pro Jahr" },
              { value: "780.000 Euro", unit: "Wert", desc: "soziale Wertschöpfung *" },
              { value: "12+", unit: "Partner", desc: "lokale Unternehmen" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-center"
              >
                <p className="font-display text-xl md:text-2xl font-bold text-emerald-400 font-mono">{stat.value}</p>
                <p className="text-xs text-zinc-300 font-medium mt-1">{stat.unit}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
          <p className="mt-6 text-[10px] text-zinc-700 text-center">
            * Basierend auf 15 Euro/Stunde (Mindestlohn-Äquivalent für ehrenamtliche Arbeit)
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 md:px-12 bg-white text-zinc-900">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <KarmaCoinIcon size={48} className="mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Karma City für Ihre Stadt?
            </h2>
            <p className="mt-4 text-zinc-500 text-sm leading-relaxed max-w-md mx-auto">
              Die Plattform ist als Whitelabel sofort einsetzbar.
              Kontaktieren Sie uns für eine Live-Demo oder den Pilot-Start in Ihrer Kommune.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 active:scale-[0.97]"
              >
                Prototyp ansehen <ArrowRight size={16} />
              </Link>
              <a
                href="mailto:kontakt@karmacity.de"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Kontakt aufnehmen
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 bg-zinc-950 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <KarmaCoinIcon size={16} />
            <span className="font-display font-semibold text-zinc-400">Karma City</span>
            <span>-- Social Impact Gamification</span>
          </div>
          <div className="flex gap-4">
            <span>Datenschutz</span>
            <span>Impressum</span>
            <span>Kontakt</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
