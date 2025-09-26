'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Menu,
  BookOpen,
  ChevronRight,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { motion } from 'framer-motion';
import { emotionToMood } from '@/lib/utils';


const EntryItem = React.memo(({ entry, onDelete, onEdit }: { entry: any, onDelete: (id: string) => void, onEdit: (id: string) => void }) => {
  const mood = emotionToMood(entry.emotion);
  const isChat = entry.isChat;

  const getEntryPreview = () => {
    if (isChat) {
      return "Chat with AI";
    }
    if (typeof entry.content === 'string') {
      return entry.content;
    }
    return '';
  }

  return (
    <div className="flex gap-4 items-start relative">
      <div className="flex flex-col items-center h-full">
        <span className="text-xs text-gray-500 font-medium bg-gray-100 rounded-full px-2 py-0.5">
          {format(new Date(entry.entry_date), 'h a')}
        </span>
        <div className="w-px flex-1 bg-gray-200 my-2"></div>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="relative">
          <motion.div
            drag="x"
            dragConstraints={{ left: -80, right: 0 }}
            dragElastic={0.2}
            className="relative z-10 bg-white rounded-xl shadow-sm w-full transition-shadow duration-300 hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            onTap={() => onEdit(entry.id)}
          >
            <div className=" p-4 cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-3xl">
                  {mood?.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 break-words">
                     {isChat ? (
                        <span className="flex items-center gap-2 italic text-gray-500">
                          <MessageSquare className="w-4 h-4" />
                          {getEntryPreview()}
                        </span>
                      ) : (
                        getEntryPreview()
                      )}
                  </p>
                </div>
                <BookOpen className="w-5 h-5 text-gray-300 self-center" />
              </div>
            </div>
          </motion.div>
          <div
            className="absolute right-0 top-0 bottom-0 flex items-center pr-4"
          >
            <div className="flex items-center gap-2">
                <Button size="icon" className="bg-red-500 text-white rounded-full w-12 h-12 shadow-lg" onClick={(e) => {e.stopPropagation(); onDelete(entry.id)}}>
                    <Trash2 className="w-6 h-6" />
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
EntryItem.displayName = 'EntryItem';


export default function TimelinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateStr = searchParams.get('date');

  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedDate = useMemo(() => {
    const date = dateStr ? parseISO(dateStr) : new Date();
    return isValid(date) ? date : new Date();
  }, [dateStr]);

  const loadEntries = useCallback(() => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      const storedEntriesJson = localStorage.getItem('journalEntries');
      let storedEntries = storedEntriesJson ? JSON.parse(storedEntriesJson) : [];
      
      const filtered = storedEntries.filter((entry: any) => 
        format(new Date(entry.entry_date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      );
      const sortedEntries = filtered.sort((a: any, b: any) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
      setEntries(sortedEntries);
    }
    setIsLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    loadEntries();
     const handleStorageChange = () => {
      loadEntries();
    };
    window.addEventListener('journalEntriesChanged', handleStorageChange);

    return () => {
      window.removeEventListener('journalEntriesChanged', handleStorageChange);
    };
  }, [loadEntries]);

  const handleDelete = (id: string) => {
    if (typeof window !== 'undefined') {
      const storedEntriesJson = localStorage.getItem('journalEntries');
      const storedEntries = storedEntriesJson ? JSON.parse(storedEntriesJson) : [];
      const updatedEntries = storedEntries.filter((entry: any) => entry.id !== id);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      window.dispatchEvent(new CustomEvent('journalEntriesChanged'));
    }
  };

  const handleEdit = (id: string) => {
     if (typeof window !== 'undefined') {
      const entryToEdit = entries.find((entry: any) => entry.id === id);
      if (entryToEdit) {
        localStorage.setItem('entryToEdit', JSON.stringify(entryToEdit));
        localStorage.setItem('entryToEditId', id);
        router.push('/new-entry?view=true');
      }
    }
  };


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
             <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 ml-2"></div>
              <div className="space-y-6">
                {entries.map((entry) => (
                  <EntryItem key={entry.id} entry={entry} onDelete={handleDelete} onEdit={handleEdit} />
                ))}
              </div>
          </div>
        )}
      </main>

      <footer className="p-4 bg-transparent sticky bottom-0">
          <Link href={`/new-entry?date=${format(selectedDate, 'yyyy-MM-dd')}`} className="flex-1">
            <Button className="w-full h-14 bg-blue-600 text-white rounded-full shadow-lg text-lg">
              New note
            </Button>
          </Link>
      </footer>
    </div>
  );
}
