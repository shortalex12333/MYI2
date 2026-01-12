'use client';

import { useState } from 'react';

interface ImportEntry {
  question: string;
  answer: string;
  source_url: string;
  domain: string;
  confidence: number;
  tags: string[];
}

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [apiKey, setApiKey] = useState('');
  const [dryRun, setDryRun] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (text: string): ImportEntry[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

    return lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const row = Object.fromEntries(headers.map((h, i) => [h, values[i]]));

      return {
        question: row.question || '',
        answer: row.answer || '',
        source_url: row.source_url || '',
        domain: row.domain || '',
        confidence: parseFloat(row.confidence || '0.7'),
        tags: (row.tags || '').split(';').map((t) => t.trim()),
      };
    });
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    if (!apiKey) {
      alert('Please enter API key');
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const entries = parseCSV(text);

      const response = await fetch('/api/v1/bulk-import', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries,
          dryRun,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Bulk Import Q&A</h1>

        <div className="space-y-6">
          {/* API Key Input */}
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter SCRAPER_API_KEY"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-2">
              Expected columns: question, answer, source_url, domain, confidence, tags
            </p>
          </div>

          {/* Dry Run Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="dryrun"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              className="mr-3"
            />
            <label htmlFor="dryrun" className="text-sm font-medium">
              Dry Run (preview without importing)
            </label>
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={loading || !file}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Importing...' : 'Import'}
          </button>

          {/* Results */}
          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.error
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}
            >
              <h2 className="font-bold mb-2">
                {result.error ? '❌ Error' : '✅ ' + result.status}
              </h2>
              <p className="text-sm mb-2">{result.message || result.error}</p>

              {result.preview && (
                <div className="mt-4 text-xs">
                  <p className="font-bold mb-2">Preview (first 3 entries):</p>
                  <pre className="bg-white p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(result.preview, null, 2)}
                  </pre>
                </div>
              )}

              {result.imported && (
                <p className="text-sm font-bold text-green-700">
                  Imported: {result.imported}/{result.total}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm">
          <h3 className="font-bold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            <li>Run Python scraper: python3 scraper.py</li>
            <li>Extract Q&A: python3 extract_qa.py</li>
            <li>Upload the generated qa_import.csv file here</li>
            <li>Check "Dry Run" to preview before importing</li>
            <li>Click Import to add entries to database</li>
            <li>Entries will appear on /knowledge page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
