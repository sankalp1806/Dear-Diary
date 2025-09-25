'use client';
import React from 'react';
import { Search } from 'lucide-react';
import NavFooter from '@/components/shared/footer';

export default function SearchPage() {
  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
        <Search className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">
          Search
        </h2>
        <p className="text-gray-500 mt-2">
          This page is under development.
        </p>
      </main>
      <NavFooter />
    </div>
  );
}
