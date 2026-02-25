export const metadata = {
  title: 'Research Methodology — Marine Risk Framework',
  description: 'How evidence is retrieved, how citations are validated, and how structured frameworks govern long‑form marine insurance papers.'
}

export default function MethodologyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Research Methodology</h1>
        <p className="text-muted-foreground">
          This methodology describes how long‑form papers are structured, how citations are validated, and how frameworks are selected for marine insurance topics.
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Paper Structure</h2>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Problem statement → operating definitions → scope boundaries</li>
            <li>Evidence sections grouped by source type (carrier docs, law, regulator)</li>
            <li>Quantitative thresholds and timeframes highlighted for decisions</li>
            <li>Clear distinctions between fact, interpretation, and practice</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Citation Validation</h2>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Primary sources preferred: policy docs, law, regulator bulletins</li>
            <li>Secondary sources used only for context; never as sole authority</li>
            <li>Every assertion traceable to a URL or document excerpt</li>
            <li>No dead links; archived copies mirrored where allowed</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Framework Selection</h2>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Choose the minimal framework that separates decisions cleanly</li>
            <li>Favor stable definitions and low‑ambiguity thresholds</li>
            <li>Surface trade‑offs explicitly; avoid editorial conclusions</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Attribution</h2>
          <p className="text-sm text-muted-foreground">
            Research methodology developed by Alex Short. Long‑form papers may note “Technical review by Alex Short.” Surface Q&A remains anonymous.
          </p>
        </section>
      </div>
    </div>
  )
}

