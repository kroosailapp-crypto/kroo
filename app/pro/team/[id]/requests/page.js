"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTeam } from "../layout";
import { IconPlus, IconX, IconChevronDown } from "@tabler/icons-react";

const PRIORITIES = ["low", "medium", "high", "urgent"];
const STATUSES = ["pending", "started", "blocked", "completed"];
const PRIORITY_COLOR = { low: "#888", medium: "#f59e0b", high: "#f97316", urgent: "#ef4444" };
const STATUS_COLOR = { pending: "#6b7280", started: "#0161f0", blocked: "#ef4444", completed: "#22c55e" };
const STATUS_BG = { pending: "#f3f4f6", started: "#eff6ff", blocked: "#fee2e2", completed: "#dcfce7" };

function RequestCard({ req, canManage, canDelete, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);

  async function updateStatus(status) {
    const { data } = await supabase.from("pro_service_requests").update({ status }).eq("id", req.id).select().single();
    onUpdate(data);
  }

  return (
    <div className="bg-white rounded-xl border" style={{ borderColor: "#e5e5e5" }}>
      <button className="w-full flex items-center gap-3 px-4 py-3 text-left" onClick={() => setOpen(v => !v)}>
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLOR[req.priority] }} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">{req.title}</p>
          {req.deadline && <p className="text-xs text-gray-400">Due {new Date(req.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>}
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-md capitalize flex-shrink-0"
          style={{ backgroundColor: STATUS_BG[req.status], color: STATUS_COLOR[req.status] }}>
          {req.status}
        </span>
        <IconChevronDown size={14} className="text-gray-400 flex-shrink-0" style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t" style={{ borderColor: "#f0f0f0" }}>
          {req.description && <p className="text-sm text-gray-600 mt-3">{req.description}</p>}
          {req.photo_url && <img src={req.photo_url} alt="request" className="w-full rounded-xl object-cover max-h-48" />}
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className="text-xs text-gray-400 capitalize px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: `${PRIORITY_COLOR[req.priority]}20`, color: PRIORITY_COLOR[req.priority] }}>
              {req.priority} priority
            </span>
          </div>
          {(canManage || true) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Status:</span>
              {STATUSES.map(s => (
                <button key={s} onClick={() => updateStatus(s)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium capitalize"
                  style={{ backgroundColor: req.status === s ? STATUS_COLOR[s] : "#f0f0f0", color: req.status === s ? "#fff" : "#888" }}>
                  {s}
                </button>
              ))}
            </div>
          )}
          {canDelete && (
            <button onClick={() => onDelete(req.id)} className="text-xs font-medium self-start" style={{ color: "#ef4444" }}>Delete request</button>
          )}
        </div>
      )}
    </div>
  );
}

function AddModal({ teamId, userId, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    let photoUrl = null;
    if (photoFile) {
      const path = `pro-requests/${teamId}/${Date.now()}-${photoFile.name}`;
      const { error } = await supabase.storage.from("profiles").upload(path, photoFile);
      if (!error) {
        const { data } = supabase.storage.from("profiles").getPublicUrl(path);
        photoUrl = data.publicUrl;
      }
    }
    const { data } = await supabase.from("pro_service_requests")
      .insert({ team_id: teamId, title, description: description || null, priority, deadline: deadline || null, photo_url: photoUrl, created_by: userId })
      .select().single();
    onCreate(data);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md px-5 pt-6 pb-10 flex flex-col gap-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">New service request</h3>
          <button onClick={onClose}><IconX size={20} className="text-gray-400" /></button>
        </div>
        <input placeholder="Title *" value={title} onChange={e => setTitle(e.target.value)} className="border rounded-xl px-4 py-3 text-sm outline-none" style={{ borderColor: "#e5e5e5" }} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="border rounded-xl px-4 py-3 text-sm outline-none resize-none" style={{ borderColor: "#e5e5e5" }} />
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Priority</label>
          <div className="flex gap-2">
            {PRIORITIES.map(p => (
              <button key={p} onClick={() => setPriority(p)} className="flex-1 py-2 rounded-full text-xs font-semibold capitalize"
                style={{ backgroundColor: priority === p ? PRIORITY_COLOR[p] : "#f0f0f0", color: priority === p ? "#fff" : "#888" }}>{p}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Deadline</label>
          <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="border rounded-xl px-4 py-3 text-sm outline-none w-full" style={{ borderColor: "#e5e5e5" }} />
        </div>
        <label className="cursor-pointer">
          <div className="px-4 py-2.5 rounded-xl border text-sm text-center text-gray-500" style={{ borderColor: "#e5e5e5" }}>
            {photoFile ? photoFile.name : "Attach photo"}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={e => setPhotoFile(e.target.files?.[0])} />
        </label>
        <button onClick={handleCreate} disabled={!title || loading} className="w-full py-3 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: !title || loading ? "#ccc" : "#0161f0" }}>
          {loading ? "Submitting…" : "Submit request"}
        </button>
      </div>
    </div>
  );
}

export default function RequestsPage() {
  const { id } = useParams();
  const { member } = useTeam();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("active");
  const [userId, setUserId] = useState(null);

  const isManager = member.role === "owner" || member.role === "manager";

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id));
    supabase.from("pro_service_requests").select("*").eq("team_id", id).order("created_at", { ascending: false }).then(({ data }) => {
      setRequests(data || []);
      setLoading(false);
    });
  }, [id]);

  async function handleDelete(reqId) {
    if (!confirm("Delete this request?")) return;
    await supabase.from("pro_service_requests").delete().eq("id", reqId);
    setRequests(rs => rs.filter(r => r.id !== reqId));
  }

  const filtered = requests.filter(r => {
    if (filter === "active") return r.status !== "completed";
    if (filter === "completed") return r.status === "completed";
    return r.priority === filter;
  });

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl">
      {showAdd && <AddModal teamId={id} userId={userId} onClose={() => setShowAdd(false)} onCreate={req => setRequests(rs => [req, ...rs])} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: "#02123e" }}>Service requests</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: "#0161f0" }}>
          <IconPlus size={16} /> New
        </button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {["active", "completed", "urgent", "high"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 capitalize"
            style={{ backgroundColor: filter === f ? "#0161f0" : "#fff", color: filter === f ? "#fff" : "#555", border: filter === f ? "none" : "1px solid #e5e5e5" }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0161f0", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(req => (
            <RequestCard key={req.id} req={req} canManage={isManager}
              canDelete={isManager || req.created_by === userId}
              onUpdate={updated => setRequests(rs => rs.map(r => r.id === updated.id ? updated : r))}
              onDelete={handleDelete}
            />
          ))}
          {filtered.length === 0 && <p className="text-sm text-gray-400 text-center py-12">No requests in this category</p>}
        </div>
      )}
    </div>
  );
}
