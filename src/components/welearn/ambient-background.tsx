"use client"

import { useEffect, useRef } from "react"

/**
 * AmbientBackground — the always-on abstract atmosphere.
 *
 * A canvas constellation of drifting nodes linked by hairlines, tinted from the
 * live theme palette, plus three CSS aurora blobs and a notebook dot grid.
 *
 * Behaviour contract:
 * - pauses while the tab is hidden and on unmount (no orphan rAF work);
 * - renders a single static frame when prefers-reduced-motion is set, and
 *   repaints that frame whenever the palette changes;
 * - follows runtime reduced-motion changes, not just the initial media query.
 */
export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const cv = canvas

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reduced = motionQuery.matches
    let raf = 0
    let visible = !document.hidden
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

    let accent = "#3794ff"
    let accent2 = "#c586c0"
    let accent3 = "#89d185"

    function readPalette() {
      const styles = getComputedStyle(document.documentElement)
      const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback
      accent = read("--primary", "#3794ff")
      accent2 = read("--chart-5", "#c586c0")
      accent3 = read("--chart-2", "#89d185")
    }

    function resize() {
      W = window.innerWidth
      H = window.innerHeight
      cv.width = Math.max(1, Math.round(W * DPR))
      cv.height = Math.max(1, Math.round(H * DPR))
      cv.style.width = `${W}px`
      cv.style.height = `${H}px`
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0)
      // denser on big screens, sparse and quiet on phones
      const target = Math.min(56, Math.max(20, Math.round((W * H) / 32000)))
      nodes = Array.from({ length: target }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: 0.8 + Math.random() * 2.1,
      }))
    }

    function paint(phase: number) {
      ctx!.clearRect(0, 0, W, H)

      // constellation links
      ctx!.lineWidth = 1
      ctx!.strokeStyle = accent
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < 150) {
            ctx!.globalAlpha = (1 - dist / 150) * 0.15
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.stroke()
          }
        }
      }

      // nodes, gently breathing
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const pulse = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(phase + i * 1.7)
        ctx!.globalAlpha = 0.22 + pulse * 0.28
        ctx!.fillStyle = i % 7 === 0 ? accent2 : i % 5 === 0 ? accent3 : accent
        ctx!.beginPath()
        ctx!.arc(n.x, n.y, n.r + pulse * 0.7, 0, Math.PI * 2)
        ctx!.fill()
      }
      ctx!.globalAlpha = 1
    }

    function step() {
      const phase = (Date.now() / 1400) % (Math.PI * 2)
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < -20) n.x = W + 20
        if (n.x > W + 20) n.x = -20
        if (n.y < -20) n.y = H + 20
        if (n.y > H + 20) n.y = -20
      }
      paint(phase)
      if (!reduced && visible) raf = requestAnimationFrame(step)
    }

    function restart() {
      cancelAnimationFrame(raf)
      readPalette()
      if (reduced) {
        paint(0)
        return
      }
      visible = !document.hidden
      if (visible) raf = requestAnimationFrame(step)
    }

    function onResize() {
      resize()
      restart()
    }
    function onVisibility() {
      if (document.hidden) {
        visible = false
        cancelAnimationFrame(raf)
      } else {
        restart()
      }
    }
    function onMotionChange(event: MediaQueryListEvent) {
      reduced = event.matches
      restart()
    }

    // palette switches must repaint the frozen frame too
    const observer = new MutationObserver(() => {
      readPalette()
      if (reduced) paint(0)
    })

    resize()
    restart()
    window.addEventListener("resize", onResize)
    document.addEventListener("visibilitychange", onVisibility)
    motionQuery.addEventListener("change", onMotionChange)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    })

    return () => {
      visible = false
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVisibility)
      motionQuery.removeEventListener("change", onMotionChange)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 -z-[1] pointer-events-none opacity-60" aria-hidden />
      <div className="aurora-blob b1 h-[26rem] w-[26rem] -top-24 -left-20" style={{ background: "var(--primary)" }} aria-hidden />
      <div className="aurora-blob b2 h-[22rem] w-[22rem] top-1/3 -right-24" style={{ background: "var(--chart-2)" }} aria-hidden />
      <div className="aurora-blob b3 h-[24rem] w-[24rem] bottom-0 left-1/3" style={{ background: "var(--chart-5)" }} aria-hidden />
      <div className="aurora-bg" aria-hidden />
    </>
  )
}
