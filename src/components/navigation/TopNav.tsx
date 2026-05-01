"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./menuItems";

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="top-nav-wrap" role="banner">
      <nav className="top-nav" aria-label="Navegacao principal">
        <Link href="/" className="top-nav-brand" aria-label="Ir para RouteWise">
          <Image src="/logo/logo.png" alt="Logo RouteWise" width={28} height={28} priority />
          <span className="top-nav-brand-text">RouteWise</span>
        </Link>

        <div className="top-nav-links">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "top-nav-link is-active" : "top-nav-link"}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
