"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, User, Pencil, Trash2, Truck, AlertTriangle } from "lucide-react";
import useSWR from "swr";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminUsersPage() {
  const [tab, setTab] = useState<"customer" | "delivery">("customer");
  const { data, isLoading, mutate } = useSWR(
    `/api/admin/users?role=${tab}`,
    fetcher,
  );
  const users = data?.users ?? [];

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const [userToDelete, setUserToDelete] = useState<{
    _id: string;
    name: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  function openEdit(u: any) {
    setEditingUser(u);
    setEditForm({ name: u.name, phone: u.phone ?? "" });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error ?? "Failed to update user");
        return;
      }
      mutate();
      toast.success("User updated");
      setEditingUser(null);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!userToDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/users/${userToDelete._id}`, {
        method: "DELETE",
      });
      const d = await res.json();
      if (!res.ok) {
        setDeleteError(d.error ?? "Failed to delete user");
        return;
      }
      mutate();
      toast.success("Delivery account deleted");
      setUserToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Users</h1>
        {tab === "delivery" && (
          <Link
            href="/admin/users/new-delivery"
            className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-secondary transition"
          >
            <Plus size={16} />
            Add Delivery
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["customer", "delivery"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
              tab === t
                ? "bg-brand-primary text-white"
                : "bg-white border border-neutral-200 text-neutral-600 hover:border-brand-secondary"
            }`}
          >
            {t === "customer" ? "Customers" : "Delivery Staff"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse flex gap-3">
                <div className="w-9 h-9 bg-neutral-100 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-neutral-100 rounded w-1/3" />
                  <div className="h-3 bg-neutral-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="px-5 py-12 text-center text-neutral-400">
            No {tab} users yet
          </p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {users.map((u: any) => (
              <div key={u._id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-brand-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800">
                    {u.name}
                  </p>
                  <p className="text-xs text-neutral-400">{u.phone}</p>
                  
                </div>
                {tab === "delivery" && (
                  <div
                    className="flex items-center gap-1 text-xs text-neutral-500 flex-shrink-0"
                    title="Completed deliveries"
                  >
                    <Truck size={14} />
                    {u.deliveryCount ?? 0}
                  </div>
                )}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-neutral-400">
                    {new Date(u.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  {!u.isActive && (
                    <span className="text-xs text-danger">Inactive</span>
                  )}
                </div>
                {tab === "delivery" && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(u)}
                      className="p-2 text-neutral-400 hover:text-brand-primary hover:bg-neutral-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setUserToDelete({ _id: u._id, name: u.name })
                      }
                      className="p-2 text-neutral-400 hover:text-danger hover:bg-neutral-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form
            onSubmit={saveEdit}
            className="bg-white rounded-xl border border-neutral-200 max-w-sm w-full p-5 space-y-4"
          >
            <h2 className="font-semibold text-neutral-800">
              Edit Delivery Staff
            </h2>
            {[
              { key: "name", label: "Full name", type: "text" },
              { key: "phone", label: "Phone number", type: "tel", pattern: "[234][0-9]{7}", maxLength: 8, title: "8 digits starting with 2, 3 or 4" },
            ].map(({ key, label, type, pattern, maxLength, title }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  value={editForm[key as keyof typeof editForm]}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  pattern={pattern}
                  maxLength={maxLength}
                  title={title}
                  required
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                />
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl border border-neutral-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-danger flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-800">
                  Delete delivery account
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-neutral-700">
                    {userToDelete.name}
                  </span>
                  &apos;s account? This action cannot be undone.
                </p>
              </div>
            </div>
            {deleteError && (
              <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {deleteError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteError("");
                }}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
