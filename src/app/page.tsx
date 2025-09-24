import { JournalEditor } from '@/components/journal-editor';
import { BookMarked } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <BookMarked className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-2xl font-bold font-headline tracking-tight">
              Reflectify
            </h1>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <JournalEditor />
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            Your personal space to think, feel, and grow.
          </p>
        </div>
      </footer>
    </div>
  );
}
