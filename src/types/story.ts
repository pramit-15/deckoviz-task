/** Visual fallback when no custom image is provided yet. */
export type GenerativePreset =
  | 'dawn'
  | 'forest'
  | 'water'
  | 'ember'
  | 'void'

export type StoryScene = {
  id: string
  /** Optional caption under the frame */
  caption?: string
  /** Spoken and displayed narration for this beat */
  narration: string
  /** Path under public/ e.g. `/scenes/01.webp` — add when you have art */
  image?: string
  generativePreset?: GenerativePreset
  /** Seconds to show after narration finishes (or min dwell if voice off) */
  dwellSeconds?: number
}

export type Story = {
  id: string
  title: string
  subtitle?: string
  scenes: StoryScene[]
}
