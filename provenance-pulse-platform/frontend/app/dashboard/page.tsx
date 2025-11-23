'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome to Provenance Pulse</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/auction/dashboard" className="card hover:shadow-lg transition-shadow group">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-auction-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold ml-3 group-hover:text-auction-600">Auction Pulse</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Manage auctions, lots, and bidders with AI-powered predictions and analytics.
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>Hammer price predictions</li>
            <li>Sell-through optimization</li>
            <li>Bidder engagement scoring</li>
          </ul>
        </Link>

        <Link href="/luxury/dashboard" className="card hover:shadow-lg transition-shadow group">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-luxury-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold ml-3 group-hover:text-luxury-600">Luxury Pulse</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Authenticate, price, and catalog luxury items with intelligent automation.
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>Authentication queue management</li>
            <li>Pricing intelligence</li>
            <li>Condition grading</li>
          </ul>
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/auction/auctions" className="btn-secondary text-center">
            View Auctions
          </Link>
          <Link href="/luxury/listings" className="btn-secondary text-center">
            View Listings
          </Link>
          <Link href="/luxury/authentication-queue" className="btn-secondary text-center">
            Auth Queue
          </Link>
          <Link href="/settings/organization" className="btn-secondary text-center">
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
