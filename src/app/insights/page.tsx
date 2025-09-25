'use client';
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { subDays, format, eachDayOfInterval } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Bell, Book, Plus, Smile, Meh, Frown, Angry, SmilePlus, BookOpen, Minus, Eye, Hourglass, ArrowUpRight } from 'lucide-react';
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

const StatCard = ({ value, label, icon, color, progress }: { value: number; label: string; icon: React.ReactNode; color: string; progress: number; }) => {
  const data = [
    { name: 'progress', value: progress, color: color },
    { name: 'remaining', value: 100 - progress, color: '#F3F4F6' },
  ];
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={40}
              startAngle={90}
              endAngle={450}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </div>
      <p className="font-bold text-2xl mt-2">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
};

const BalanceCard = () => (
    <div className="bg-white/50 rounded-2xl p-4 flex justify-between items-start">
        <div className="flex flex-col h-full justify-between">
            <div>
                <h3 className="text-2xl font-bold">The balance</h3>
                <h3 className="text-2xl font-bold">of life today</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-8 invisible">
                <Hourglass className="w-4 h-4" />
                <span>15 min</span>
            </div>
        </div>
        <div className="flex flex-col h-full justify-between items-end">
             <svg width="100" height="100" viewBox="0 0 100 100" className="mt-[-1rem]">
                <path d="M 85.3,63.2 C 94.6,47.4 89.2,27.5 73.4,18.2 C 57.6,8.9 37.7,14.3 28.4,30.1 C 19.1,45.9 24.5,65.8 40.3,75.1 C 56.1,84.4 76,79 85.3,63.2 Z" fill="#99F6E4"></path>
                <circle cx="45" cy="45" r="4" fill="white"></circle>
                <circle cx="65" cy="45" r="4" fill="white"></circle>
                <path d="M 45 60 Q 55 70 65 60" stroke="red" fill="transparent" strokeWidth="3" />
            </svg>
            <ArrowUpRight className="w-6 h-6 text-gray-400" />
        </div>
    </div>
);

const TriggerCard = ({ title, character }: { title: string, character: React.ReactNode }) => (
    <div className="bg-white/50 rounded-2xl p-4 flex flex-col justify-between h-48">
        <div>
            <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <div className="flex justify-center my-2">
            {character}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
             <div className="flex items-center gap-2 invisible">
                <Hourglass className="w-4 h-4" />
                <span></span>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400" />
        </div>
    </div>
);

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
                <header className="grid grid-cols-3 items-center mb-8">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </div>
                    <h1 className="font-bold text-xl text-center">Self Journal</h1>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon">
                          <Bell className="w-6 h-6" />
                      </Button>
                    </div>
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
                    
                    <section className="grid grid-cols-3 gap-4 text-center mb-8">
                      <StatCard
                        value={insights.totalWords}
                        label="Total Words"
                        icon={<Eye className="w-6 h-6 text-amber-800" />}
                        color="#A16207"
                        progress={75}
                      />
                      <StatCard
                        value={insights.negativeCount}
                        label="Negative"
                        icon={<Minus className="w-6 h-6 text-red-500" />}
                        color="#EF4444"
                        progress={40}
                      />
                      <StatCard
                        value={insights.positiveCount}
                        label="Positive"
                        icon={<Plus className="w-6 h-6 text-green-500" />}
                        color="#22C55E"
                        progress={60}
                      />
                    </section>
                    <h2 className="text-lg font-bold mb-4">Journal Insight</h2>
                    <section className="bg-white p-6 rounded-2xl shadow-sm mb-8">
                        
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

                    <section className="space-y-4">
                        <BalanceCard />
                        <div className="grid grid-cols-2 gap-4">
                           <TriggerCard 
                                title="Your source of negativity" 
                                character={
                                     <svg width="80" height="80" viewBox="0 0 100 100">
                                        <path d="M 85.3,63.2 C 94.6,47.4 89.2,27.5 73.4,18.2 C 57.6,8.9 37.7,14.3 28.4,30.1 C 19.1,45.9 24.5,65.8 40.3,75.1 C 56.1,84.4 76,79 85.3,63.2 Z" fill="#A5B4FC"></path>
                                        <rect x="40" y="55" width="30" height="5" fill="black" />
                                        <rect x="40" y="45" width="10" height="5" fill="black" />
                                        <rect x="60" y="45" width="10" height="5" fill="black" />
                                    </svg>
                                }
                            />
                             <TriggerCard 
                                title="Triggers of bad moods" 
                                character={
                                     <svg width="80" height="80" viewBox="0 0 100 100">
                                        <path d="M 85.3,63.2 C 94.6,47.4 89.2,27.5 73.4,18.2 C 57.6,8.9 37.7,14.3 28.4,30.1 C 19.1,45.9 24.5,65.8 40.3,75.1 C 56.1,84.4 76,79 85.3,63.2 Z" fill="#FDBA74"></path>
                                        <path d="M 40 45 Q 45 40 50 45" stroke="black" fill="transparent" strokeWidth="3" />
                                        <path d="M 60 45 Q 65 40 70 45" stroke="black" fill="transparent" strokeWidth="3" />
                                        <path d="M 45 60 C 50 55, 60 55, 65 60 L 60 70 L 50 70 Z" stroke="black" fill="transparent" strokeWidth="3" />
                                    </svg>
                                }
                            />
                        </div>
                    </section>

                </main>
            </div>
            <NavFooter />
        </div>
    );
}
