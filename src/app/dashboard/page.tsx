'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import { ArrowUpFromLine, ChevronLeft, ChevronRight, Home, LineChart, Search, Sparkles, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import html2canvas from 'html2canvas';

// Helper to map sentiment to mood
const sentimentToMood = (sentiment: string) => {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return { emoji: '😊', color: '' };
    case 'very positive':
      return { emoji: '😃', color: '' };
    case 'negative':
      return { emoji: '😟', color: '' };
    case 'very negative':
      return { emoji: '😠', color: '' };
    case 'neutral':
      return { emoji: '😐', color: '' };
    case 'mixed':
        return { emoji: '🙂', color: '' };
    default:
      return { emoji: '🙂', color: '' };
  }
};


const MoodEmoji = ({ mood }: { mood: string }) => {
  const emojiStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
  };

  switch (mood) {
    case '😊': // Smiling face with smiling eyes
    case '😃': // Grinning face with big eyes
      return (
         <svg viewBox="0 0 128 128" style={emojiStyle}>
          <foreignObject width="128" height="128">
            <div className="flex items-center justify-center h-full">
              <span style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, NotoColorEmoji, sans-serif', fontSize: '112px' }}>😄</span>
            </div>
          </foreignObject>
        </svg>
      );
    case '🙂': // Slightly smiling face
       return (
        <svg viewBox="0 0 128 128" style={emojiStyle}>
          <foreignObject width="128" height="128">
            <div className="flex items-center justify-center h-full">
              <span style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, NotoColorEmoji, sans-serif', fontSize: '112px' }}>🙂</span>
            </div>
          </foreignObject>
        </svg>
      );
    case '😐': // Neutral face
       return (
        <svg viewBox="0 0 128 128" style={emojiStyle}>
          <foreignObject width="128" height="128">
            <div className="flex items-center justify-center h-full">
              <span style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, NotoColorEmoji, sans-serif', fontSize: '112px' }}>😐</span>
            </div>
          </foreignObject>
        </svg>
      );
    case '😟': // Worried face
      return (
        <svg viewBox="0 0 128 128" style={emojiStyle}>
          <foreignObject width="128" height="128">
            <div className="flex items-center justify-center h-full">
              <span style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, NotoColorEmoji, sans-serif', fontSize: '112px' }}>😟</span>
            </div>
          </foreignObject>
        </svg>
      );
    case '😠': // Angry face
       return (
        <svg viewBox="0 0 128 128" style={emojiStyle}>
          <foreignObject width="128" height="128">
            <div className="flex items-center justify-center h-full">
              <span style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, NotoColorEmoji, sans-serif', fontSize: '112px' }}>😠</span>
            </div>
          </foreignObject>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 128 128" style={emojiStyle}>
          <foreignObject width="128" height="128">
            <div className="flex items-center justify-center h-full">
              <span style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, NotoColorEmoji, sans-serif', fontSize: '112px' }}>🙂</span>
            </div>
          </foreignObject>
        </svg>
      );
  }
};

const NavLink = ({ href, icon: Icon, label, activePath }: { href: string, icon: React.ElementType, label: string, activePath: string }) => {
    const isActive = activePath === href;
    return (
        <Link href={href} className={cn("flex flex-col items-center text-xs gap-1 relative", isActive ? 'text-white' : 'text-white/70')}>
            {isActive && <div className="absolute top-[-4px] h-1 w-6 rounded-full bg-cyan-400"></div>}
            <Icon />
            <span>{label}</span>
        </Link>
    );
};


