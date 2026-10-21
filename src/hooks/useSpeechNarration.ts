import { useCallback, useEffect, useRef, useState } from 'react'

type Options = {
  enabled: boolean
  rate?: number
  pitch?: number
}

function pickEnglishVoice(): SpeechSynthesisVoice | undefined {
  return window.speechSynthesis
    .getVoices()
    .find((voice) => voice.lang.toLowerCase().startsWith('en'))
}

/**
 * Uses the Vercel narration API first. Browser speech is a graceful fallback
 * for local Vite development or a temporary upstream outage.
 */
export function useSpeechNarration({ enabled, rate = 0.92, pitch = 1 }: Options) {
  const [speaking, setSpeaking] = useState(false)
  const [supported] = useState(() => typeof window !== 'undefined' && 'Audio' in window)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const runRef = useRef(0)

  const cancel = useCallback(() => {
    runRef.current += 1
    controllerRef.current?.abort()
    controllerRef.current = null
    audioRef.current?.pause()
    audioRef.current = null
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
  }, [])

  const speakWithBrowserFallback = useCallback(
    (text: string, run: number) =>
      new Promise<void>((resolve) => {
        if (!('speechSynthesis' in window)) return resolve()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = rate
        utterance.pitch = pitch
        const voice = pickEnglishVoice()
        if (voice) utterance.voice = voice
        const finish = () => {
          if (run === runRef.current) setSpeaking(false)
          resolve()
        }
        utterance.onend = finish
        utterance.onerror = finish
        window.speechSynthesis.speak(utterance)
      }),
    [pitch, rate],
  )

  const speak = useCallback(
    async (text: string): Promise<void> => {
      cancel()
      if (!enabled || !text.trim()) return

      const run = ++runRef.current
      const controller = new AbortController()
      controllerRef.current = controller
      setSpeaking(true)

      try {
        const params = new URLSearchParams({ text, lang: 'en-US' })
        const result = await fetch(`/api/tts?${params}`, { signal: controller.signal })
        if (!result.ok) throw new Error(`Narration endpoint returned ${result.status}`)
        const blob = await result.blob()
        if (!blob.size) throw new Error('Narration endpoint returned empty audio')
        if (run !== runRef.current) return

        const objectUrl = URL.createObjectURL(blob)
        objectUrlRef.current = objectUrl
        const audio = new Audio(objectUrl)
        audioRef.current = audio
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve()
          audio.onpause = () => resolve()
          audio.onerror = () => reject(new Error('Audio playback failed'))
          void audio.play().catch(reject)
        })
      } catch (error) {
        if (controller.signal.aborted || run !== runRef.current) return
        console.warn('Server narration unavailable; using browser fallback.', error)
        await speakWithBrowserFallback(text, run)
      } finally {
        if (run === runRef.current) {
          controllerRef.current = null
          audioRef.current = null
          if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
          objectUrlRef.current = null
          setSpeaking(false)
        }
      }
    },
    [cancel, enabled, speakWithBrowserFallback],
  )

  useEffect(() => () => cancel(), [cancel])

  return { speak, cancel, speaking, supported }
}
