"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/founding-members", label: "Founding Members" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center gap-4 text-xs font-headline">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-primary transition-colors"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
