"use client"

import { useRef } from "react"
import { gsap, useGSAP } from "@/lib/gsap"

/**
 * GSAP View Entrance Transition
 * Animates opacity and translateY on mount / view switch.
 * Automatically respects prefers-reduced-motion: no-preference.
 */
export function GSAPViewTransition({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!container.current) return
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          container.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" }
        )
      })
    },
    { scope: container }
  )

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  )
}

/**
 * GSAP Stagger Entrance for Card Grids
 * Staggers children elements with class .gsap-stagger-item
 */
export function GSAPStaggerGroup({
  children,
  className,
  stagger = 0.06,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
}) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!container.current) return
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".gsap-stagger-item", {
          opacity: 0,
          y: 20,
          duration: 0.45,
          stagger,
          ease: "power2.out",
        })
      })
    },
    { scope: container }
  )

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  )
}

