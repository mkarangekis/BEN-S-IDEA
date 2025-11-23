'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LuxuryDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/luxury/control-tower/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch data:', err);
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
        <h1 className="text-2xl font-bold text-gray-900">Luxury Control Tower</h1>
        <Link href="/luxury/listings" className="btn-primary">
          View All Listings
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-sm text-gray-500">Active Listings</div>
          <div className="text-2xl font-bold">{data?.summary?.activeListings || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Total GMV</div>
          <div className="text-2xl font-bold">
            ${(data?.summary?.totalGMV || 0).toLocaleString()}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Auth Queue</div>
          <div className="text-2xl font-bold">{data?.authentication?.queueSize || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Avg Cycle Time</div>
          <div className="text-2xl font-bold">
            {data?.authentication?.avgCycleTimeHours || 0}h
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Authentication Stats */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Authentication</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">In Queue</span>
              <span className="font-medium">{data?.authentication?.queueSize || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">In Progress</span>
              <span className="font-medium">{data?.authentication?.inProgress || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed Today</span>
              <span className="font-medium">{data?.authentication?.completedToday || 0}</span>
            </div>
          </div>
          <Link
            href="/luxury/authentication-queue"
            className="block mt-4 text-center btn-secondary"
          >
            View Queue
          </Link>
        </div>

        {/* Risk Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Counterfeit Risk Distribution</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">High Risk</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${(data?.riskDistribution?.high || 0) * 10}%` }}
                  />
                </div>
                <span className="font-medium">{data?.riskDistribution?.high || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Medium Risk</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(data?.riskDistribution?.medium || 0) * 10}%` }}
                  />
                </div>
                <span className="font-medium">{data?.riskDistribution?.medium || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Low Risk</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(data?.riskDistribution?.low || 0) * 10}%` }}
                  />
                </div>
                <span className="font-medium">{data?.riskDistribution?.low || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Margin by Category */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Margin by Category</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data?.marginByCategory?.map((item: any) => (
              <div key={item.category} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">{item.category}</div>
                <div className="text-lg font-semibold">${item.revenue.toLocaleString()}</div>
                <div className="text-sm text-green-600">
                  {(item.avgMargin * 100).toFixed(1)}% margin
                </div>
              </div>
            )) || <div className="text-gray-500">No margin data</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
