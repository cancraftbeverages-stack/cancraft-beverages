import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

/** Consistent max-width/gutter wrapper used inside every section. */
export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn("mx-auto max-w-content px-6 lg:px-12", className)}>{children}</div>
  );
}
