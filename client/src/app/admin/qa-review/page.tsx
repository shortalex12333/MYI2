// /client/src/app/admin/qa-review/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface QACandidate {
  id: number;
  source_url: string;
  question: string;
  answer: string;
  tags: string[];
  confidence: number;
  quality_flags: string[];
  extraction_method: string;
  review_status: string;
  entities: any;
  created_at: string;
}

export default function QAReviewPage() {
  const [candidates, setCandidates] = useState<QACandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [stats, setStats] = useState<any>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (apiKey) {
      fetchCandidates();
      fetchStats();
    }
  }, [apiKey, filter]);

  async function fetchCandidates() {
    setLoading(true);
    try {
      let query = supabase
        .from('qa_candidates')
        .select('*')
        .order('confidence', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('review_status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching candidates:', error);
        return;
      }

      setCandidates(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const { data } = await supabase
        .rpc('get_qa_stats')
        .single()
        .catch(() => {
          // Fallback: direct query
          return supabase
            .from('qa_candidates')
            .select('review_status');
        });

      if (data) {
        const stats = {
          pending: data.filter((d: any) => d.review_status === 'pending').length,
          approved: data.filter((d: any) => d.review_status === 'approved').length,
          rejected: data.filter((d: any) => d.review_status === 'rejected').length,
          total: data.length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function handleReview(
    candidateId: number,
    action: 'approve' | 'reject',
    reason?: string
  ) {
    try {
      const response = await fetch('/api/v1/scraper/review', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          action,
          reason,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Error: ${result.error}`);
        return;
      }

      alert(`${action.toUpperCase()}: ${result.message}`);
      fetchCandidates();
      fetchStats();
      setSelectedId(null);
    } catch (error) {
      alert(`Error: ${String(error)}`);
    }
  }

  const selected = selectedId ? candidates.find(c => c.id === selectedId) : null;

  if (showApiKeyPrompt && !apiKey) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Q&A Review Admin</h1>
          <p className="text-gray-600 mb-4">
            Enter your API key (from .env.local SCRAPER_API_KEY)
          </p>
          <input
            type="password"
            placeholder="SCRAPER_API_KEY"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-4"
          />
          <button
            onClick={() => setShowApiKeyPrompt(false)}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Q&A Candidate Review</h1>
          <p className="text-gray-600">Review and approve Q&A entries before publishing</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold text-gray-800">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Candidate list */}
          <div className="col-span-2">
            <div className="bg-white rounded shadow">
              {loading ? (
                <div className="p-8 text-center text-gray-600">Loading...</div>
              ) : candidates.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  No candidates found
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  {candidates.map((candidate, idx) => (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedId(candidate.id)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedId === candidate.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {candidate.question.substring(0, 60)}
                        </h3>
                        <div className="flex gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              candidate.confidence > 0.8
                                ? 'bg-green-100 text-green-800'
                                : candidate.confidence > 0.65
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {(candidate.confidence * 100).toFixed(0)}%
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                            {candidate.extraction_method}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {candidate.answer}
                      </p>

                      <div className="flex gap-2 flex-wrap">
                        {candidate.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {candidate.quality_flags.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <span className="text-xs text-red-600 font-semibold">Flags:</span>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {candidate.quality_flags.map(flag => (
                              <span
                                key={flag}
                                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                              >
                                {flag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail panel */}
          <div className="bg-white rounded shadow p-6 sticky top-8 h-fit">
            {selected ? (
              <>
                <h2 className="text-lg font-bold mb-4">Details</h2>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Question</h3>
                  <p className="text-gray-700 text-sm">{selected.question}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Answer</h3>
                  <p className="text-gray-700 text-sm line-clamp-5">{selected.answer}</p>
                </div>

                <div className="mb-6">
                  <div className="text-sm">
                    <p>
                      <span className="font-semibold">Source:</span>{' '}
                      <a
                        href={selected.source_url}
                        target="_blank"
                        rel="noopener"
                        className="text-blue-600 truncate hover:underline"
                      >
                        {selected.source_url.substring(0, 40)}...
                      </a>
                    </p>
                    <p>
                      <span className="font-semibold">Method:</span> {selected.extraction_method}
                    </p>
                    <p>
                      <span className="font-semibold">Confidence:</span>{' '}
                      {(selected.confidence * 100).toFixed(0)}%
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{' '}
                      <span className="capitalize">{selected.review_status}</span>
                    </p>
                  </div>
                </div>

                {selected.review_status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(selected.id, 'approve')}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleReview(
                          selected.id,
                          'reject',
                          prompt('Reason for rejection?')
                        )
                      }
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">Select a candidate to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
