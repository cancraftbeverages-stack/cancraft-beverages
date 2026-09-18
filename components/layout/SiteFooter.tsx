import Image from "next/image";
import Link from "next/link";
import { company } from "@/content/company";
import { beverageCategories } from "@/content/beverageCategories";
import { primaryNav, startProjectHref } from "@/content/navigation";
import { Button } from "@/components/ui/Button";

export function SiteFooter() {
  return (
    <footer className="border-t border-steel-600/20 bg-ink-950 pb-24 pt-16 text-paper-50 lg:pb-16">
      <div className="mx-auto max-w-content px-6 lg:px-12">
        <div className="flex flex-col justify-between gap-10 border-b border-steel-600/20 pb-12 lg:flex-row lg:items-end">
          <div className="max-w-md">
            <Image
              src="/brand/cancraft-icon.png"
              alt="CanCraft Beverages"
              width={44}
              height={42}
              className="h-10 w-auto"
            />
            <p className="mt-3 text-sm leading-relaxed text-steel-300">
              {company.legalName} · {company.factory.display}
            </p>
            <p className="mt-1 text-sm text-steel-300">
              <a href={`mailto:${company.contact.email}`} className="hover:text-accent-500">
                {company.contact.email}
              </a>{" "}
              ·{" "}
              <a href={company.contact.phoneHref} className="hover:text-accent-500">
                {company.contact.phoneDisplay}
              </a>
            </p>
          </div>
          <Button href={startProjectHref} size="lg">
            Start Your Project
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-steel-400">
              Navigate
            </p>
            <ul className="mt-4 space-y-2.5">
              {primaryNav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-steel-300 hover:text-accent-500">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-steel-400">
              Beverages
            </p>
            <ul className="mt-4 space-y-2.5">
              {beverageCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={category.href}
                    className="text-sm text-steel-300 hover:text-accent-500"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-steel-400">
              Company
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/about" className="text-sm text-steel-300 hover:text-accent-500">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href={company.ownBrand.href}
                  className="text-sm text-steel-300 hover:text-accent-500"
                >
                  {company.ownBrand.name}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-steel-300 hover:text-accent-500">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-steel-400">
              Quality
            </p>
            <ul className="mt-4 space-y-2.5">
              {company.certifications.confirmed.map((cert) => (
                <li key={cert} className="text-sm text-steel-300">
                  {cert} confirmed
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="pt-6 text-xs text-steel-400">
          © {new Date().getFullYear()} {company.legalName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
