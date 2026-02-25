import Link from 'next/link'

export const metadata = {
  title: 'Alex Short — Maritime Risk & Insurance Analyst',
  description: 'Independent analyst focused on marine risk frameworks, retrieval-based validation, and structured insurance methodologies.'
}

export default function AlexShortPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Alex Short</h1>
        <p className="text-muted-foreground mt-1">Maritime Risk & Insurance Analyst</p>

        <div className="mt-6 space-y-4 text-sm leading-6">
          <p>
            Alex focuses on building structured methodologies for marine insurance — aligning valuation models, evidence handling, and retrieval‑based fact validation so that complex policy questions can be answered consistently.
          </p>
          <p>
            His work emphasizes neutral, framework‑first analysis: methodologies before opinions, citations before claims, and clarity over decoration.
          </p>
        </div>

        <div className="mt-6 flex gap-4 text-sm">
          <Link href="/methodology" className="text-primary hover:underline">Research methodology</Link>
          <a href="https://alex-short.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">alex-short.com</a>
        </div>
      </div>
    </div>
  )
}

