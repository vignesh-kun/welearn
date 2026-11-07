"use client"

import { useEffect, useRef } from "react"

/**
 * AmbientBackground — the always-on abstract animation layer.
 * Canvas constellation: drifting nodes linked by lines, tinted with the live
 * theme palette via CSS variables. Plus three CSS aurora blobs.
 * Runs continuously; pauses when the tab is hidden; respects reduced-motion.
 */
export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const cv = canvas

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let raf = 0
    let running = true
    let W = 0
    let H = 0
    const DPR = Math.min(window.devicePixelRatio || 1, 2)

    interface Node {
      x: number
      y: number
      vx: number
      vy: number
      r: number
    }
    let nodes: Node[] = []

    function cssVar(name: string, fallback: string): string {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
    }

    function resize() {
      W = window.innerWidth
      H = window.innerHeight
      cv.width = W * DPR
      cv.height = H * DPR
      cv.style.width = `${W}px`
      cv.style.height = `${H}px`
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0)
      const target = Math.min(72, Math.max(28, Math.round((W * H) / 26000)))
      nodes = Array.from({ length: target }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1 + Math.random() * 2.2,
      }))
    }

    function frame() {
      if (!running) return
      const accent = cssVar("--primary", "#3794ff")
      const accent2 = cssVar("--chart-5", "#c586c0")
      ctx!.clearRect(0, 0, W, H)

      // drift
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < -20) n.x = W + 20
        if (n.x > W + 20) n.x = -20
        if (n.y < -20) n.y = H + 20
        if (n.y > H + 20) n.y = -20
      }

      // links
      ctx!.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.16
            ctx!.strokeStyle = accent
            ctx!.globalAlpha = alpha
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.stroke()
          }
        }
      }

      // nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const pulse = 0.5 + 0.5 * Math.sin((Date.now() / 900 + i * 1.7) % (Math.PI * 2))
        ctx!.globalAlpha = 0.25 + pulse * 0.3
        ctx!.fillStyle = i % 5 === 0 ? accent2 : accent
        ctx!.beginPath()
        ctx!.arc(n.x, n.y, n.r + pulse * 0.8, 0, Math.PI * 2)
        ctx!.fill()
      }
      ctx!.globalAlpha = 1

      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener("resize", resize)
    if (!reduced) raf = requestAnimationFrame(frame)

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else {
        running = true
        if (!reduced) raf = requestAnimationFrame(frame)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 -z-[1] pointer-events-none opacity-70" aria-hidden />
      <div className="aurora-blob b1 h-[26rem] w-[26rem] -top-24 -left-20" style={{ background: "var(--primary)" }} aria-hidden />
      <div className="aurora-blob b2 h-[22rem] w-[22rem] top-1/3 -right-24" style={{ background: "var(--chart-2)" }} aria-hidden />
      <div className="aurora-blob b3 h-[24rem] w-[24rem] bottom-0 left-1/3" style={{ background: "var(--chart-5)" }} aria-hidden />
      <div className="aurora-bg" aria-hidden />
    </>
  )
}
