'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Menu,
  BookOpen,
  ChevronRight,
  FileText,
  Trash2,
  Pencil,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const moods: { [key: number]: { emoji: string; label: string; color: string } } = {
  1: { emoji: '😔', label: 'Apathetic', color: 'bg-indigo-100' },
  2: { emoji: '😠', label: 'Angry', color: 'bg-red-100' },
  3: { emoji: '😟', label: 'Anxious', color: 'bg-purple-100' },
  4: { emoji: '😐', label: 'Neutral', color: 'bg-gray-100' },
  5: { emoji: '🙂', label: 'Calm', color: 'bg-blue-100' },
  6: { emoji: '😊', label: 'Happy', color: 'bg-yellow-100' },
  7: { emoji: '😃', label: 'Excited', color: 'bg-orange-100' },
  8: { emoji: '😍', label: 'Grateful', color: 'bg-pink-100' },
};

// Mock JournalEntry entity
const mockJournalEntries = [
    { id: '1', title: 'Fellt happy xD', content: 'Today was a painful day. I found...', mood_score: 6, entry_date: new Date(new Date().setHours(9, 15)).toISOString(), category: 'feelings' },
    { id: '2', title: 'Just got promotion. OMGG!', content: 'Today was a good day, I found...', mood_score: 7, entry_date: new Date(new Date().setHours(11, 30)).toISOString(), category: 'mood' },
    { id: '3', title: "don't know wht to do anym...", content: 'Felt a bit anxious about the upcoming presentation.', mood_score: 3, entry_date: new Date(new Date().setHours(13, 0)).toISOString(), category: 'feelings' },
];

const EntryItem = ({ entry }: { entry: any }) => {
  const mood = entry.mood_score ? moods[entry.mood_score] || moods[4] : moods[4];
  const wordCount = entry.content.split(/\s+/).length + entry.title.split(/\s+/).length;

  return (
    <div className="flex gap-4 items-start relative">
      <div className="flex flex-col items-center h-full">
        <span className="text-xs text-gray-500 font-medium bg-gray-100 rounded-full px-2 py-0.5">
          {format(new Date(entry.entry_date), 'h a')}
        </span>
        <div className="w-px flex-1 bg-gray-200 my-2"></div>
      </div>
      <div className="flex-1 overflow-hidden">
        <motion.div
            drag="x"
            dragConstraints={{ left: -128, right: 0 }}
            dragElastic={0.2}
            className="relative"
          >
          <div className="bg-white rounded-xl p-4 shadow-sm w-full">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${mood.color}`}>
                {mood.emoji}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{entry.title}</h3>
                <p className="text-sm text-gray-500 truncate">{entry.content}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                  <FileText className="w-3 h-3" />
                  <span>{wordCount} total words</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 self-center" />
            </div>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-center"
      >
        <div className="flex items-center gap-2 pr-4">
            <Button size="icon" className="bg-yellow-500 text-white rounded-full w-12 h-12 shadow-lg">
                <Pencil className="w-6 h-6" />
            </Button>
            <Button size="icon" className="bg-red-500 text-white rounded-full w-12 h-12 shadow-lg">
                <Trash2 className="w-6 h-6" />
            </Button>
        </div>
      </motion.div>
    </div>
  );
};


export default function TimelinePage() {
  const searchParams = useSearchParams();
  const dateStr = searchParams.get('date');

  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedDate = dateStr ? parseISO(dateStr) : new Date();

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    // In a real app, you would fetch entries for the selectedDate
    const sortedEntries = mockJournalEntries.sort((a,b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
    setEntries(sortedEntries);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);


  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col font-sans">
      <header className="p-4 bg-gray-50 sticky top-0 z-10">
        <div className="bg-white rounded-2xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <Link href="/dashboard">
              <div className="bg-gray-100 w-11 h-11 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
            </Link>
            <div>
              <p className="text-lg font-bold text-gray-800">{format(selectedDate, 'd MMM yyyy')}</p>
              <p className="text-xs text-gray-500">
              {entries.length} entries
            </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Menu className="w-6 h-6 text-gray-600" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-4 space-y-6">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading entries...</p>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <BookOpen className="w-16 h-16 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">
              No entries for this day
            </h2>
            <p className="text-gray-500 mt-2">
              Tap 'New note' to capture what's on your mind.
            </p>
          </div>
        ) : (
          <div className='relative'>
             <div className="absolute left-7 top-0 bottom-0 w-px bg-gray-200"></div>
              <div className="space-y-6">
                {entries.map((entry) => (
                  <EntryItem key={entry.id} entry={entry} />
                ))}
              </div>
          </div>
        )}
      </main>

      <footer className="p-4 bg-transparent sticky bottom-0">
          <Link href="/new-entry" className="flex-1">
            <Button className="w-full h-14 bg-blue-600 text-white rounded-full shadow-lg text-lg">
              New note
            </Button>
          </Link>
      </footer>
    </div>
  );
}
