'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Bell, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AudioWaveform = ({ isRecording }: { isRecording: boolean }) => {
  const barCount = 30;
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        const newBars = Array.from({ length: barCount }, () => Math.random());
        setBars(newBars);
      }, 150);
      return () => clearInterval(interval);
    } else {
      setBars(Array(barCount).fill(0.1));
    }
  }, [isRecording]);

  return (
    <div className="flex items-center justify-center h-24 w-full">
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-1 rounded-full mx-0.5"
          style={{
            height: `${2 + height * 80}%`,
            backgroundColor: isRecording ? '#8B572A' : '#D2B48C',
            opacity:
              isRecording &&
              index >= Math.floor(barCount / 2) - 3 &&
              index <= Math.floor(barCount / 2) + 3
                ? 1
                : isRecording
                ? 0.4
                : 0.2,
            transition: 'height 0.1s ease-in-out',
          }}
        ></div>
      ))}
    </div>
  );
};

export default function VoiceChatPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    setIsRecording(true);
    setTranscript('');

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'network') {
            toast({
                variant: 'destructive',
                title: 'Network Error',
                description: 'Speech recognition service is unavailable. Please check your network connection.',
            });
        }
        stopRecording();
      };
      
      recognitionRef.current.start();
    } else {
      console.warn('Speech Recognition not supported in this browser.');
      setTranscript("Sorry, your browser doesn't support voice recognition.");
       toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: "Your browser doesn't support voice recognition.",
      });
    }

    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const reset = () => {
    stopRecording();
    setElapsedTime(0);
    setTranscript('');
  }

  const handleSave = () => {
    // Navigate back and pass the transcript. A more robust solution would use a state manager.
    // For now we use local storage as a simple bridge.
    if (typeof window !== 'undefined' && transcript) {
        localStorage.setItem('voice-transcript', transcript);
    }
    stopRecording();
    router.push('/new-entry');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="h-screen w-full bg-[#FBF9F7] flex flex-col font-sans text-[#4A4A4A]">
      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
        <header className="flex items-center justify-between p-4 pt-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-7 h-7" />
          </Button>
          <h1 className="text-lg font-semibold">I'm All Ears...</h1>
          <Button variant="ghost" size="icon">
            <Bell className="w-6 h-6" />
          </Button>
        </header>

        <main className="flex-1 px-6 py-4 flex flex-col justify-center">
          <div className="text-3xl text-gray-500 h-48 overflow-y-auto">
            {transcript ? (
                <p>{transcript}</p>
            ): (
                <p className="text-gray-400">
                {isRecording ? "Listening..." : "Press record to start"}
                </p>
            )}
          </div>

          <div className="my-12">
            <AudioWaveform isRecording={isRecording} />
          </div>
        </main>

        <footer className="p-4 pb-8 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-full mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 text-red-500 rounded-full w-14 h-14"
              onClick={reset}
            >
              <X className="w-8 h-8" />
            </Button>

            <Button
              size="icon"
              className="bg-[#FF6B6B] text-white rounded-full w-20 h-20 shadow-lg hover:bg-[#ff4f4f]"
              onClick={handleToggleRecording}
            >
              <div className="w-8 h-8 bg-white" style={{ borderRadius: isRecording ? '4px' : '9999px', transition: 'border-radius 0.2s ease-in-out' }}/>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 text-green-500 rounded-full w-14 h-14"
              onClick={handleSave}
              disabled={!transcript && !isRecording}
            >
              <Check className="w-8 h-8" />
            </Button>
          </div>
           <span className="text-lg text-gray-600">{formatTime(elapsedTime)}</span>
        </footer>
      </div>
    </div>
  );
}
