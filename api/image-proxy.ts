interface VercelRequest {
  query: Record<string, string | string[] | undefined>
}

interface VercelResponse {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => void
  send: (body: Buffer | string) => void
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const rawUrl = req.query.url
  const imageUrl = Array.isArray(rawUrl) ? rawUrl[0] : rawUrl

  if (!imageUrl) {
    res.status(400).send('Missing url parameter')
    return
  }

  try {
    const parsed = new URL(imageUrl)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      res.status(400).send('Invalid url parameter')
      return
    }

    const response = await fetch(parsed.toString())
    if (!response.ok) {
      res.status(response.status).send(`Failed to fetch image (${response.status})`)
      return
    }

    const contentType = response.headers.get('content-type')
    if (contentType) {
      res.setHeader('Content-Type', contentType)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    res.status(200).send(buffer)
  } catch {
    res.status(502).send('Image proxy failed')
  }
}
