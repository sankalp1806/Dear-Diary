'use client';
import React, { useState, useEffect, useRef } from 'react';
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
import { ArrowUpFromLine, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Mock data for moods. In a real app, this would come from daily sentiment analysis.
// Let's assume some days have entries and some don't.
const mockEntries: { [key: string]: { mood: string } } = {
  [format(new Date(), 'yyyy-MM-dd')]: { mood: '😊' }, // Today
  [format(subMonths(new Date(), 0).setDate(15), 'yyyy-MM-dd')]: { mood: '🙂' },
  [format(subMonths(new Date(), 0).setDate(3), 'yyyy-MM-dd')]: { mood: '😐' },
  [format(subMonths(new Date(), 0).setDate(21), 'yyyy-MM-dd')]: { mood: '😟' },
};

const getMockMoodForDate = (date: Date) => {
  const dateString = format(date, 'yyyy-MM-dd');
  const entry = mockEntries[dateString];

  if (!entry) {
    return null; // No entry for this date
  }

  const moods = ['😊', '🙂', '😐', '😟', '😠'];
  const colors = [
    'bg-yellow-300', // Happy
    'bg-lime-300', // Calm
    'bg-green-400', // Neutral
    'bg-teal-500', // Anxious
    'bg-slate-500', // Angry
  ];
  const moodIndex = moods.indexOf(entry.mood);
  return {
    emoji: entry.mood,
    color: colors[moodIndex] || colors[2],
  };
};

const MoodEmoji = ({ mood }: { mood: string }) => {
  switch (mood) {
    case '😊':
      return (
        <div className="w-full h-full rounded-full flex items-center justify-center text-black text-2xl font-bold">
          :D
        </div>
      );
    case '🙂':
      return (
        <div className="w-full h-full rounded-full flex items-center justify-center text-black text-xl">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 14C8.5 15.5 10.5 16.5 12 16.5C13.5 16.5 15.5 15.5 16 14"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M9 9.5C9 10.0523 8.55228 10.5 8 10.5C7.44772 10.5 7 10.0523 7 9.5C7 8.94772 7.44772 8.5 8 8.5C8.55228 8.5 9 8.94772 9 9.5Z"
              fill="black"
            />
            <path
              d="M15 9.5C15 10.0523 14.5523 10.5 14 10.5C13.4477 10.5 13 10.0523 13 9.5C13 8.94772 13.4477 8.5 14 8.5C14.5523 8.5 15 8.94772 15 9.5Z"
              fill="black"
            />
          </svg>
        </div>
      );
    case '😐':
      return (
        <div className="w-full h-full rounded-full flex items-center justify-center text-black text-xl">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 14H16"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M9 9.5C9 10.0523 8.55228 10.5 8 10.5C7.44772 10.5 7 10.0523 7 9.5C7 8.94772 7.44772 8.5 8 8.5C8.55228 8.5 9 8.94772 9 9.5Z"
              fill="black"
            />
            <path
              d="M15 9.5C15 10.0523 14.5523 10.5 14 10.5C13.4477 10.5 13 10.0523 13 9.5C13 8.94772 13.4477 8.5 14 8.5C14.5523 8.5 15 8.94772 15 9.5Z"
              fill="black"
            />
          </svg>
        </div>
      );
    case '😟':
      return (
        <div className="w-full h-full rounded-full flex items-center justify-center text-black text-xl">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 15C8.5 13.5 10.5 12.5 12 12.5C13.5 12.5 15.5 13.5 16 15"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M9 9.5C9 10.0523 8.55228 10.5 8 10.5C7.44772 10.5 7 10.0523 7 9.5C7 8.94772 7.44772 8.5 8 8.5C8.55228 8.5 9 8.94772 9 9.5Z"
              fill="black"
            />
            <path
              d="M15 9.5C15 10.0523 14.5523 10.5 14 10.5C13.4477 10.5 13 10.0523 13 9.5C13 8.94772 13.4477 8.5 14 8.5C14.5523 8.5 15 8.94772 15 9.5Z"
              fill="black"
            />
          </svg>
        </div>
      );
    case '😠':
      return (
        <div className="w-full h-full rounded-full flex items-center justify-center text-black text-xl">
          <svg
            width="24"
            height="24"
            viewBox="uncal24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 16C8.5 14.5 10.5 13.5 12 13.5C13.5 13.5 15.5 14.5 16 16"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              transform="translate(0, -2)"
            />
            <path
              d="M9.5 10C9.5 10.5523 9.05228 11 8.5 11C7.94772 11 7.5 10.5523 7.5 10"
              stroke="black"
              strokeWidth="1.5"
              transform="rotate(20 9.5 10)"
            />
            <path
              d="M14.5 10C14.5 10.5523 14.0523 11 13.5 11C12.9477 11 12.5 10.5523 12.5 10"
              stroke="black"
              strokeWidth="1.5"
              transform="rotate(-20 14.5 10)"
            />
          </svg>
        </div>
      );
    default:
      return null;
  }
};

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentDate(new Date());
    setIsClient(true);
  }, []);

  const handleShare = async () => {
    if (calendarRef.current) {
      const canvas = await html2canvas(calendarRef.current);
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

  if (!isClient || !currentDate) {
    return (
      <div className="h-screen w-full bg-[#F3F7F2] flex items-center justify-center">
        {/* You can add a loading spinner here */}
      </div>
    );
  }

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

  return (
    <div
      className="h-screen w-full bg-[#F3F7F2] flex flex-col font-sans text-gray-700"
      ref={calendarRef}
    >
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
            const mood = getMockMoodForDate(day);
            const hasEntry = !!mood;
            const linkHref = hasEntry
              ? `/timeline?date=${format(day, 'yyyy-MM-dd')}`
              : '/new-entry';

            return (
              <Link href={linkHref} key={day.toString()} passHref>
                <div className="flex flex-col items-center cursor-pointer">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      mood ? mood.color : 'bg-gray-200'
                    )}
                  >
                    {mood && <MoodEmoji mood={mood.emoji} />}
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

      <footer className="p-4 bg-transparent sticky bottom-0">
        <Link href="/new-entry" className="flex-1"></Link>
      </footer>
    </div>
  );
}