export const metadata = {
  title: 'Yacht Insurance Broker — Scope & Role',
  description: 'What a yacht insurance broker does, how brokerage differs from carriers, and scope of service — presented factually with clear disclaimers.'
}

export default function BrokerExplainerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Yacht Insurance Broker</h1>
        <p className="text-sm text-muted-foreground">Scope, process, and jurisdiction</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What a Broker Does</h2>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Represents the yacht owner, not a single carrier</li>
            <li>Markets the risk to multiple underwriters; negotiates terms and pricing</li>
            <li>Advises on coverage wording, exclusions, and operational requirements</li>
            <li>Coordinates surveys, valuations, endorsements, and renewals</li>
            <li>Supports claims communication between insured and carrier</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Broker vs Carrier</h2>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Carrier: underwrites risk and pays claims; issues policy</li>
            <li>Broker: independent intermediary; does not underwrite or pay claims</li>
            <li>Benefit: access to multiple markets and negotiated terms</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Disclaimer</h2>
          <p className="text-sm text-muted-foreground">
            This page explains brokerage practices in general. MyYachtsInsurance does not currently offer brokerage services and does not place coverage. For placement or quotes, contact a licensed broker in your jurisdiction.
          </p>
        </section>
      </div>
    </div>
  )
}

