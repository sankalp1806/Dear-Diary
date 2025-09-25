'use client';
import React, { useState, useEffect, useActionState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronLeft,
  Clock,
  Mic,
  Paperclip,
  Smile,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { generatePromptsAction, getSentimentForEntry } from '@/app/actions';

export default function NewEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);

  const [promptsState, generatePromptsFormAction] = useActionState(
    generatePromptsAction,
    null
  );

  useEffect(() => {
    setIsClient(true);
    const dateStr = searchParams.get('date');
    let initialDate = new Date();
    if (dateStr) {
      const parsedDate = parseISO(dateStr);
      if (isValid(parsedDate)) {
        initialDate = parsedDate;
      }
    }
     // Set time to current time for the date
    const now = new Date();
    initialDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    setEntryDate(initialDate);

    // No need for a timer to update the date every minute for a new entry
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const voiceTranscript = localStorage.getItem('voice-transcript');
      if (voiceTranscript) {
        setContent((prev) =>
          prev ? `${prev}\n${voiceTranscript}` : voiceTranscript
        );
        localStorage.removeItem('voice-transcript');
      }

      const entryToEditJson = localStorage.getItem('entryToEdit');
      if (entryToEditJson) {
        const entryToEdit = JSON.parse(entryToEditJson);
        setTitle(entryToEdit.title);
        setContent(entryToEdit.content);
        if (entryToEdit.entry_date) {
            setEntryDate(new Date(entryToEdit.entry_date));
        }
        // Clean up so it doesn't load again
        localStorage.removeItem('entryToEdit');
      }
    }
  }, []);

  useEffect(() => {
    if (promptsState?.success && promptsState.data?.prompts) {
      const randomPrompt =
        promptsState.data.prompts[
          Math.floor(Math.random() * promptsState.data.prompts.length)
        ];
      setContent((prev) => `${prev}${prev ? '\n\n' : ''}${randomPrompt}\n`);
    } else if (promptsState?.error) {
      toast({
        variant: 'destructive',
        title: 'Error generating prompt',
        description: promptsState.error,
      });
    }
  }, [promptsState, toast]);

  const handleSave = async () => {
    if (!content && !title) {
      router.push('/dashboard');
      return;
    }

    const sentimentResult = await getSentimentForEntry(content);
    const primaryEmotion = sentimentResult?.emotion || 'Neutral';
    const overallSentiment = sentimentResult?.overallSentiment?.toLowerCase() || 'neutral';


    let mood_score = 4; // Default to neutral
    if (overallSentiment.includes('very positive')) {
        mood_score = 8;
    } else if (overallSentiment.includes('positive')) {
        mood_score = 6;
    } else if (overallSentiment.includes('very negative')) {
        mood_score = 2;
    } else if (overallSentiment.includes('negative')) {
        mood_score = 3;
    }


    if (typeof window !== 'undefined') {
      const existingEntriesJson = localStorage.getItem('journalEntries');
      const existingEntries = existingEntriesJson
        ? JSON.parse(existingEntriesJson)
        : [];
      
      const entryToEditId = localStorage.getItem('entryToEditId');

      if (entryToEditId) {
        // Update existing entry
        const updatedEntries = existingEntries.map((entry: any) => 
          entry.id === entryToEditId 
            ? { ...entry, title: title || 'Untitled', content, entry_date: entryDate.toISOString(), sentiment: overallSentiment, mood_score, emotion: primaryEmotion }
            : entry
        );
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        localStorage.removeItem('entryToEditId');
      } else {
        // Add new entry
        const newEntry = {
          id: new Date().toISOString(),
          title: title || 'Untitled',
          content: content,
          entry_date: entryDate.toISOString(),
          mood_score: mood_score,
          sentiment: overallSentiment,
          emotion: primaryEmotion,
          category: 'feelings'
        };
        const updatedEntries = [...existingEntries, newEntry];
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      }
      // Dispatch a custom event to notify other components of the change
      window.dispatchEvent(new CustomEvent('journalEntriesChanged'));
    }
    
    router.push(`/timeline?date=${format(entryDate, 'yyyy-MM-dd')}`);
  };

  const handleAttachment = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: 'File attached!',
        description: `${file.name} has been attached.`,
      });
    }
  };


  return (
    <div className="h-screen w-full bg-[#F8F5F2] flex flex-col font-sans">
      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
        <div className="absolute top-0 left-0 right-0 h-1 bg-green-200">
          <motion.div
            className="h-full bg-green-500"
            initial={{ width: '0%' }}
            animate={{ width: '30%' }} 
            transition={{ duration: 1 }}
          />
        </div>

        <header className="flex items-center justify-between p-4 pt-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-800">What's Up??</h1>
          <div className="w-10"></div>
        </header>

        <main className="flex-1 px-6 py-4 flex flex-col overflow-y-auto">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Button
              variant="outline"
              className="rounded-full bg-white border-gray-200"
            >
              <Clock className="w-4 h-4 mr-2" />
              {isClient && entryDate
                ? format(entryDate, 'MMM d, h:mm a')
                : 'Loading...'}
            </Button>
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
              name="entry"
              placeholder="Write anything that's on your mind..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 text-lg text-gray-600 bg-transparent border-none outline-none resize-none p-0 focus-visible:ring-0 placeholder:text-gray-400"
            />
          </div>
        </main>

        <footer className="p-4 mt-auto">
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
            <form>
              <Button formAction={generatePromptsFormAction} variant="ghost" size="icon" className="text-gray-600">
                <Sparkles className="w-6 h-6" />
              </Button>
            </form>
            <div className="h-6 w-px bg-gray-200" />
            <Button variant="ghost" size="icon" className="text-gray-600" onClick={handleAttachment}>
              <Paperclip className="w-6 h-6" />
            </Button>
             <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
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
