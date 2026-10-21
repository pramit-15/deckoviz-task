/** Server-side, no-key MP3 narration for Vercel deployments. */
export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const rawText = request.query.text
  const text = typeof rawText === 'string' ? rawText.trim() : ''
  const rawLanguage = request.query.lang
  const language =
    typeof rawLanguage === 'string' && /^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(rawLanguage)
      ? rawLanguage
      : 'en-US'

  if (!text) return response.status(400).json({ error: 'Narration text is required.' })
  if (text.length > 500) {
    return response.status(413).json({ error: 'Narration must be 500 characters or fewer.' })
  }

  try {
    const source = new URL('https://translate.googleapis.com/translate_tts')
    source.searchParams.set('ie', 'UTF-8')
    source.searchParams.set('client', 'tw-ob')
    source.searchParams.set('tl', language)
    source.searchParams.set('q', text)
    const upstream = await fetch(source, {
      headers: { 'User-Agent': 'Deckoviz-narrated-art/1.0' },
    })
    if (!upstream.ok) throw new Error(`TTS upstream returned ${upstream.status}`)

    const audio = Buffer.from(await upstream.arrayBuffer())
    response.setHeader('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg')
    response.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')
    return response.status(200).send(audio)
  } catch (error) {
    console.error('TTS request failed:', error)
    return response.status(502).json({ error: 'Narration service is temporarily unavailable.' })
  }
}
