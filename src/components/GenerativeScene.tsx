import { useEffect, useRef } from 'react'
import type { GenerativePreset } from '../types/story'

type Props = {
  preset: GenerativePreset
  seed: string
  className?: string
}

const PALETTES: Record<
  GenerativePreset,
  { bg: [string, string, string]; accent: string; mood: number }
> = {
  dawn: {
    bg: ['#1a1028', '#4a2c5a', '#f4a261'],
    accent: '#ffe8d6',
    mood: 0.35,
  },
  forest: {
    bg: ['#0d1f12', '#1e4d32', '#7cb342'],
    accent: '#c5e1a5',
    mood: 0.55,
  },
  water: {
    bg: ['#0a1628', '#1a3a5c', '#4fc3f7'],
    accent: '#b3e5fc',
    mood: 0.45,
  },
  ember: {
    bg: ['#1a0a0a', '#4a1515', '#ff6f00'],
    accent: '#ffcc80',
    mood: 0.65,
  },
  void: {
    bg: ['#050508', '#12121a', '#3d3d5c'],
    accent: '#e8e8f0',
    mood: 0.25,
  },
}

function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function GenerativeScene({ preset, seed, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const rand = mulberry32(hashSeed(`${preset}-${seed}`))
    const { bg, accent, mood } = PALETTES[preset]

    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, bg[0])
    grad.addColorStop(0.55, bg[1])
    grad.addColorStop(1, bg[2])
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    const blobCount = 12 + Math.floor(rand() * 18)
    for (let i = 0; i < blobCount; i++) {
      const x = rand() * w
      const y = rand() * h
      const r = (0.08 + rand() * 0.22) * Math.min(w, h)
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, accent + '55')
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalCompositeOperation = 'screen'
    const lineCount = 40 + Math.floor(mood * 80)
    for (let i = 0; i < lineCount; i++) {
      ctx.strokeStyle = accent + (rand() > 0.5 ? '22' : '44')
      ctx.lineWidth = 0.5 + rand() * 2
      ctx.beginPath()
      let x = rand() * w
      let y = rand() * h
      ctx.moveTo(x, y)
      const steps = 8 + Math.floor(rand() * 24)
      for (let s = 0; s < steps; s++) {
        x += (rand() - 0.5) * w * 0.08
        y += (rand() - 0.5) * h * 0.08
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'

    const grain = 0.04
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const d = imgData.data
    for (let i = 0; i < d.length; i += 4) {
      const n = (rand() - 0.5) * 255 * grain
      d[i] = Math.min(255, Math.max(0, d[i] + n))
      d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n))
      d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n))
    }
    ctx.putImageData(imgData, 0, 0)
  }, [preset, seed])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      role="presentation"
    />
  )
}
