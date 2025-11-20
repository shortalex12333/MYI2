'use client'

import { CategoryCard } from './CategoryCard'

interface CategoryGridProps {
  categories: Array<{
    id: string
    name: string
    slug: string
    description?: string
    icon?: string
    posts?: Array<{ count: number }>
  }>
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-16 md:py-24 bg-white relative">
      {/* Subtle Background Pattern */}
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
        {/* Grid Layout */}
        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
