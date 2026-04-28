"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { KarmaCoinIcon } from "@/components/KarmaCoin";
import { missions, communityMembers, communityStats } from "@/data/mockData";
import {
  BarChart3,
  Users,
  Target,
  Gift,
  TrendingUp,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Download,
  Eye,
} from "lucide-react";

const tabs = [
  { key: "overview", label: "Übersicht", icon: BarChart3 },
  { key: "missions", label: "Missionen", icon: Target },
  { key: "partners", label: "Partner", icon: Gift },
  { key: "users", label: "Nutzer", icon: Users },
];

const mockPartners = [
  { name: "AquaFun Soest", status: "active", rewards: 2, redemptions: 47 },
  { name: "Cafe Fromme am Markt", status: "active", rewards: 1, redemptions: 83 },
  { name: "Stadtbücherei Soest", status: "active", rewards: 1, redemptions: 31 },
  { name: "Schlachthof Kino", status: "active", rewards: 1, redemptions: 56 },
  { name: "Burghofmuseum", status: "pending", rewards: 1, redemptions: 0 },
  { name: "Biolandhof Kneer", status: "active", rewards: 1, redemptions: 22 },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-[100dvh] bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-zinc-600 transition">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2.5">
              <KarmaCoinIcon size={24} />
              <span className="font-display text-base font-bold tracking-tight">Karma City</span>
              <span className="text-xs text-zinc-400 border-l border-zinc-200 pl-3 ml-1">Admin-Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">Stadt Soest</span>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700">
              SO
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-zinc-200 bg-white px-6">
        <div className="max-w-6xl mx-auto flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition ${
                  activeTab === tab.key
                    ? "border-emerald-500 text-emerald-700"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Aktive Nutzer", value: communityStats.activeVolunteersThisWeek, change: "+12%", icon: Users, color: "emerald" },
                { label: "Missionen diese Woche", value: "47", change: "+8%", icon: Target, color: "sky" },
                { label: "Einlösungen", value: "239", change: "+23%", icon: Gift, color: "amber" },
                { label: "Ehrenamtsstunden", value: "4.820", change: "+15%", icon: TrendingUp, color: "violet" },
              ].map((kpi, i) => {
                const Icon = kpi.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-zinc-200 bg-white p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Icon size={16} className="text-zinc-400" />
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{kpi.change}</span>
                    </div>
                    <p className="text-2xl font-bold font-mono tracking-tight text-zinc-800">{kpi.value}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{kpi.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Chart placeholder */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-700">Engagement-Verlauf (letzte 30 Tage)</h3>
                <button className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1">
                  <Download size={12} /> Export
                </button>
              </div>
              <div className="h-48 flex items-end gap-1.5 px-2">
                {Array.from({ length: 30 }).map((_, i) => {
                  const h = 20 + Math.sin(i * 0.3) * 30 + Math.random() * 40;
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.02, duration: 0.5 }}
                      className="flex-1 rounded-t bg-emerald-500/70 hover:bg-emerald-500 transition-colors cursor-pointer"
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 px-2 text-[10px] text-zinc-400">
                <span>29. März</span>
                <span>Heute</span>
              </div>
            </div>

            {/* Recent activity */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-zinc-700 mb-4">Letzte Aktivitäten</h3>
              <div className="space-y-3">
                {[
                  { text: "Neue Mission eingereicht: 'Frühjahrsputz am Soester Wall'", time: "vor 12 Min.", status: "pending" },
                  { text: "Burghofmuseum als Partner-Antrag eingegangen", time: "vor 2 Std.", status: "pending" },
                  { text: "47 Missionen diese Woche abgeschlossen", time: "vor 3 Std.", status: "success" },
                  { text: "Marlene Schemme hat Platin-Level erreicht", time: "vor 5 Std.", status: "success" },
                  { text: "Verdächtige Aktivität: 8 Missionen in 1 Stunde (User #247)", time: "gestern", status: "warning" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className={`mt-1 shrink-0 ${
                      item.status === "success" ? "text-emerald-500" :
                      item.status === "warning" ? "text-amber-500" :
                      "text-sky-500"
                    }`}>
                      {item.status === "success" ? <CheckCircle2 size={14} /> :
                       item.status === "warning" ? <AlertTriangle size={14} /> :
                       <Clock size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-700 truncate">{item.text}</p>
                      <p className="text-[11px] text-zinc-400">{item.time}</p>
                    </div>
                    <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium shrink-0">
                      <Eye size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Missions Tab */}
        {activeTab === "missions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input placeholder="Mission suchen..." className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm" />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600">
                  <Filter size={12} /> Filter
                </button>
                <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs text-white font-medium">
                  <Plus size={12} /> Neue Mission
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs text-zinc-400 font-medium">
                    <th className="px-4 py-3">Mission</th>
                    <th className="px-4 py-3">Kategorie</th>
                    <th className="px-4 py-3">Punkte</th>
                    <th className="px-4 py-3">Teilnehmer</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {missions.map((m) => (
                    <tr key={m.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition">
                      <td className="px-4 py-3 font-medium text-zinc-700">{m.title}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{m.category}</td>
                      <td className="px-4 py-3 font-mono text-xs text-amber-600">{m.coins}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{m.participantsCurrent}/{m.participantsMax}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          Aktiv
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Partners Tab */}
        {activeTab === "partners" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-700">Reward-Partner ({mockPartners.length})</h3>
              <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs text-white font-medium">
                <Plus size={12} /> Partner einladen
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {mockPartners.map((partner, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-zinc-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600">
                        {partner.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-zinc-700">{partner.name}</span>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      partner.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {partner.status === "active" ? "Aktiv" : "Ausstehend"}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                    <span>{partner.rewards} Rewards</span>
                    <span>{partner.redemptions} Einlösungen</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input placeholder="Nutzer suchen..." className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm" />
              </div>
              <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600">
                <Download size={12} /> CSV Export
              </button>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs text-zinc-400 font-medium">
                    <th className="px-4 py-3">Nutzer</th>
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3">Punkte</th>
                    <th className="px-4 py-3">Missionen</th>
                    <th className="px-4 py-3">Ortsteil</th>
                  </tr>
                </thead>
                <tbody>
                  {communityMembers.map((m) => (
                    <tr key={m.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition">
                      <td className="px-4 py-3 font-medium text-zinc-700">{m.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          m.level === "Platin" ? "bg-indigo-50 text-indigo-700" :
                          m.level === "Gold" ? "bg-yellow-50 text-yellow-700" :
                          m.level === "Silber" ? "bg-zinc-100 text-zinc-600" :
                          "bg-amber-50 text-amber-700"
                        }`}>{m.level}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-600">{m.coins}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{m.missionsCompleted}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{m.district}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
