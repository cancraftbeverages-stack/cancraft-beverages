import type { AnchorHTMLAttributes, ReactNode } from "react";
import { company } from "@/content/company";
import { cn } from "@/lib/utils";

type WhatsAppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  message?: string;
};

/**
 * Centralizes wa.me link construction around the configurable
 * company.contact.whatsappNumber value — never hardcode the number
 * in a component.
 */
export function WhatsAppLink({ children, message, className, ...rest }: WhatsAppLinkProps) {
  const base = `https://wa.me/${company.contact.whatsappNumber}`;
  const href = message ? `${base}?text=${encodeURIComponent(message)}` : base;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className)}
      {...rest}
    >
      {children}
    </a>
  );
}
