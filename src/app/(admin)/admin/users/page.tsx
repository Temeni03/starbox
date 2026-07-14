"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Plus, User, Pencil, Trash2, Truck, AlertTriangle, Search } from "lucide-react";
import useSWR from "swr";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminUsersPage() {
  const t = useTranslations("adminUsers");
  const tCommon = useTranslations("common");
  const tProfile = useTranslations("profile");
  const [tab, setTab] = useState<"customer" | "delivery">("customer");
  const { data, isLoading, mutate } = useSWR(
    `/api/admin/users?role=${tab}`,
    fetcher,
  );
  const users = data?.users ?? [];
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u: any) => u.name?.toLowerCase().includes(q) || u.phone?.includes(q));
  }, [users, search]);

  const activeCount = useMemo(() => users.filter((u: any) => u.isActive).length, [users]);

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
        toast.error(d.error ?? t("updateError"));
        return;
      }
      mutate();
      toast.success(t("userUpdated"));
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
        setDeleteError(d.error ?? t("deleteAccountError"));
        return;
      }
      mutate();
      toast.success(t("deliveryAccountDeleted"));
      setUserToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5 pb-20 sm:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">{t("title")}</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {tab === "customer"
            ? t("subtitleCustomers", { count: users.length })
            : t("subtitleDelivery", { count: users.length })}
        </p>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full h-12 pl-12 pr-4 bg-surface-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition shadow-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["customer", "delivery"] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition ${
                tab === tabKey
                  ? "bg-brand-primary text-white"
                  : "bg-white border border-neutral-200 text-neutral-500 hover:border-brand-primary"
              }`}
            >
              {tabKey === "customer" ? t("customers") : t("deliveryStaff")}
            </button>
          ))}
        </div>
        {tab === "delivery" && (
          <Link
            href="/admin/users/new-delivery"
            className="hidden sm:flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-secondary transition"
          >
            <Plus size={16} />
            {t("addDelivery")}
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-brand-container/15 p-5 rounded-2xl border border-brand-container/40">
          <p className="text-[10px] font-semibold text-brand-secondary uppercase tracking-wider">{t("active")}</p>
          <p className="text-2xl font-bold text-brand-primary">{activeCount} / {users.length}</p>
        </div>
        <div className="bg-surface-high p-5 rounded-2xl border border-neutral-200">
          <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{tab === 'customer' ? t('totalCustomers') : t('totalStaff')}</p>
          <p className="text-2xl font-bold text-neutral-800">{users.length}</p>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-4 animate-pulse flex gap-3">
              <div className="w-14 h-14 bg-neutral-100 rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-neutral-100 rounded w-1/3" />
                <div className="h-3 bg-neutral-100 rounded w-1/4" />
              </div>
            </div>
          ))
        ) : filteredUsers.length === 0 ? (
          <p className="bg-white rounded-2xl border border-neutral-200 px-5 py-12 text-center text-neutral-400">
            {t("noUsersFound", { type: tab === "customer" ? t("customers") : t("deliveryStaff") })}
          </p>
        ) : (
          filteredUsers.map((u: any) => (
            <div
              key={u._id}
              className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-2xl p-4 flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-container bg-brand-light flex items-center justify-center">
                    {u.profilePhoto ? (
                      <Image src={u.profilePhoto} alt={u.name} width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <User size={22} className="text-brand-primary" />
                    )}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${u.isActive ? 'bg-success' : 'bg-neutral-300'}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-800 truncate">{u.name}</h3>
                  <p className="text-xs text-neutral-400">{u.phone}</p>
                  {tab === "delivery" && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                      <Truck size={14} className="text-brand-primary" />
                      {t("completedDeliveries", { count: u.deliveryCount ?? 0 })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'bg-success/10 text-success' : 'bg-neutral-100 text-neutral-500'}`}>
                  {u.isActive ? t("activeBadge") : t("inactiveBadge")}
                </span>
                {tab === "delivery" && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(u)}
                      className="p-2 text-neutral-400 hover:text-brand-primary hover:bg-brand-light/40 rounded-lg transition"
                      title={tCommon("edit")}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setUserToDelete({ _id: u._id, name: u.name })}
                      className="p-2 text-neutral-400 hover:text-danger hover:bg-red-50 rounded-lg transition"
                      title={tCommon("delete")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {tab === "delivery" && (
        <Link
          href="/admin/users/new-delivery"
          className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all z-40"
          aria-label={t("addDeliveryAria")}
        >
          <Plus size={26} />
        </Link>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form
            onSubmit={saveEdit}
            className="bg-white rounded-2xl border border-neutral-200 max-w-sm w-full p-5 space-y-4"
          >
            <h2 className="text-base font-semibold text-neutral-800">
              {t("editDeliveryStaff")}
            </h2>
            {[
              { key: "name", label: t("fullName"), type: "text" },
              { key: "phone", label: t("phoneNumber"), type: "tel", pattern: "[234][0-9]{7}", maxLength: 8, title: tProfile("phoneHint") },
            ].map(({ key, label, type, pattern, maxLength, title }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
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
                  className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
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
                {tCommon("cancel")}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition disabled:opacity-50"
              >
                {saving ? t("saving") : tCommon("save")}
              </button>
            </div>
          </form>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-danger flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-800">
                  {t("deleteAccountTitle")}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {t("deleteAccountConfirm", { name: userToDelete.name })}
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
                {tCommon("cancel")}
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {deleting ? t("deleting") : tCommon("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
