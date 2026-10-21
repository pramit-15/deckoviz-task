import { useCallback, useEffect, useState } from 'react'
import { defaultStory } from '../data/defaultStory'
import type { Story } from '../types/story'
import { useSpeechNarration } from '../hooks/useSpeechNarration'
import { GenerativeScene } from './GenerativeScene'
import './StoryExperience.css'

type Props = {
  story?: Story
}

export function StoryExperience({ story = defaultStory }: Props) {
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [voiceOn, setVoiceOn] = useState(true)
  const [autoPlay, setAutoPlay] = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const { speak, cancel, speaking, supported } = useSpeechNarration({
    enabled: voiceOn,
  })

  const scene = story.scenes[index]
  const isLast = index >= story.scenes.length - 1
  const showPhoto = Boolean(scene.image) && !imageFailed

  useEffect(() => {
    setImageFailed(false)
  }, [scene.id, scene.image])

  useEffect(() => {
    if (!started) return
    const next = story.scenes[index + 1]?.image
    if (next) {
      const img = new Image()
      img.src = next
    }
  }, [started, index, story.scenes])

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= story.scenes.length || transitioning) return
      setTransitioning(true)
      cancel()
      window.setTimeout(() => {
        setIndex(next)
        setTransitioning(false)
      }, 480)
    },
    [cancel, story.scenes.length, transitioning],
  )

  const advance = useCallback(() => {
    if (!isLast) goTo(index + 1)
  }, [goTo, index, isLast])

  useEffect(() => {
    if (!started || transitioning) return

    let cancelled = false
    const run = async () => {
      const dwell = (scene.dwellSeconds ?? 2) * 1000
      await speak(scene.narration)
      if (cancelled) return
      if (autoPlay && !isLast) {
        await new Promise((r) => window.setTimeout(r, dwell))
        if (!cancelled) goTo(index + 1)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [
    started,
    index,
    scene.narration,
    scene.dwellSeconds,
    autoPlay,
    isLast,
    speak,
    goTo,
    transitioning,
  ])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started) return
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        advance()
      }
      if (e.key === 'ArrowLeft') goTo(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, goTo, index, started])

  if (!started) {
    return (
      <div className="story story--intro">
        <div className="story__intro-inner">
          <p className="story__eyebrow">Narrated stills</p>
          <h1 className="story__title">{story.title}</h1>
          {story.subtitle ? (
            <p className="story__subtitle">{story.subtitle}</p>
          ) : null}
          <p className="story__hint">
            {story.scenes.length} illustrated scenes with spoken narration. Use
            headphones for the best experience. Each still has a narrated
            soundtrack generated on the server.
          </p>
          <button
            type="button"
            className="story__cta"
            onClick={() => setStarted(true)}
          >
            Begin experience
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="story">
      <header className="story__chrome">
        <span className="story__chrome-title">
          {story.title}{' '}
          <span className="story__chrome-meta">
            {index + 1} / {story.scenes.length}
          </span>
        </span>
        <div className="story__chrome-actions">
          {supported ? (
            <button
              type="button"
              className="story__pill"
              aria-pressed={voiceOn}
              onClick={() => {
                if (voiceOn) cancel()
                setVoiceOn((v) => !v)
              }}
            >
              Voice {voiceOn ? 'on' : 'off'}
            </button>
          ) : null}
          <button
            type="button"
            className="story__pill"
            aria-pressed={autoPlay}
            onClick={() => setAutoPlay((a) => !a)}
          >
            Auto {autoPlay ? 'on' : 'off'}
          </button>
        </div>
      </header>

      <figure
        className={`story__frame ${transitioning ? 'story__frame--out' : 'story__frame--in'}`}
      >
        <div className="story__visual">
          {showPhoto ? (
            <img
              src={scene.image}
              alt={scene.caption ?? scene.narration}
              className="story__photo"
              draggable={false}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <GenerativeScene
              preset={scene.generativePreset ?? 'void'}
              seed={scene.id}
              className="story__canvas"
            />
          )}
        </div>
        {scene.caption ? (
          <figcaption className="story__caption">{scene.caption}</figcaption>
        ) : null}
      </figure>

      <div
        className={`story__narration ${speaking ? 'story__narration--live' : ''}`}
        aria-live="polite"
      >
        <p key={scene.id} className="story__narration-text">
          {scene.narration}
        </p>
      </div>

      <nav className="story__nav" aria-label="Story progress">
        <button
          type="button"
          className="story__nav-btn"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
        >
          Previous
        </button>
        <ol className="story__dots">
          {story.scenes.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={`story__dot ${i === index ? 'story__dot--active' : ''}`}
                aria-label={`Scene ${i + 1}`}
                aria-current={i === index ? 'step' : undefined}
                onClick={() => goTo(i)}
              />
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="story__nav-btn"
          disabled={isLast}
          onClick={advance}
        >
          {isLast ? 'End' : 'Next'}
        </button>
      </nav>

      {isLast ? (
        <div className="story__end">
          <p className="story__end-note">You reached the final still.</p>
          <button
            type="button"
            className="story__cta story__cta--compact"
            onClick={() => {
              cancel()
              setIndex(0)
            }}
          >
            Experience again
          </button>
        </div>
      ) : null}
    </div>
  )
}
