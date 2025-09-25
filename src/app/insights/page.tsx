'use client';
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { subDays, format, eachDayOfInterval } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Bell, Book, Plus, Smile, Meh, Frown, Angry, SmilePlus, BookOpen } from 'lucide-react';
import NavFooter from '@/components/shared/footer';
import Link from 'next/link';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  entry_date: string;
  mood_score: number;
  category: string;
}

interface InsightsData {
  totalJournals: number;
  totalWords: number;
  positiveCount: number;
  negativeCount: number;
  emotionFrequency: { [key: string]: number };
  mostFrequentEmotion: string;
  weeklyMoodData: { date: string; mood: number }[];
}

const moodToEmotionMap: { [key:number]: string } = {
  1: 'Apathetic',
  2: 'Angry',
  3: 'Anxious',
  4: 'Neutral',
  5: 'Calm',
  6: 'Happy',
  7: 'Excited',
  8: 'Grateful',
};

const emotionDetails: { [key: string]: { icon: React.ReactNode, color: string } } = {
    'Happy': { icon: <Smile className="w-5 h-5 text-gray-500" />, color: 'bg-green-400'},
    'Grateful': { icon: <SmilePlus className="w-5 h-5 text-gray-500" />, color: 'bg-pink-400'},
    'Excited': { icon: <SmilePlus className="w-5 h-5 text-gray-500" />, color: 'bg-orange-400'},
    'Calm': { icon: <Smile className="w-5 h-5 text-gray-500" />, color: 'bg-blue-400' },
    'Neutral': { icon: <Meh className="w-5 h-5 text-gray-500" />, color: 'bg-amber-600' },
    'Anxious': { icon: <Frown className="w-5 h-5 text-gray-500" />, color: 'bg-purple-500' },
    'Apathetic': { icon: <Frown className="w-5 h-5 text-gray-500" />, color: 'bg-indigo-500' },
    'Angry': { icon: <Angry className="w-5 h-5 text-gray-500" />, color: 'bg-red-500' },
};

const processJournalData = (entries: JournalEntry[]): InsightsData | null => {
  if (entries.length === 0) {
    return null;
  }

  const totalJournals = entries.length;
  const totalWords = entries.reduce((acc, entry) => acc + (entry.content?.split(' ').length || 0), 0);
  
  let positiveCount = 0;
  let negativeCount = 0;
  const emotionFrequency: { [key: string]: number } = {};

  entries.forEach(entry => {
    if (entry.mood_score > 5) positiveCount++;
    if (entry.mood_score < 4) negativeCount++;
    
    const emotion = moodToEmotionMap[entry.mood_score];
    if (emotion) {
      emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;
    }
  });

  const mostFrequentEmotion = Object.keys(emotionFrequency).reduce((a, b) => emotionFrequency[a] > emotionFrequency[b] ? a : b, 'Neutral');

  const endDate = new Date();
  const startDate = subDays(endDate, 6);
  const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });

  const weeklyMoodData = dateInterval.map(date => {
    const dayStr = format(date, 'yyyy-MM-dd');
    const entriesForDay = entries.filter(e => format(new Date(e.entry_date), 'yyyy-MM-dd') === dayStr);
    
    if (entriesForDay.length > 0) {
      const avgMood = entriesForDay.reduce((sum, e) => sum + e.mood_score, 0) / entriesForDay.length;
      return { date: format(date, 'EEE'), mood: parseFloat(avgMood.toFixed(2)) };
    }
    return { date: format(date, 'EEE'), mood: 0 };
  });

  return {
    totalJournals,
    totalWords,
    positiveCount,
    negativeCount,
    emotionFrequency,
    mostFrequentEmotion,
    weeklyMoodData,
  };
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const moodValue = payload[0].value;
      let moodLabel = 'No entries';
      if (moodValue > 0) {
        moodLabel = moodToEmotionMap[Math.round(moodValue)] || 'Neutral';
      }
      return (
        <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-gray-700">{label}</p>
          <p className="text-sm text-purple-600">{moodLabel}</p>
        </div>
      );
    }
    return null;
  };

