'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Menu,
  Search,
  Share2,
  Mic,
  Image,
  Paperclip,
  BookOpen,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const moods: { [key: number]: { emoji: string; label: string } } = {
  1: { emoji: '😔', label: 'Apathetic' },
  2: { emoji: '😠', label: 'Angry' },
  3: { emoji: '😟', label: 'Anxious' },
  4: { emoji: '😐', label: 'Neutral' },
  5: { emoji: '🙂', label: 'Calm' },
  6: { emoji: '😊', label: 'Happy' },
  7: { emoji: '😃', label: 'Excited' },
  8: { emoji: '😍', label: 'Grateful' },
};

// Mock JournalEntry entity
const mockJournalEntries = [
    { id: '1', title: 'A good day', content: 'Today was a really good day. I felt happy and productive.', mood_score: 6, entry_date: new Date().toISOString(), category: 'feelings' },
    { id: '2', title: 'Untitled', content: '', mood_score: 5, entry_date: new Date().toISOString(), category: 'mood' },
    { id: '3', title: 'Anxious thoughts', content: 'Felt a bit anxious about the upcoming presentation.', mood_score: 3, entry_date: new Date().toISOString(), category: 'feelings' },
];

const EntryItem = ({ entry }: { entry: any }) => {
  const mood = entry.mood_score ? moods[entry.mood_score] || moods[4] : null;
  const isMoodMark = !entry.content && mood;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-500">
          {format(new Date(entry.entry_date), 'HH:mm')}
        </span>
        <div className="w-px flex-1 bg-gray-200 my-2"></div>
        <Share2 className="w-4 h-4 text-gray-400" />
        <div className="w-px flex-1 bg-gray-200 mt-2"></div>
      </div>
      <div className="flex-1 pb-8">
        {isMoodMark ? (
          <p className="text-gray-600">
            You marked that you felt{' '}
            <span className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
              {mood.emoji} {mood.label}
            </span>
          </p>
        ) : (
          <>
            {entry.title !== 'Untitled' && (
              <h3 className="font-semibold text-gray-800 mb-1">
                {entry.title}
              </h3>
            )}
            <p className="text-gray-600 whitespace-pre-wrap">{entry.content}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default function TimelinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateStr = searchParams.get('date');

  const [entries, setEntries] = useState<any[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('All today');
  const [isLoading, setIsLoading] = useState(true);

  const selectedDate = dateStr ? parseISO(dateStr) : new Date();

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    // In a real app, you would fetch entries for the selectedDate
    // For now, we'll just use the mock data
    setEntries(mockJournalEntries);
    setFilteredEntries(mockJournalEntries); // Initially show all
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (filter === 'All today') {
      setFilteredEntries(entries);
    } else if (filter === 'Notes') {
      setFilteredEntries(entries.filter((e) => e.content));
    } else if (filter === 'Marks' || filter === 'Mood') {
      setFilteredEntries(entries.filter((e) => !e.content && e.mood_score));
    }
  };

  const categories = [...new Set(entries.map((e) => e.category).filter(Boolean))];

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col font-sans">
      <header className="p-4 bg-gray-50 sticky top-0 z-10">
        <div className="bg-black text-white rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href="/dashboard">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </Link>
            <div>
              <p className="text-xl font-bold">{format(selectedDate, 'd')}</p>
              <p className="text-xl">{format(selectedDate, 'MMM')}</p>
            </div>
          </div>
          <div className="border-l border-gray-600 pl-4 h-10 flex flex-col justify-center">
            <p className="text-sm">{entries.length} notes</p>
            <p className="text-sm text-gray-400">
              {entries.filter((e) => e.mood_score).length} diary marks
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </header>

      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['All today', 'Notes', 'Marks', 'Mood'].map((filter) => (
            <Button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`rounded-full h-9 text-sm whitespace-nowrap px-4 ${
                activeFilter === filter
                  ? 'bg-black text-white'
                  : 'bg-white text-black border'
              }`}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-4 mb-4 flex items-center gap-2">
        <Select>
          <SelectTrigger className="bg-white border rounded-lg flex-1">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          className="bg-white border rounded-lg"
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>

      <main className="flex-1 overflow-y-auto px-4">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading entries...</p>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">
              Your journal is empty
            </h2>
            <p className="text-gray-500 mt-2">
              Tap 'New note' to capture what's on your mind.
            </p>
          </div>
        ) : (
          <div>
            {filteredEntries.map((entry) => (
              <EntryItem key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>

      <footer className="p-4 bg-gray-50 sticky bottom-0">
        <div className="flex items-center justify-around gap-2">
           <Link href="/voice-chat">
                <Button size="icon" className="bg-blue-600 text-white rounded-full w-12 h-12 shadow-lg">
                    <Mic className="w-6 h-6" />
                </Button>
          </Link>
          <Button
            size="icon"
            className="bg-white text-gray-700 rounded-full w-12 h-12 shadow-lg border"
          >
            <Image className="w-6 h-6" />
          </Button>
          <Button
            size="icon"
            className="bg-white text-gray-700 rounded-full w-12 h-12 shadow-lg border"
          >
            <Paperclip className="w-6 h-6" />
          </Button>
          <Link href="/new-entry" className="flex-1">
            <Button className="w-full h-12 bg-blue-600 text-white rounded-full shadow-lg text-md">
              New note
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
