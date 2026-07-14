"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import useSWR from "swr";
import toast from "react-hot-toast";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { OrderStatus } from "@/models/Order";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["transit", "cancelled"],
  transit: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("adminOrderDetail");
  const tCommon = useTranslations("common");
  const tCheckout = useTranslations("checkout");
  const tStatus = useTranslations("status");
  const locale = useLocale();
  const router = useRouter();
  const { data, isLoading, mutate } = useSWR(`/api/orders/${id}`, fetcher);
  const { data: usersData } = useSWR("/api/admin/users?role=delivery", fetcher);

  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState("");

  const order = data?.order;
  const deliveryUsers = usersData?.users ?? [];

  async function changeStatus(newStatus: OrderStatus) {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note: statusNote }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("statusUpdated", { status: tStatus(newStatus) }));
      setStatusNote("");
      mutate();
    } catch {
      toast.error(t("updateStatusError"));
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function assignDelivery() {
    if (!selectedDelivery) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryPersonId: selectedDelivery }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("deliveryAssigned"));
      mutate();
    } catch {
      toast.error(t("assignError"));
    } finally {
      setAssigning(false);
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-neutral-200 rounded w-1/3" />
        <div className="h-40 bg-white rounded-2xl border border-neutral-200" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-neutral-400">
        {t("notFound")}{" "}
        <Link
          href="/admin/orders"
          className="text-brand-secondary hover:underline"
        >
          {t("back")}
        </Link>
      </div>
    );
  }

  const nextStatuses = NEXT_STATUSES[order.status as OrderStatus] ?? [];

  return (
    <div className="max-w-2xl space-y-4 mt-16">
      <Link
        href="/admin/orders"
        className="flex items-center gap-1 text-body-md text-neutral-500 hover:text-brand-primary transition"
      >
        <Icon name="arrow_back" size={16} /> {t("backToOrders")}
      </Link>

      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-headline-md text-neutral-800">
              {order.orderNumber}
            </p>
            <p className="text-label-sm text-neutral-400 mt-0.5">
              {new Date(order.createdAt).toLocaleString(locale, {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <StatusBadge status={order.status as OrderStatus} />
        </div>

        <div className="mt-4 flex items-center gap-2 text-body-md text-neutral-600">
          <Icon name="person" size={16} />
          <span className="font-medium">{order.customer?.name}</span>
          <span className="text-neutral-400">·</span>
          <span>{order.customer?.phone}</span>
        </div>
      </div>

      {/* Status change */}
      {nextStatuses.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
          <h2 className="text-headline-md text-neutral-800">
            {t("changeStatus")}
          </h2>
          <input
            type="text"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            placeholder={t("notePlaceholder")}
            className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-body-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
          />
          <div className="flex gap-2 flex-wrap">
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                disabled={updatingStatus}
                className={`px-4 py-2 rounded-xl text-label-lg capitalize transition disabled:opacity-50 ${
                  s === "cancelled"
                    ? "bg-red-50 text-danger border border-red-200 hover:bg-red-100"
                    : "bg-brand-primary text-white hover:bg-brand-secondary"
                }`}
              >
                {s === "transit"
                  ? t("markInTransit")
                  : t("markAs", { status: tStatus(s) })}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Assign delivery */}
      {(order.status === "confirmed" || order.status === "transit") && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
          <h2 className="text-headline-md text-neutral-800">
            {t("assignDelivery")}
            {order.assignedTo && (
              <span className="ml-2 text-body-md font-normal text-neutral-400">
                {t("currentAssignee", { name: order.assignedTo.name })}
              </span>
            )}
          </h2>
          <div className="flex gap-2">
            <select
              value={selectedDelivery}
              onChange={(e) => setSelectedDelivery(e.target.value)}
              className="flex-1 h-12 px-4 border border-neutral-200 rounded-xl text-body-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
            >
              <option value="">{t("selectDeliveryPerson")}</option>
              {deliveryUsers.map((u: any) => (
                <option key={u._id} value={u._id}>
                  {u.name} · {u.phone}
                </option>
              ))}
            </select>
            <button
              onClick={assignDelivery}
              disabled={assigning || !selectedDelivery}
              className="px-4 py-2 bg-brand-primary text-white rounded-xl text-label-lg hover:bg-brand-secondary disabled:opacity-50 transition"
            >
              {assigning ? t("assigning") : t("assign")}
            </button>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-headline-md text-neutral-800 mb-3">{t("items")}</h2>
        <div className="space-y-3">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <div className="relative w-12 h-12 bg-surface-high rounded-lg overflow-hidden shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                    <Icon name="package_2" size={16} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-md text-neutral-700 truncate">{item.name}</p>
                <p className="text-label-sm text-neutral-400">
                  {t("qtyEach", {
                    qty: item.quantity,
                    price: `${item.price.toLocaleString()} MRU`,
                  })}
                </p>
              </div>
              <p className="text-body-md font-medium">
                {(item.price * item.quantity).toLocaleString()} MRU
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-100 mt-4 pt-3 space-y-1.5">
          <div className="flex justify-between text-body-md text-neutral-500">
            <span>{tCommon("subtotal")}</span>
            <span>{order.cartTotal?.toLocaleString()} MRU</span>
          </div>
          <div className="flex justify-between text-body-md text-neutral-500">
            <span>{tCommon("delivery")}</span>
            <span>
              {order.deliveryFee === 0
                ? tCommon("free")
                : `${order.deliveryFee?.toLocaleString()} MRU`}
            </span>
          </div>
          <div className="flex justify-between text-headline-md text-neutral-800">
            <span>{tCommon("total")}</span>
            <span className="text-brand-primary">
              {order.grandTotal?.toLocaleString()} MRU
            </span>
          </div>
        </div>
      </div>

      {/* Delivery & Payment info */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
        <div className="flex items-start gap-2">
          <Icon name="location_on" size={16} className="text-neutral-400 mt-0.5" />
          <div>
            <p className="text-body-md font-medium text-neutral-700">
              {order.deliveryOption === "home"
                ? tCheckout("homeDelivery")
                : tCheckout("storePickup")}
            </p>
            {order.deliveryAddress && (
              <p className="text-body-md text-neutral-500">
                {order.deliveryAddress}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="credit_card" size={16} className="text-neutral-400" />
          <p className="text-body-md font-medium text-neutral-700">
            {order.paymentMethod === "cash"
              ? tCheckout("cashOnDelivery")
              : tCheckout("bankTransfer")}
          </p>
        </div>
        {order.paymentScreenshot && (
          <div>
            <p className="text-label-sm text-neutral-500 mb-1">
              {t("paymentScreenshotLabel")}
            </p>
            <a
              href={order.paymentScreenshot}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={order.paymentScreenshot}
                alt="Payment"
                width={120}
                height={120}
                className="rounded-lg object-cover border border-neutral-200"
              />
            </a>
          </div>
        )}
      </div>

      {/* Status history */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-headline-md text-neutral-800 mb-3">
          {t("statusHistory")}
        </h2>
        <div className="space-y-2">
          {order.statusHistory?.map((h: any, i: number) => (
            <div key={i} className="flex items-start gap-3 text-body-md">
              <div className="w-2 h-2 rounded-full bg-brand-primary mt-1.5 shrink-0" />
              <div>
                <span className="font-medium capitalize text-neutral-700">
                  {tStatus(h.status as OrderStatus)}
                </span>
                {h.note && (
                  <span className="text-neutral-400 ml-1">— {h.note}</span>
                )}
                <p className="text-label-sm text-neutral-400">
                  {new Date(h.changedAt).toLocaleString(locale, {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
