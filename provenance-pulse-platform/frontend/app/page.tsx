'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">Provenance Pulse</span>
            </div>
            <Link href="/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Intelligence for
            <br />
            <span className="text-primary-600">High-Value Assets</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Transform your auction house or luxury marketplace with predictive analytics,
            authentication intelligence, and automated workflows.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-auction-500 rounded-lg mb-4 mx-auto flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Auction Pulse</h3>
              <p className="text-gray-600 mb-4">
                Hammer price prediction, sell-through optimization, and bidder engagement for auction houses.
              </p>
              <Link href="/login" className="text-auction-600 font-medium hover:text-auction-700">
                Learn more &rarr;
              </Link>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-luxury-500 rounded-lg mb-4 mx-auto flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Luxury Pulse</h3>
              <p className="text-gray-600 mb-4">
                Authentication intelligence, pricing optimization, and seller automation for luxury resale.
              </p>
              <Link href="/login" className="text-luxury-600 font-medium hover:text-luxury-700">
                Learn more &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
