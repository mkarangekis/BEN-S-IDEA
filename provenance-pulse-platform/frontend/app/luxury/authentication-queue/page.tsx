'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AuthenticationQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/luxury/authentication/queue', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQueue(data);
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Authentication Queue</h1>
        <div className="text-sm text-gray-500">
          {queue.length} items in queue
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {queue.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{job.queuePosition || '-'}</td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium">{job.listing.title}</div>
                  <div className="text-xs text-gray-500">{job.listing.category}</div>
                </td>
                <td className="px-4 py-3 text-sm">{job.listing.brand}</td>
                <td className="px-4 py-3 text-sm">${job.listing.askingPrice.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    job.status === 'QUEUED' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {job.assignedTo
                    ? `${job.assignedTo.firstName} ${job.assignedTo.lastName}`
                    : '-'}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/luxury/listings/${job.listing.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {queue.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No items in authentication queue
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
