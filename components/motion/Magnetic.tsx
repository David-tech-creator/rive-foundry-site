"use client"

import "./motion.css"
import { useEffect, useRef, type ReactNode } from "react"

export type MagneticProps = {
  children: ReactNode
  /** 0..1, how far the content follows the pointer. Default 0.3. */
  strength?: number
  /** extra px around the element where the pull starts. Default 24. */
  reach?: number
  className?: string
}

/**
 * Wraps a link or button so it leans toward the pointer and springs back on
 * leave. Inert on touch devices and with prefers-reduced-motion.
 */
export function Magnetic({ children, strength = 0.3, reach = 24, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine || reduced) return

    let tx = 0
    let ty = 0
    let x = 0
    let y = 0
    let raf = 0
    let last = 0

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016)
      last = now
      const k = 1 - Math.exp(-dt * 12)
      x += (tx - x) * k
      y += (ty - y) * k
      el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`
      if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) raf = requestAnimationFrame(frame)
      else raf = 0
    }
    const kick = () => {
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      // measure without the current offset so the target does not chase itself
      const r = el.getBoundingClientRect()
      const cx = r.left - x + r.width / 2
      const cy = r.top - y + r.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const inside = Math.abs(dx) < r.width / 2 + reach && Math.abs(dy) < r.height / 2 + reach
      if (inside) {
        tx = dx * strength
        ty = dy * strength
      } else if (tx !== 0 || ty !== 0) {
        tx = 0
        ty = 0
      } else return
      kick()
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onMove)
      el.style.transform = ""
    }
  }, [strength, reach])

  return (
    <span ref={ref} className={className ? `mg-wrap ${className}` : "mg-wrap"}>
      {children}
    </span>
  )
}
