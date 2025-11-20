import { createClient } from '@/lib/supabase/server'
import { FAQHero } from '@/components/faq/FAQHero'
import { FAQAccordion } from '@/components/faq/FAQAccordion'
import { FAQCTA } from '@/components/faq/FAQCTA'
import { GradientText } from '@/components/ui/gradient-text'

export default async function FAQPage() {
  const supabase = await createClient()

  // @ts-ignore - Supabase type inference issue
  const { data: faqs } = await supabase
    .from('faqs')
    .select(`
      *,
      category:categories(*)
    `)
    .order('display_order', { ascending: true })

  // Group FAQs by category
  const faqsByCategory = faqs?.reduce((acc: any, faq) => {
    const categoryName = faq.category?.name || 'General'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(faq)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Premium Hero Header */}
      <FAQHero />

      {/* FAQ Content */}
      <section className="py-16 md:py-24 bg-white relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {!faqs || faqs.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block p-12 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <p className="text-lg text-gray-900/70 mb-2">
                    No FAQs available yet.
                  </p>
                  <p className="text-sm text-gray-900/50">
                    Check back soon or ask the community!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {faqsByCategory && Object.entries(faqsByCategory).map(([category, categoryFaqs]: [string, any], idx) => (
                  <div key={category}>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6">
                      <GradientText>{category}</GradientText>
                    </h2>
                    <FAQAccordion faqs={categoryFaqs} index={idx} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <FAQCTA />
    </div>
  )
}
