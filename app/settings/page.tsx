'use client';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ChevronRight, User, Bell, Lock, LogOut, HelpCircle, FileText } from 'lucide-react';
import NavFooter from '@/components/shared/footer';

const SettingsItem = ({ icon, label, hasSwitch, isLast }: { icon: React.ElementType, label: string, hasSwitch?: boolean, isLast?: boolean }) => (
    <>
        <div className="flex items-center py-4">
            <div className="flex items-center gap-4 flex-1">
                {React.createElement(icon, { className: "w-6 h-6 text-gray-500" })}
                <span className="text-lg">{label}</span>
            </div>
            {hasSwitch ? <Switch /> : <ChevronRight className="w-6 h-6 text-gray-400" />}
        </div>
        {!isLast && <Separator />}
    </>
);

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-24">
      <div className="container mx-auto px-4 py-6">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
        </header>

        <main>
          <section className="bg-white p-4 rounded-2xl shadow-sm mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-xl">Jane Doe</p>
                <p className="text-gray-500">jane.doe@example.com</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-4 rounded-2xl shadow-sm mb-8">
            <SettingsItem icon={User} label="Account" />
            <SettingsItem icon={Bell} label="Notifications" hasSwitch />
            <SettingsItem icon={Lock} label="Privacy" isLast />
          </section>

          <section className="bg-white p-4 rounded-2xl shadow-sm mb-8">
            <SettingsItem icon={HelpCircle} label="Help & Support" />
            <SettingsItem icon={FileText} label="Terms and Condition" isLast />
          </section>

          <section className="bg-white p-4 rounded-2xl shadow-sm">
            <div className="flex items-center py-2">
               <div className="flex items-center gap-4 flex-1 text-red-500">
                <LogOut className="w-6 h-6" />
                <span className="text-lg">Logout</span>
              </div>
            </div>
          </section>
        </main>
      </div>
      <NavFooter />
    </div>
  );
}
