"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTeam } from "./layout";
import {
  IconUsers, IconCalendar, IconPackage, IconHammer,
  IconSettings2, IconMessageCircle, IconBell, IconClipboardList,
  IconPlus, IconUserPlus,
} from "@tabler/icons-react";

function StatCard({ label, value, href, icon: Icon, color = "#0161f0" }) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl p-4 flex flex-col gap-2 border hover:shadow-sm transition-shadow"
      style={{ borderColor: "#e5e5e5" }}
    >
      <div className="flex items-center justify-between">
        <Icon size={20} style={{ color }} />
        <span className="text-2xl font-bold" style={{ color: "#02123e" }}>{value}</span>
      </div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
    </Link>
  );
}

export default function TeamDashboard() {
  const { id } = useParams();
  const { team, member } = useTeam();
  const router = useRouter();
  const [stats, setStats] = useState({
    members: 0, events: 0, inventory: 0,
    maintenance: 0, requests: 0, surveys: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    async function load() {
      const [
        { count: members },
        { count: events },
        { count: inventory },
        { count: maintenance },
        { count: requests },
        { count: surveys },
        { data: upcoming },
        { data: pending },
      ] = await Promise.all([
        supabase.from("pro_team_members").select("*", { count: "exact", head: true }).eq("team_id", id),
        supabase.from("pro_events").select("*", { count: "exact", head: true }).eq("team_id", id),
        supabase.from("pro_inventory_items").select("*", { count: "exact", head: true }).eq("team_id", id),
        supabase.from("pro_maintenance_log").select("*", { count: "exact", head: true }).eq("team_id", id).neq("status", "completed"),
        supabase.from("pro_service_requests").select("*", { count: "exact", head: true }).eq("team_id", id).neq("status", "completed"),
        supabase.from("pro_surveys").select("*", { count: "exact", head: true }).eq("team_id", id),
        supabase.from("pro_events").select("*").eq("team_id", id).gte("date", new Date().toISOString()).order("date").limit(3),
        supabase.from("pro_service_requests").select("*").eq("team_id", id).neq("status", "completed").order("created_at", { ascending: false }).limit(3),
      ]);
      setStats({ members, events, inventory, maintenance, requests, surveys });
      setUpcomingEvents(upcoming || []);
      setPendingRequests(pending || []);
    }
    load();
  }, [id]);

  const isManager = member.role === "owner" || member.role === "manager";
  const base = `/pro/team/${id}`;

  const EVENT_TYPE_COLOR = { meeting: "#0161f0", practice: "#39e75f", regatta: "#02123e" };
  const PRIORITY_COLOR = { low: "#888", medium: "#f59e0b", high: "#f97316", urgent: "#ef4444" };
  const STATUS_LABEL = { pending: "Pending", started: "In progress", blocked: "Blocked", completed: "Done" };

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#02123e" }}>{team.name}</h1>
          <p className="text-sm text-gray-500 capitalize">{member.role.replace("_", " ")}</p>
        </div>
        {team.photo_url && (
          <img src={team.photo_url} alt={team.name} className="w-12 h-12 rounded-xl object-cover" />
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <StatCard label="Team members" value={stats.members} href={`${base}/roster`} icon={IconUsers} />
        <StatCard label="Events" value={stats.events} href={`${base}/events`} icon={IconCalendar} />
        <StatCard label="Inventory items" value={stats.inventory} href={`${base}/inventory`} icon={IconPackage} />
        <StatCard label="Open maintenance" value={stats.maintenance} href={`${base}/maintenance`} icon={IconHammer} color="#f97316" />
        <StatCard label="Open requests" value={stats.requests} href={`${base}/requests`} icon={IconSettings2} color="#ef4444" />
        <StatCard label="Surveys" value={stats.surveys} href={`${base}/surveys`} icon={IconClipboardList} color="#8b5cf6" />
      </div>

      {/* Quick actions */}
      {isManager && (
        <div className="flex gap-3 mb-8 flex-wrap">
          <Link
            href={`${base}/events?new=1`}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "#0161f0" }}
          >
            <IconPlus size={16} /> New event
          </Link>
          <Link
            href={`${base}?invite=1`}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border"
            style={{ borderColor: "#0161f0", color: "#0161f0" }}
          >
            <IconUserPlus size={16} /> Invite crew
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Upcoming events</h2>
            <Link href={`${base}/events`} className="text-xs" style={{ color: "#0161f0" }}>See all</Link>
          </div>
          <div className="flex flex-col gap-2">
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-gray-400 bg-white rounded-xl p-4 border" style={{ borderColor: "#e5e5e5" }}>No upcoming events</p>
            )}
            {upcomingEvents.map(ev => (
              <Link
                key={ev.id}
                href={`${base}/events/${ev.id}`}
                className="bg-white rounded-xl p-3 border flex items-center gap-3 hover:shadow-sm transition-shadow"
                style={{ borderColor: "#e5e5e5" }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: EVENT_TYPE_COLOR[ev.event_type] || "#888" }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{ev.name}</p>
                  <p className="text-xs text-gray-400">
                    {ev.date ? new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                    {ev.location ? ` · ${ev.location}` : ""}
                  </p>
                </div>
                <span
                  className="ml-auto text-xs font-medium capitalize px-2 py-0.5 rounded-md flex-shrink-0"
                  style={{ backgroundColor: `${EVENT_TYPE_COLOR[ev.event_type]}15`, color: EVENT_TYPE_COLOR[ev.event_type] || "#888" }}
                >
                  {ev.event_type}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Pending requests */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Open requests</h2>
            <Link href={`${base}/requests`} className="text-xs" style={{ color: "#0161f0" }}>See all</Link>
          </div>
          <div className="flex flex-col gap-2">
            {pendingRequests.length === 0 && (
              <p className="text-sm text-gray-400 bg-white rounded-xl p-4 border" style={{ borderColor: "#e5e5e5" }}>No open requests</p>
            )}
            {pendingRequests.map(req => (
              <Link
                key={req.id}
                href={`${base}/requests`}
                className="bg-white rounded-xl p-3 border flex items-center gap-3 hover:shadow-sm transition-shadow"
                style={{ borderColor: "#e5e5e5" }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PRIORITY_COLOR[req.priority] || "#888" }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{req.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{STATUS_LABEL[req.status]}</p>
                </div>
                <span
                  className="ml-auto text-xs font-medium capitalize px-2 py-0.5 rounded-md flex-shrink-0"
                  style={{ backgroundColor: `${PRIORITY_COLOR[req.priority]}20`, color: PRIORITY_COLOR[req.priority] }}
                >
                  {req.priority}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
