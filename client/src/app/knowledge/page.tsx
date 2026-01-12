// /client/src/app/knowledge/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface QAEntry {
  id: number;
  question: string;
  answer: string;
  tags: string[];
  confidence: number;
  source_url: string;
  entities: any;
  created_at: string;
}

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<QAEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const allTags = [
    'definitions',
    'coverage',
    'cost',
    'requirements',
    'claims',
    'exclusions',
    'policy_terms',
  ];

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, [searchQuery, selectedTags]);

  async function fetchEntries() {
    setLoading(true);
    try {
      let query = supabase
        .from('qa_entries')
        .select('*')
        .eq('active', true)
        .order('confidence', { ascending: false });

      // Filter by tags if selected
      if (selectedTags.length > 0) {
        // Simple client-side filter since rpc with array operations is complex
        // In production, use raw SQL or proper array operations
        const { data: allEntries } = await query;
        const filtered =
          allEntries?.filter(e =>
            selectedTags.some(tag =>
              e.tags?.includes(tag)
            )
          ) || [];
        setEntries(filtered);
      } else {
        const { data } = await query;
        setEntries(data || []);
      }

      // Client-side search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        setEntries(prev =>
          prev.filter(
            e =>
              e.question.toLowerCase().includes(query) ||
              e.answer.toLowerCase().includes(query)
          )
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const { data, error } = await supabase
        .from('qa_entries')
        .select('id, confidence')
        .eq('active', true);

      if (error || !data) return;

      setStats({
        total: data.length,
        avgConfidence: (
          data.reduce((sum, d) => sum + d.confidence, 0) / data.length
        ).toFixed(2),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Yacht Insurance Knowledge Base
          </h1>
          <p className="text-gray-600 text-lg">
            Find answers to common questions about yacht insurance coverage, policies, and claims.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-gray-600">Answers in our database</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(parseFloat(stats.avgConfidence) * 100)}%
                </div>
                <div className="text-gray-600">Average confidence</div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search questions or answers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Tag filter */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Filter by topic:</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-600'
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 border-2 border-gray-300 hover:bg-gray-100"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No entries found. Try adjusting your search or filters.
            </div>
          ) : (
            entries.map(entry => (
              <div
                key={entry.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">
                    {entry.question}
                  </h3>
                  <div className="ml-4 text-right">
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded">
                      {(entry.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">{entry.answer}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {entry.tags?.map(tag => (
                    <span
                      key={tag}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <a
                    href={entry.source_url}
                    target="_blank"
                    rel="noopener"
                    className="text-blue-600 hover:underline"
                  >
                    View source →
                  </a>
                  <span className="mx-2">•</span>
                  <span>Published {new Date(entry.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer note */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md text-center text-gray-600 text-sm">
          <p>
            This knowledge base is powered by curated content from trusted industry sources.
            <br />
            <span className="text-xs">Always consult with your insurance broker for personalized advice.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
