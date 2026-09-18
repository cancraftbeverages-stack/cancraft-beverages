"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeOnly, fadeUp, scaleUp, staggerContainer } from "@/lib/motion";

type RevealVariant = "fadeUp" | "scaleUp";

const variantMap = { fadeUp, scaleUp };

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Use for a parent wrapping multiple <Reveal stagger> children. */
  as?: "div" | "ul";
  delay?: number;
  /** "fadeUp" (default) for text/content; "scaleUp" for photography/media. */
  variant?: RevealVariant;
};

/** Scroll-triggered fade+rise. Falls back to opacity-only when the user prefers reduced motion. */
export function Reveal({ children, className, as = "div", delay = 0, variant = "fadeUp" }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={prefersReducedMotion ? fadeOnly : variantMap[variant]}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul";
};

/** Wraps a set of Reveal.Item children with a staggered entrance. */
export function RevealGroup({ children, className, as = "div" }: RevealGroupProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
    >
      {children}
    </Component>
  );
}

type RevealItemProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
  /** "fadeUp" (default) for text/content; "scaleUp" for photography/media. */
  variant?: RevealVariant;
};

export function RevealItem({ children, className, as = "div", variant = "fadeUp" }: RevealItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const Component = motion[as];
  return (
    <Component className={className} variants={prefersReducedMotion ? fadeOnly : variantMap[variant]}>
      {children}
    </Component>
  );
}
