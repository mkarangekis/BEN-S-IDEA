'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AuctionDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/auction/control-tower/overview', {
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
        <h1 className="text-2xl font-bold text-gray-900">Auction Control Tower</h1>
        <Link href="/auction/auctions" className="btn-primary">
          View All Auctions
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-sm text-gray-500">Total Auctions</div>
          <div className="text-2xl font-bold">{data?.summary?.totalAuctions || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold">
            ${(data?.summary?.totalRevenue || 0).toLocaleString()}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Sell-Through Rate</div>
          <div className="text-2xl font-bold">
            {((data?.metrics?.sellThroughRate || 0) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Hammer Accuracy</div>
          <div className="text-2xl font-bold">
            {((data?.metrics?.hammerPriceAccuracy || 0) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Auctions */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Auctions</h2>
          <div className="space-y-3">
            {data?.recentAuctions?.map((auction: any) => (
              <Link
                key={auction.id}
                href={`/auction/auctions/${auction.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{auction.name}</div>
                    <div className="text-sm text-gray-500">
                      {auction.lotCount} lots | {auction.soldCount} sold
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    auction.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    auction.status === 'LIVE' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {auction.status}
                  </span>
                </div>
              </Link>
            )) || <div className="text-gray-500">No auctions yet</div>}
          </div>
        </div>

        {/* Bidder Metrics */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Bidder Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Bidders</span>
              <span className="font-medium">{data?.bidderMetrics?.totalBidders || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Bidders</span>
              <span className="font-medium">{data?.bidderMetrics?.activeBidders || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VIP Bidders</span>
              <span className="font-medium">{data?.bidderMetrics?.vipBidders || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Activation Score</span>
              <span className="font-medium">{data?.bidderMetrics?.averageActivationScore || 0}</span>
            </div>
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Revenue by Category</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data?.revenueByCategory?.map((item: any) => (
              <div key={item.category} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">{item.category}</div>
                <div className="text-lg font-semibold">${item.revenue.toLocaleString()}</div>
              </div>
            )) || <div className="text-gray-500">No revenue data</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
