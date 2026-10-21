import type { Story } from '../types/story'

/** Replace copy and add `image` paths on each scene when your visuals are ready. */
export const defaultStory: Story = {
  id: 'lantern-path',
  title: 'The Lantern Path',
  subtitle: 'A quiet walk in five stills',
  scenes: [
    {
      id: 'opening',
      image: '/scenes/01-opening.png',
      generativePreset: 'dawn',
      narration:
        'Before the city wakes, a single lantern remembers the way home.',
      dwellSeconds: 2,
    },
    {
      id: 'edge',
      image: '/scenes/02-edge.png',
      generativePreset: 'forest',
      narration:
        'You step where the pavement ends. Moss holds the footprints of everyone who turned back.',
      dwellSeconds: 2,
    },
    {
      id: 'mirror',
      image: '/scenes/03-mirror.png',
      generativePreset: 'water',
      narration:
        'The path doubles itself in still water. For a moment, you are not walking—you are being walked.',
      dwellSeconds: 2,
    },
    {
      id: 'warmth',
      image: '/scenes/04-warmth.png',
      generativePreset: 'ember',
      narration:
        'Embers breathe in the dark. Each spark is a sentence the night refuses to forget.',
      dwellSeconds: 2,
    },
    {
      id: 'arrival',
      image: '/scenes/05-arrival.png',
      generativePreset: 'void',
      narration:
        'At the last turn, the lantern goes out—not because the light failed, but because you no longer need it.',
      dwellSeconds: 3,
    },
  ],
}
