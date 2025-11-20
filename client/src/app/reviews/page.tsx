export default function ReviewsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-semibold mb-4">Provider Reviews</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Read honest reviews from yacht owners about their insurance experiences
        </p>
        <div className="border-2 border-dashed rounded-lg p-12">
          <p className="text-muted-foreground">
            Our provider review system is under development. Soon you'll be able to:
          </p>
          <ul className="list-disc list-inside mt-4 text-muted-foreground space-y-2">
            <li>Read verified reviews from yacht owners</li>
            <li>See ratings for insurers, brokers, and service providers</li>
            <li>Filter by provider type, coverage area, and yacht size</li>
            <li>Share your own experiences</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
