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
import { ArrowUpFromLine, ChevronLeft, ChevronRight, Home, LineChart, Search, Sparkles, Settings, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, emotionToMood } from '@/lib/utils';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import html2canvas from 'html2canvas';
import NavFooter from '@/components/shared/footer';


const MoodEmoji = ({ mood }: { mood: string }) => {
  const emojiStyle: React.CSSProperties = {
    fontFamily: 'Apple Color Emoji, Segoe UI Emoji, NotoColorEmoji, sans-serif',
    fontSize: '32px', // Adjusted for better fit
    lineHeight: '1',
  };

  return (
    <div className="flex items-center justify-center h-full w-full">
      <span style={emojiStyle}>{mood}</span>
    </div>
  );
};

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [dailyMoods, setDailyMoods] = useState<{ [key: string]: { emoji: string; color: string } }>({});
  const [entriesByDate, setEntriesByDate] = useState<{ [key: string]: boolean }>({});

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
    
    for (const day in dailyEntries) {
        const dayEntries = dailyEntries[day];
        if (dayEntries.length > 0) {
            const avgMoodScore = dayEntries.reduce((sum, entry) => sum + (entry.mood_score || 0), 0) / dayEntries.length;
            
            let avgEmotion = 'Neutral';
            if (avgMoodScore >= 8) avgEmotion = 'Joyful';
            else if (avgMoodScore >= 6) avgEmotion = 'Happy';
            else if (avgMoodScore >= 5) avgEmotion = 'Content';
            else if (avgMoodScore >= 4) avgEmotion = 'Calm';
            else if (avgMoodScore >= 3) avgEmotion = 'Anxious';
            else if (avgMoodScore >= 2) avgEmotion = 'Sad';
            else if (avgMoodScore > 0) avgEmotion = 'Angry';

            const moodLook = emotionToMood(avgEmotion);
            if(moodLook) {
                moods[day] = moodLook;
            }
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
    // This event is triggered when entries are updated in other tabs
    window.addEventListener('journalEntriesChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('journalEntriesChanged', handleStorageChange);
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

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) =>
    format(new Date(currentDate.getFullYear(), i), 'MMMM')
  ), [currentDate]);
  
  const hasEntryForDate = (date: Date) => {
    if (!isClient) return false;
    const dateString = format(date, 'yyyy-MM-dd');
    return !!entriesByDate[dateString];
  };

  return (
    <div
      className="h-screen w-full bg-[#F3F7F2] flex flex-col font-sans text-gray-700"
    >
       <div ref={calendarRef} className="flex-1 pb-24">
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
            const dateString = format(day, 'yyyy-MM-dd');
            const hasEntry = isClient && hasEntryForDate(day);
            const mood = isClient ? getMoodForDate(day) : null;
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
                    {isClient && mood && hasEntry && <MoodEmoji mood={mood.emoji} />}
                  </div>
                  <span
                    className={cn(
                      'mt-2 text-sm',
                      isClient && isToday(day)
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

       <NavFooter />
    </div>
  );
}

    