'use client'

import { motion } from 'framer-motion'
import { Search, Shield, Briefcase, Building2, Scale, Ship, FileText } from 'lucide-react'
import { useState } from 'react'

interface CompaniesFilterBarProps {
  onFilterChange?: (filter: string) => void
  onSortChange?: (sort: string) => void
  onSearchChange?: (search: string) => void
}

const companyTypes = [
  { id: 'all', label: 'All Providers', icon: Building2 },
  { id: 'insurer', label: 'Insurers', icon: Shield },
  { id: 'broker', label: 'Brokers', icon: Briefcase },
  { id: 'provider', label: 'Service Providers', icon: Ship },
]

export function CompaniesFilterBar({
  onFilterChange,
  onSortChange,
  onSearchChange,
}: CompaniesFilterBarProps) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeSort, setActiveSort] = useState('name')
  const [searchTerm, setSearchTerm] = useState('')

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId)
    onFilterChange?.(filterId)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value
    setActiveSort(newSort)
    onSortChange?.(newSort)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value
    setSearchTerm(newSearch)
    onSearchChange?.(newSearch)
  }

  return (
    <section className="border-y border-brand-blue/10 bg-white-light/30  sticky top-0 z-40">
      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-6"
        >
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-900/40" />
            <input
              type="text"
              placeholder="Find a provider..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100  border border-gray-200 text-gray-900 placeholder:text-gray-900/40 focus:outline-none focus:border-brand-blue/50 transition-all"
            />
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Filter Pills */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex flex-wrap items-center gap-2"
          >
            {companyTypes.map((type) => {
              const isActive = activeFilter === type.id
              return (
                <button
                  key={type.id}
                  onClick={() => handleFilterClick(type.id)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-brand-blue'
                      : 'text-gray-900/70 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterBg"
                      className="absolute inset-0 bg-brand-blue/20 border border-brand-blue/50 rounded-full"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.2 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </span>
                </button>
              )
            })}
          </motion.div>

          {/* Sort Dropdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <span className="text-sm text-gray-900/60">Sort by:</span>
            <select
              value={activeSort}
              onChange={handleSortChange}
              className="px-4 py-2 rounded-full bg-gray-100  border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-brand-blue/50 transition-all cursor-pointer"
            >
              <option value="name">Name</option>
              <option value="verified">Verified First</option>
              <option value="newest">Newest</option>
            </select>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
