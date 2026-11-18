"use client"

import "./motion.css"
import { useEffect, useRef, useState } from "react"

const POOL = 48

/**
 * A short, soft particle trail behind the normal pointer, on a 2D canvas. The
 * pointer itself stays the system one, so it keeps its usual shapes over links
 * and text. Not rendered on touch devices or with prefers-reduced-motion.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)")
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setEnabled(fine.matches && !reduced.matches)
    update()
    fine.addEventListener("change", update)
    reduced.addEventListener("change", update)
    return () => {
      fine.removeEventListener("change", update)
      reduced.removeEventListener("change", update)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // particle pool, preallocated
    const px = new Float32Array(POOL)
    const py = new Float32Array(POOL)
    const vx = new Float32Array(POOL)
    const vy = new Float32Array(POOL)
    const life = new Float32Array(POOL)
    const size = new Float32Array(POOL)
    const azure = new Uint8Array(POOL)
    let head = 0

    let w = 0
    let h = 0
    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    let lastX = -100
    let lastY = -100
    let visible = false
    let raf = 0
    let alive = 0
    let last = performance.now()

    const spawn = (sx: number, sy: number, speedX: number, speedY: number) => {
      const i = head
      head = (head + 1) % POOL
      px[i] = sx
      py[i] = sy
      vx[i] = speedX * 0.04 + (Math.random() - 0.5) * 18
      vy[i] = speedY * 0.04 + (Math.random() - 0.5) * 18
      life[i] = 1
      size[i] = 0.8 + Math.random() * 1.6
      azure[i] = Math.random() < 0.3 ? 1 : 0
    }

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = "lighter"
      alive = 0
      for (let i = 0; i < POOL; i++) {
        if (life[i] <= 0) continue
        life[i] -= dt * 1.9
        if (life[i] <= 0) continue
        alive++
        vx[i] *= 0.94
        vy[i] *= 0.94
        px[i] += vx[i] * dt
        py[i] += vy[i] * dt
        ctx.globalAlpha = life[i] * life[i] * 0.55
        ctx.fillStyle = azure[i] ? "#4DA3FF" : "#EDEDEF"
        ctx.beginPath()
        ctx.arc(px[i], py[i], size[i] * (0.6 + life[i] * 0.6), 0, Math.PI * 2)
        ctx.fill()
      }
      if (alive > 0) raf = requestAnimationFrame(frame)
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
      const tx = e.clientX
      const ty = e.clientY
      if (!visible) {
        visible = true
        lastX = tx
        lastY = ty
      }
      const dx = tx - lastX
      const dy = ty - lastY
      const dist = Math.hypot(dx, dy)
      if (dist > 7) {
        const n = Math.min(3, Math.floor(dist / 7))
        for (let k = 0; k < n; k++) {
          const f = (k + 1) / n
          spawn(lastX + dx * f, lastY + dy * f, dx * 60, dy * 60)
        }
        lastX = tx
        lastY = ty
      }
      kick()
    }
    const onLeave = () => {
      visible = false
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)
    window.addEventListener("resize", resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onMove)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      window.removeEventListener("resize", resize)
    }
  }, [enabled])

  if (!enabled) return null
  return (
<canvas ref={canvasRef} className="cur-trail" aria-hidden="true" />
  )
}
