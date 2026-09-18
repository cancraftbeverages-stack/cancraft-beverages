import type { AnchorHTMLAttributes, ReactNode } from "react";
import { company } from "@/content/company";
import { cn } from "@/lib/utils";

type CallLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
};

export function CallLink({ children, className, ...rest }: CallLinkProps) {
  return (
    <a href={company.contact.phoneHref} className={cn(className)} {...rest}>
      {children}
    </a>
  );
}
