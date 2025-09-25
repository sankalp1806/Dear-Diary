'use client';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Bell, Book, Plus, Smile, Meh, Frown, Angry, SmilePlus } from 'lucide-react';
import NavFooter from '@/components/shared/footer';

const emotionData = [
  { emotion: 'Happy', value: 99, color: 'bg-green-400', icon: <Smile className="w-5 h-5 text-gray-500" /> },
  { emotion: 'Calm', value: 87, color: 'bg-yellow-400', icon: <SmilePlus className="w-5 h-5 text-gray-500" /> },
  { emotion: 'Neutral', value: 25, color: 'bg-amber-600', icon: <Meh className="w-5 h-5 text-gray-500" /> },
  { emotion: 'Anxious', value: 19, color: 'bg-orange-500', icon: <Frown className="w-5 h-5 text-gray-500" /> },
  { emotion: 'Angry', value: 7, color: 'bg-purple-500', icon: <Angry className="w-5 h-5 text-gray-500" /> },
];


const CircleStat = ({ value, label, color, icon }: { value: string, label: string, color: string, icon: React.ReactNode }) => (
    <div className="flex flex-col items-center gap-2">
        <div className="relative w-20 h-20">
            <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                    className="text-gray-200"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                />
                <path
                    className={color}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${parseInt(value, 10)}, 100`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {icon}
            </div>
        </div>
        <span className="font-bold text-lg">{value}</span>
        <span className="text-sm text-gray-500">{label}</span>
    </div>
);


export default function InsightsPage() {
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
                    <section className="text-center mb-8 p-6 bg-white/50 rounded-2xl">
                        <Book className="w-8 h-8 text-amber-700 mx-auto mb-2" />
                        <p className="text-7xl font-bold mb-1">257</p>
                        <p className="text-gray-600 mb-4">Total Journals</p>
                        <p className="text-sm text-gray-500">You need to write your first journal.</p>
                    </section>
                    
                    <section className="grid grid-cols-3 gap-4 text-center mb-8">
                        <CircleStat value="25,187" label="Total Words" color="text-amber-700" icon={<span className="text-amber-700 text-xl font-bold">◎</span>} />
                        <CircleStat value="115" label="Negative" color="text-pink-500" icon={<span className="text-pink-500 text-3xl font-light">-</span>} />
                        <CircleStat value="99" label="Positive" color="text-green-500" icon={<span className="text-green-500 text-2xl font-light">+</span>} />
                    </section>
                    
                    <div className="text-center mb-8">
                        <Button size="icon" className="w-14 h-14 bg-amber-800 rounded-full shadow-lg">
                            <Plus className="w-8 h-8"/>
                        </Button>
                    </div>


                    <section className="bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Journal Insight</h2>
                        <div className="mb-6">
                            <p className="text-2xl font-bold">Happy</p>
                            <p className="text-gray-500">Most frequent emotion</p>
                        </div>
                        <div className="space-y-4 mb-6">
                            {emotionData.map(item => (
                                <div key={item.emotion} className="flex items-center gap-3">
                                    <span className="text-sm font-medium w-6 text-right">{item.value}</span>
                                    <Progress value={item.value} className="w-full h-2" indicatorClassName={item.color} />
                                    <div className="w-5 h-5">{item.icon}</div>
                                </div>
                            ))}
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