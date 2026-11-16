"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTeam } from "../layout";
import { IconPlus, IconX, IconPackage, IconPencil, IconCheck } from "@tabler/icons-react";

function ItemRow({ item, isManager, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || "");
  const [quantity, setQuantity] = useState(item.quantity || 1);

  async function save() {
    const { data } = await supabase.from("pro_inventory_items").update({ name, description, quantity }).eq("id", item.id).select().single();
    onUpdate(data);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="bg-white rounded-xl p-4 border flex flex-col gap-3" style={{ borderColor: "#0161f0" }}>
        <input value={name} onChange={e => setName(e.target.value)} className="border rounded-xl px-3 py-2 text-sm outline-none" style={{ borderColor: "#e5e5e5" }} />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border rounded-xl px-3 py-2 text-sm outline-none" style={{ borderColor: "#e5e5e5" }} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Qty:</span>
          <input type="number" min="1" value={quantity} onChange={e => setQuantity(+e.target.value)} className="border rounded-xl px-3 py-2 text-sm outline-none w-20" style={{ borderColor: "#e5e5e5" }} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-full text-xs font-medium border" style={{ borderColor: "#e5e5e5", color: "#555" }}>Cancel</button>
          <button onClick={save} className="flex-1 py-2 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: "#0161f0" }}>Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl px-4 py-3 border flex items-center gap-3" style={{ borderColor: "#e5e5e5" }}>
      <IconPackage size={18} className="text-gray-300 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
      </div>
      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">×{item.quantity}</span>
      {isManager && (
        <div className="flex gap-1">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-gray-100"><IconPencil size={14} className="text-gray-400" /></button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50"><IconX size={14} className="text-red-400" /></button>
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  const { id } = useParams();
  const { member } = useTeam();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [search, setSearch] = useState("");

  const isManager = member.role === "owner" || member.role === "manager";

  useEffect(() => {
    supabase.from("pro_inventory_items").select("*").eq("team_id", id).order("name").then(({ data }) => {
      setItems(data || []);
      setLoading(false);
    });
  }, [id]);

  async function handleAdd() {
    if (!name.trim()) return;
    const { data } = await supabase.from("pro_inventory_items").insert({ team_id: id, name: name.trim(), description: description.trim() || null, quantity }).select().single();
    setItems(i => [...i, data].sort((a, b) => a.name.localeCompare(b.name)));
    setName(""); setDescription(""); setQuantity(1); setShowAdd(false);
  }

  async function handleDelete(itemId) {
    if (!confirm("Remove this item?")) return;
    await supabase.from("pro_inventory_items").delete().eq("id", itemId);
    setItems(i => i.filter(x => x.id !== itemId));
  }

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: "#02123e" }}>Inventory <span className="text-gray-400 font-normal text-base">({items.length})</span></h1>
        {isManager && (
          <button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: "#0161f0" }}>
            <IconPlus size={16} /> Add item
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl p-4 border mb-5 flex flex-col gap-3" style={{ borderColor: "#0161f0" }}>
          <input placeholder="Item name *" value={name} onChange={e => setName(e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm outline-none" style={{ borderColor: "#e5e5e5" }} />
          <input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm outline-none" style={{ borderColor: "#e5e5e5" }} />
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-400">Quantity</label>
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(+e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm outline-none w-20" style={{ borderColor: "#e5e5e5" }} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-full text-sm font-medium border" style={{ borderColor: "#e5e5e5", color: "#555" }}>Cancel</button>
            <button onClick={handleAdd} disabled={!name.trim()} className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: !name.trim() ? "#ccc" : "#0161f0" }}>Add</button>
          </div>
        </div>
      )}

      <input placeholder="Search inventory…" value={search} onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none border bg-white mb-4" style={{ borderColor: "#e5e5e5" }} />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0161f0", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(item => (
            <ItemRow key={item.id} item={item} isManager={isManager}
              onDelete={handleDelete}
              onUpdate={updated => setItems(is => is.map(i => i.id === updated.id ? updated : i))}
            />
          ))}
          {filtered.length === 0 && <p className="text-sm text-gray-400 text-center py-12">{search ? "No items match your search" : "No inventory items yet"}</p>}
        </div>
      )}
    </div>
  );
}
