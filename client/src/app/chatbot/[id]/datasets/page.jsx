'use client';
import React, { useState, useEffect } from 'react';
import { NavLink } from '@/components/NavLink';
import constants from '@/helpers/constants';

const ROW_OPTIONS = [10, 25, 50, 75, 100];

export default function Datasets({ params }) {
  const courseID = params.id;
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadRows, setDownloadRows] = useState(50);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchCount() {
      try {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem(constants.authToken) : null;
        const res = await fetch(`${constants.url}/chatbot/${courseID}/dataset/count`, {
          headers: token ? { "x-access'courser-auth-token": token } : {},
          credentials: 'include',
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setCount(data.count);
      } catch (_) {}
      if (!cancelled) setLoading(false);
    }
    fetchCount();
    return () => { cancelled = true; };
  }, [courseID]);

  const handleDownload = () => {
    setDownloading(true);
    const token = typeof window !== 'undefined' ? window.localStorage.getItem(constants.authToken) : null;
    const url = `${constants.url}/chatbot/${courseID}/dataset/export?limit=${downloadRows}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    if (token) {
      fetch(url, {
        headers: { "x-access'courser-auth-token": token },
        credentials: 'include',
      })
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          link.href = blobUrl;
          link.download = `dataset-${courseID}-${Date.now()}.csv`;
          link.click();
          URL.revokeObjectURL(blobUrl);
        })
        .catch(() => {})
        .finally(() => setDownloading(false));
    } else {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="h-16 w-full flex justify-start items-center mb-6">
        <p className="text-2xl font-bold mr-4">Datasets</p>
        <NavLink href="./settings">Modify</NavLink>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Conversations</h2>
        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : (
          <p className="text-2xl font-bold text-gray-900 mb-6">
            {count != null ? count.toLocaleString() : '—'} total conversation{count !== 1 ? 's' : ''}
          </p>
        )}

        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Rows to download (10–100)</label>
          <select
            value={downloadRows}
            onChange={(e) => setDownloadRows(Number(e.target.value))}
            className="block w-full max-w-[200px] rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {ROW_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleDownload}
            disabled={loading || downloading || (count != null && count === 0)}
            className="mt-4 inline-flex items-center rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 shadow hover:bg-amber-400 disabled:opacity-50 disabled:pointer-events-none"
          >
            {downloading ? 'Downloading…' : 'Download as CSV'}
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          CSV columns: Start time, User Question, Assistant Answer.
        </p>
      </div>
    </div>
  );
}