export default function InsightsPage() {
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
      const storedEntriesJson = localStorage.getItem('journalEntries');
      const entries: JournalEntry[] = storedEntriesJson ? JSON.parse(storedEntriesJson) : [];
      setInsights(processJournalData(entries));
    }, []);

    const sortedEmotions = Object.entries(insights?.emotionFrequency || {})
        .sort(([, a], [, b]) => b - a)
        .map(([emotion]) => emotion);

    if (!isClient) {
        return (
          <div className="min-h-screen bg-[#FBF9F7] font-sans text-gray-800 flex items-center justify-center">
            <p>Loading insights...</p>
          </div>
        );
    }

    if (!insights) {
      return (
        <div className="min-h-screen bg-[#FBF9F7] font-sans text-gray-800">
             <div className="container mx-auto px-4 py-6 pb-24 flex flex-col h-screen justify-center items-center">
                 <BookOpen className="w-16 h-16 mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-700">No Insights Yet</h2>
                <p className="text-gray-500 mt-2 text-center">Start writing in your journal to see your personalized insights here.</p>
             </div>
            <NavFooter />
        </div>
      );
    }
    
    return (
        <div className="min-h-screen bg-[#FBF9F7] font-sans text-gray-800">
            <div className="container mx-auto px-4 py-6 pb-24">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h1 className="font-bold text-xl">Self Journal</h1>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Bell className="w-6 h-6" />
                    </Button>
                </header>

                <main>
                     <section className="mb-8 p-6 bg-white/50 rounded-2xl">
                        <h2 className="text-lg font-semibold mb-4 text-center">Mood over the last week</h2>
                        <div style={{ width: '100%', height: 200 }}>
                            <ResponsiveContainer>
                                <LineChart data={insights.weeklyMoodData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis hide={true} domain={[0, 8]}/>
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139, 92, 246, 0.3)', strokeWidth: 2, strokeDasharray: '3 3' }} />
                                    <Line type="monotone" dataKey="mood" stroke="#8B5CF6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#8B5CF6' }}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section className="text-center mb-8 p-6 bg-white/50 rounded-2xl">
                        <Book className="w-8 h-8 text-amber-700 mx-auto mb-2" />
                        <p className="text-7xl font-bold mb-1">{insights.totalJournals}</p>
                        <p className="text-gray-600">Total Journals</p>
                    </section>
                    
                    <section className="grid grid-cols-3 gap-4 text-center mb-8">
                        <div>
                            <p className="font-bold text-2xl">{insights.totalWords.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Total Words</p>
                        </div>
                        <div>
                            <p className="font-bold text-2xl">{insights.negativeCount}</p>
                            <p className="text-sm text-gray-500">Negative</p>
                        </div>
                        <div>
                            <p className="font-bold text-2xl">{insights.positiveCount}</p>
                            <p className="text-sm text-gray-500">Positive</p>
                        </div>
                    </section>
                    
                     <div className="text-center mb-8">
                        <Link href="/new-entry" passHref>
                          <Button size="icon" className="w-14 h-14 bg-amber-800 rounded-full shadow-lg">
                              <Plus className="w-8 h-8"/>
                          </Button>
                        </Link>
                    </div>

                    <section className="bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Journal Insight</h2>
                        <div className="mb-6">
                            <p className="text-2xl font-bold">{insights.mostFrequentEmotion}</p>
                            <p className="text-gray-500">Most frequent emotion</p>
                        </div>
                        <div className="space-y-4 mb-6">
                             {sortedEmotions.map(emotion => {
                                const detail = emotionDetails[emotion];
                                const value = insights.emotionFrequency[emotion] || 0;
                                const totalEmotions = Object.values(insights.emotionFrequency).reduce((sum, count) => sum + count, 0);
                                const percentage = totalEmotions > 0 ? (value / totalEmotions) * 100 : 0;
                                return (
                                    <div key={emotion} className="flex items-center gap-3">
                                        <span className="text-sm font-medium w-6 text-right">{value}</span>
                                        <Progress value={percentage} className="w-full h-2" indicatorClassName={detail?.color || 'bg-gray-400'} />
                                        <div className="w-5 h-5">{detail?.icon}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-center text-sm text-gray-500">
                            You've been reflecting on positive experiences often this month. Keep it up!
                        </p>
                    </section>
                </main>
            </div>
            <NavFooter />
        </div>
    );
}