"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { useCartStore } from "@/store/cartStore";
import { NotificationBell } from "@/components/ui/NotificationBell";

export function CustomerNav({ userName }: { userName: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const totalCount = useCartStore((s) => s.totalCount());

  const links = [
    { href: "/", label: t("home"), icon: "home" },
    { href: "/cart", label: t("cart"), icon: "shopping_cart", badge: totalCount },
    { href: "/orders", label: t("orders"), icon: "receipt_long" },
    { href: "/profile", label: t("profile"), icon: "person" },
  ];

  return (
    <>
      {/* Top header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-2 sm:px-4 max-w-4xl h-14 flex items-center justify-between">
          <Link href="/" aria-label={t("homeAriaLabel")} className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              className="rounded-md shrink-0"
            />
            <span className="text-headline-lg text-brand-primary tracking-tight leading-none">
              Starbox
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <NotificationBell
              href="/notifications"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-light/50 text-brand-primary transition"
            />
            <span className="text-body-md text-neutral-500 hidden sm:block ml-2">
              {userName}
            </span>
          </div>
        </div>
      </header>

      {/* Bottom navigation (mobile) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t border-neutral-200/60 z-40 sm:hidden safe-area-pb">
        <div className="grid grid-cols-4 h-16 px-2">
          {links.map(({ href, label, icon, badge }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center"
              >
                <span
                  className={`relative flex flex-col items-center justify-center gap-0.5 px-1 py-1 rounded-full text-label-sm transition ${
                    active ? "text-brand-primary" : "text-neutral-400"
                  }`}
                >
                  <span className="relative">
                    <Icon name={icon} size={22} filled={active} />
                    {badge != null && badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </span>
                  <span className="whitespace-nowrap">{label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop side-nav supplement: top right links */}
      <div className="hidden sm:flex fixed top-0 right-0 z-50 h-14 items-center pr-6">
        <div className="flex items-center gap-6 h-14 pt-0">
          {links.slice(1).map(({ href, label, icon, badge }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 text-label-lg transition ${
                  active
                    ? "text-brand-primary"
                    : "text-neutral-500 hover:text-brand-primary"
                }`}
              >
                <Icon name={icon} size={18} filled={active} />
                {label}
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1 -right-3 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
