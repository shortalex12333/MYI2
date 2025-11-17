'use client'

import { useState, useMemo } from 'react'
import { CompaniesFilterBar } from './CompaniesFilterBar'
import { CompaniesGrid } from './CompaniesGrid'
import { Company } from '@/types/database.types'

interface CompaniesClientProps {
  companies: Company[]
}

export function CompaniesClient({ companies }: CompaniesClientProps) {
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Filter, search, and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    let result = [...companies]

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((company) => company.type === filterType)
    }

    // Search by name or description
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      result = result.filter(
        (company) =>
          company.name.toLowerCase().includes(search) ||
          company.description?.toLowerCase().includes(search)
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'verified':
          // Verified first
          if (a.verified && !b.verified) return -1
          if (!a.verified && b.verified) return 1
          return a.name.localeCompare(b.name)
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    return result
  }, [companies, filterType, sortBy, searchTerm])

  return (
    <>
      <CompaniesFilterBar
        onFilterChange={setFilterType}
        onSortChange={setSortBy}
        onSearchChange={setSearchTerm}
      />

      <CompaniesGrid companies={filteredAndSortedCompanies} />
    </>
  )
}