export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [dailyMoods, setDailyMoods] = useState<{ [key: string]: { emoji: string; color: string } }>({});
  const [entriesByDate, setEntriesByDate] = useState<{ [key: string]: boolean }>({});
  const pathname = usePathname();

  const calendarRef = useRef<HTMLDivElement>(null);

  const calculateDailyMoods = useCallback(() => {
    const storedEntriesJson = localStorage.getItem('journalEntries');
    const entries = storedEntriesJson ? JSON.parse(storedEntriesJson) : [];
    
    if (entries.length === 0) {
      setDailyMoods({});
      setEntriesByDate({});
      return;
    }

    const dailyEntries: { [key: string]: any[] } = {};
    const newEntriesByDate: { [key: string]: boolean } = {};

    for (const entry of entries) {
      const day = format(new Date(entry.entry_date), 'yyyy-MM-dd');
      if (!dailyEntries[day]) {
        dailyEntries[day] = [];
      }
      dailyEntries[day].push(entry);
      newEntriesByDate[day] = true;
    }
    
    const moods: { [key: string]: { emoji: string; color: string } } = {};
    const moodScores: { [key: number]: number } = {
        1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8
    };

    for (const day in dailyEntries) {
        const dayEntries = dailyEntries[day];
        if (dayEntries.length > 0) {
            const totalScore = dayEntries.reduce((acc, entry) => acc + (moodScores[entry.mood_score] || 4), 0);
            const avgScore = Math.round(totalScore / dayEntries.length);
            
            const moodMap: { [key: number]: string } = {
                1: 'negative', 2: 'negative', 3: 'negative', 4: 'neutral', 5: 'neutral', 6: 'positive', 7: 'positive', 8: 'positive'
            };

            const sentiment = moodMap[avgScore] || 'neutral';
            moods[day] = sentimentToMood(sentiment);
        }
    }

    setDailyMoods(moods);
    setEntriesByDate(newEntriesByDate);
  }, []);

  useEffect(() => {
    setIsClient(true);
    calculateDailyMoods();

    const handleStorageChange = () => {
      calculateDailyMoods();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [calculateDailyMoods]);


  const getMoodForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return dailyMoods[dateString] || null;
  };


  const handleShare = async () => {
    if (calendarRef.current) {
      const canvas = await html2canvas(calendarRef.current, { backgroundColor: null });
      const dataUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'dashboard.png', { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'My Mood Calendar',
            text: `Check out my mood for ${format(
              currentDate || new Date(),
              'MMMM yyyy'
            )}!`,
          });
        } catch (error) {
          console.error('Error sharing:', error);
        }
      } else {
        // Fallback for browsers that don't support sharing files
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'dashboard.png';
        link.click();
      }
    }
  };

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });
  const startingDayIndex = getDay(firstDayOfMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const months = Array.from({ length: 12 }, (_, i) =>
    format(new Date(currentDate.getFullYear(), i), 'MMMM')
  );
  
  const hasEntryForDate = (date: Date) => {
    if (!isClient) return false;
    const dateString = format(date, 'yyyy-MM-dd');
    return !!entriesByDate[dateString];
  };

  return (
    <div
      className="h-screen w-full bg-[#F3F7F2] flex flex-col font-sans text-gray-700"
    >
       <div ref={calendarRef} className="flex-1">
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={prevMonth} size="icon">
            <ChevronLeft />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-xl font-semibold">
                {format(currentDate, 'MMM yyyy')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {months.map((month) => (
                <DropdownMenuItem
                  key={month}
                  onClick={() =>
                    setCurrentDate(
                      new Date(currentDate.getFullYear(), months.indexOf(month))
                    )
                  }
                >
                  {month}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" onClick={nextMonth} size="icon">
            <ChevronRight />
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <ArrowUpFromLine className="w-6 h-6" />
        </Button>
      </header>
      <main className="flex-1 px-4">
        <div className="grid grid-cols-7 gap-y-2 text-center text-gray-400 text-sm mb-4">
          {weekDays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-4 text-center">
          {Array.from({ length: startingDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {daysInMonth.map((day) => {
            if (!isClient) {
              // Initial render on both server and client
              return (
                 <Link href="/new-entry" key={day.toString()} passHref>
                  <div className="flex flex-col items-center cursor-pointer">
                    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', 'bg-gray-200')}>
                    </div>
                    <span
                      className={cn(
                        'mt-2 text-sm',
                        isToday(day) ? 'bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                </Link>
              );
            }
            
            // Client-side only render
            const mood = getMoodForDate(day);
            const hasEntry = hasEntryForDate(day);
            const dateString = format(day, 'yyyy-MM-dd');
            const linkHref = hasEntry
              ? `/timeline?date=${dateString}`
              : `/new-entry?date=${dateString}`;

            return (
              <Link href={linkHref} key={day.toString()} passHref>
                <div className="flex flex-col items-center cursor-pointer transform transition-transform hover:scale-110">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center overflow-hidden',
                       !mood || !hasEntry ? 'bg-gray-200' : ''
                    )}
                  >
                    {mood && hasEntry && <MoodEmoji mood={mood.emoji} />}
                  </div>
                  <span
                    className={cn(
                      'mt-2 text-sm',
                      isToday(day)
                        ? 'bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                        : ''
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      </div>

       <footer className="fixed bottom-4 left-4 right-4 z-50">
        <div className="relative max-w-sm mx-auto">
          <div className="bg-black/70 backdrop-blur-lg rounded-full p-2 flex items-center justify-around text-white">
            <NavLink href="/dashboard" icon={Home} label="Home" activePath={pathname} />
            <NavLink href="/timeline" icon={Search} label="History" activePath={pathname} />
            {/* Placeholder for the middle button */}
            <div className="w-12 h-12"></div>
            <NavLink href="/insights" icon={LineChart} label="Insights" activePath={pathname} />
            <NavLink href="/settings" icon={Settings} label="Settings" activePath={pathname} />
          </div>
          <Link href="/new-entry">
            <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center cursor-pointer shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </Link>
        </div>
      </footer>
    </div>
  );
}
