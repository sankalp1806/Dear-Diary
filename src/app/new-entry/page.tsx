'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronLeft,
  Bell,
  Clock,
  Mic,
  Paperclip,
  Smile,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const moods = [
  'Happy',
  'Sad',
  'Anxious',
  'Excited',
  'Calm',
  'Angry',
  'Grateful',
];

export default function NewEntry() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mood, setMood] = useState('Sad');

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000); // Update time every minute
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    // Check for transcript from voice chat page
    if (typeof window !== 'undefined') {
        const voiceTranscript = localStorage.getItem('voice-transcript');
        if (voiceTranscript) {
            setContent(prev => prev ? `${prev}\n${voiceTranscript}` : voiceTranscript);
            localStorage.removeItem('voice-transcript');
        }
    }
  }, []);

  const handleSave = async () => {
    if (!content && !title) {
      // Don't save empty notes
      router.push('/dashboard');
      return;
    }

    // Placeholder for saving data
    console.log({
      title: title || 'Untitled',
      content: content,
      mood_score: moods.indexOf(mood) + 1,
      entry_date: new Date().toISOString(),
    });

    router.push('/dashboard');
  };

  return (
    <div className="h-screen w-full bg-[#F8F5F2] flex flex-col font-sans">
      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
        <div className="absolute top-0 left-0 right-0 h-1 bg-green-200">
          <motion.div
            className="h-full bg-green-500"
            initial={{ width: '0%' }}
            animate={{ width: '30%' }} // Example progress
            transition={{ duration: 1 }}
          />
        </div>

        <header className="flex items-center justify-between p-4 pt-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-800">
            Create New Journal
          </h1>
          <Button variant="ghost" size="icon">
            <Bell className="w-6 h-6 text-gray-700" />
          </Button>
        </header>

        <main className="flex-1 px-6 py-4 flex flex-col">
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full bg-white border-gray-200"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {format(currentDate, 'MMM d, h:mm a')}
                </Button>
              </PopoverTrigger>
              <PopoverContent>Date/Time Picker placeholder</PopoverContent>
            </Popover>

            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="rounded-full bg-white border-gray-200 w-auto">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{mood}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {moods.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 flex flex-col">
            <input
              type="text"
              placeholder="Untitled"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-4xl font-bold text-gray-800 bg-transparent outline-none mb-4 placeholder:text-gray-400"
            />
            <Textarea
              placeholder="Write anything that's on your mind..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 text-lg text-gray-600 bg-transparent border-none outline-none resize-none p-0 focus-visible:ring-0 placeholder:text-gray-400"
            />
          </div>
        </main>

        <footer className="p-4">
          <p className="text-center text-gray-400 text-sm mb-3">
            Tap to continue your journal!
          </p>
          <div className="bg-white rounded-full shadow-lg p-2 flex items-center justify-around">
            <Link href="/voice-chat">
              <Button variant="ghost" size="icon" className="text-gray-600">
                <Mic className="w-6 h-6" />
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Sparkles className="w-6 h-6" />
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Paperclip className="w-6 h-6" />
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Smile className="w-6 h-6" />
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <Button
              size="icon"
              className="bg-green-100 text-green-700 rounded-full w-10 h-10 hover:bg-green-200"
              onClick={handleSave}
            >
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
