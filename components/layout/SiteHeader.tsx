"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { primaryNav, startProjectHref } from "@/content/navigation";
import { Button } from "@/components/ui/Button";
import { CallLink } from "@/components/ui/CallLink";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { cn } from "@/lib/utils";

/** Matches the .mobile-nav transition in app/globals.css. */
const MENU_TRANSITION_MS = 250;

export function SiteHeader() {
  const pathname = usePathname();
  // menuOpen is what the visitor asked for. The menu stays in the page while it animates closed
  // (menuPresent) and is removed afterwards, so a closed menu is not in the page at all, as before.
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPresent, setMenuPresent] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      setMenuPresent(true);
      return;
    }
    setMenuExpanded(false);
    const timer = window.setTimeout(() => setMenuPresent(false), MENU_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen || !menuPresent) return;
    // Let the browser register the collapsed state first, so the opening transition runs.
    menuRef.current?.getBoundingClientRect();
    setMenuExpanded(true);
  }, [menuOpen, menuPresent]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-steel-600/20 bg-ink-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6 xl:h-[72px] xl:px-12">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-500"
        >
          <Image
            src="/brand/cancraft-icon.png"
            alt="CanCraft Beverages"
            width={40}
            height={38}
            priority
            className="h-9 w-auto"
          />
          <span className="font-display text-lg font-semibold tracking-wide text-paper-50">
            CANCRAFT
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 xl:flex">
          {primaryNav.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative py-1 text-sm font-medium tracking-wide transition-colors duration-micro ease-confident hover:text-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-500",
                  isActive ? "text-accent-500" : "text-paper-50/80",
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent-500 transition-transform duration-standard ease-confident group-hover:scale-x-100",
                    isActive && "scale-x-100",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden xl:block">
          <Button href={startProjectHref} size="md">
            Start Your Project
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded text-paper-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 xl:hidden"
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            {menuOpen ? (
              <path
                d="M4 4L18 18M18 4L4 18"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ) : (
              <>
                <path d="M2 6H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M2 11H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M2 16H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {menuPresent ? (
        <div
          id="mobile-nav"
          ref={menuRef}
          data-state={menuExpanded ? "open" : "closed"}
          className="mobile-nav grid overflow-hidden border-t border-steel-600/20 bg-ink-950 xl:hidden"
        >
          <div className="min-h-0">
            <nav aria-label="Mobile primary" className="flex flex-col gap-1 px-6 py-4">
              {primaryNav.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded py-2.5 text-base font-medium text-paper-50/90 hover:text-accent-500"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3 border-t border-steel-600/20 px-6 py-4">
              <CallLink className="flex-1 rounded border border-steel-400/50 py-2.5 text-center text-sm font-medium text-paper-50">
                Call
              </CallLink>
              <WhatsAppLink className="flex-1 rounded border border-steel-400/50 py-2.5 text-center text-sm font-medium text-paper-50">
                WhatsApp
              </WhatsAppLink>
              <Button href={startProjectHref} size="md" className="flex-1">
                Start
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
