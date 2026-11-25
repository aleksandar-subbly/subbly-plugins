# Shared integration code

Write these two files exactly as shown. Change only the import alias (`@/lib/...`) to match the project. Every Web3Forms form imports from them.

## Why it is split this way

- The key is a secret plugin field, so it reaches only server code as `PLUGIN_SUBBLY_WEB3FORMS__WEB3FORMS_ACCESS_KEY`. A server component reads it and passes it to the client form as a prop. The key never appears in source files or git.
- Web3Forms accepts submissions only from the visitor's browser on its free plan, and its docs call the access key safe to use client-side. So the browser posts straight to `https://api.web3forms.com/submit`, and the key travels in the rendered page and the request body. That is the documented design. A proxy would get a 403 response.
- Visitors only ever see friendly messages. The browser console gets the HTTP status and Web3Forms' message for debugging. It never gets the key or the payload.

## lib/web3forms.ts

```ts
// Server-only: call from a server component and pass the result to a form as `accessKey`.
export function getWeb3FormsAccessKey(): string | null {
  const key = process.env.PLUGIN_SUBBLY_WEB3FORMS__WEB3FORMS_ACCESS_KEY?.trim()
  return key ? key : null
}
```

## components/web3forms/use-web3forms.tsx

```tsx
'use client'

import { useRef, useState, type FormEvent } from 'react'

const ENDPOINT = 'https://api.web3forms.com/submit'

export type Web3FormsStatus = 'idle' | 'submitting' | 'success' | 'error'

type Options = {
  accessKey: string | null
  /** Email subject when the form has no visitor-typed `subject` field. */
  subject?: string
  /** Sender name shown in the inbox, usually the site name. */
  fromName?: string
  successMessage?: string
}

const MESSAGES = {
  unavailable: 'This form is temporarily unavailable. Please try again later or contact us another way.',
  failed: 'Sorry, your message could not be sent. Please try again.',
  rateLimited: 'Too many messages were sent from your connection. Please try again in an hour.',
  network: 'We could not reach the server. Check your internet connection and try again.',
}

export function useWeb3Forms({
  accessKey,
  subject,
  fromName,
  successMessage = 'Thank you! Your message has been sent.',
}: Options) {
  const [status, setStatus] = useState<Web3FormsStatus>('idle')
  const [message, setMessage] = useState('')
  const inFlight = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    const form = event.currentTarget

    if (!form.reportValidity()) return

    if (!accessKey) {
      console.error('[web3forms] Access key is not configured (Web3Forms plugin settings).')
      setStatus('error')
      setMessage(MESSAGES.unavailable)
      return
    }

    const data = new FormData(form)

    // Honeypot ticked: a bot. Pretend success and send nothing.
    if (data.get('botcheck')) {
      form.reset()
      setStatus('success')
      setMessage(successMessage)
      return
    }

    const payload: Record<string, string> = {}
    data.forEach((value, key) => {
      if (typeof value !== 'string') return
      payload[key] = key in payload ? `${payload[key]}, ${value}` : value
    })
    payload.access_key = accessKey
    if (subject && !payload.subject) payload.subject = subject
    if (fromName) payload.from_name = fromName

    inFlight.current = true
    setStatus('submitting')
    setMessage('')

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => null)

      if (response.ok && result?.success) {
        form.reset()
        setStatus('success')
        setMessage(successMessage)
        return
      }

      console.warn('[web3forms] Submission rejected', response.status, result?.message ?? result?.body?.message ?? '')
      setStatus('error')
      setMessage(response.status === 429 ? MESSAGES.rateLimited : MESSAGES.failed)
    } catch {
      console.warn('[web3forms] Network error while submitting')
      setStatus('error')
      setMessage(MESSAGES.network)
    } finally {
      inFlight.current = false
    }
  }

  return { status, message, isSubmitting: status === 'submitting', handleSubmit }
}

/** Web3Forms honeypot. Hidden from all users and assistive tech; bots that tick it are dropped. */
export function Web3FormsHoneypot() {
  return (
    <input
      type="checkbox"
      name="botcheck"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      style={{ display: 'none' }}
    />
  )
}
```
