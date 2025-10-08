'use client';
import React, { useState, useEffect, useActionState, useRef, useTransition } from 'react';
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
  Bot,
  User,
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { generatePromptsAction, getSentimentForEntry, continueConversationAction, getConversationSummaryAction } from '@/app/actions';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export default function NewEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [content, setContent] = useState<string | ChatMessage[]>('');
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [currentInsights, setCurrentInsights] = useState<string[]>([]);

  const [promptsState, generatePromptsFormAction] = useActionState(
    generatePromptsAction,
    null
  );

  const [isChatMode, setIsChatMode] = useState(false);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setIsClient(true);
    const dateStr = searchParams.get('date');
    const view = searchParams.get('view');
    setIsViewMode(view === 'true');

    // If we are not viewing an existing entry, set up a new one
    if (view !== 'true') {
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
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const voiceTranscript = localStorage.getItem('voice-transcript');
      if (voiceTranscript) {
        setContent((prev) =>
          typeof prev === 'string' ? (prev ? `${prev}\n${voiceTranscript}` : voiceTranscript) : prev
        );
        localStorage.removeItem('voice-transcript');
      }

      const entryToEditJson = localStorage.getItem('entryToEdit');
      if (entryToEditJson) {
        const entryToEdit = JSON.parse(entryToEditJson);
        
        if (entryToEdit.isChat && Array.isArray(entryToEdit.content)) {
          setIsChatMode(true);
          setConversation(entryToEdit.content);
          setContent(entryToEdit.content);
        } else {
           setContent(entryToEdit.content);
        }

        if (entryToEdit.entry_date && isValid(new Date(entryToEdit.entry_date))) {
            setEntryDate(new Date(entryToEdit.entry_date));
        }
        // Clean up so it doesn't load again on new entries unless it's for editing
        if (!isViewMode) {
          localStorage.removeItem('entryToEdit');
        }
      }
    }
  }, [isViewMode]);

  useEffect(() => {
    if (promptsState?.success && promptsState.data?.prompts) {
      const randomPrompt =
        promptsState.data.prompts[
          Math.floor(Math.random() * promptsState.data.prompts.length)
        ];
      setContent((prev) => typeof prev === 'string' ? `${prev}${prev ? '\n\n' : ''}${randomPrompt}\n` : prev);
    } else if (promptsState?.error) {
      toast({
        variant: 'destructive',
        title: 'Error generating prompt',
        description: promptsState.error,
      });
    }
  }, [promptsState, toast]);

    useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);
    
    useEffect(() => {
    // When navigating away, clear the view-only data
    return () => {
      if (isViewMode) {
        localStorage.removeItem('entryToEdit');
        localStorage.removeItem('entryToEditId');
      }
    };
  }, [isViewMode]);

  const saveEntry = async () => {
    if (isViewMode) {
        return;
    }
    const isContentEmpty = isChatMode ? conversation.length === 0 : !content;

    if (isContentEmpty || (typeof content === 'string' && content.length < 10)) {
      if (!isChatMode) {
          toast({
          variant: 'destructive',
          title: 'Entry too short',
          description: 'Journal entry must be at least 10 characters long.',
        });
      }
      return;
    }
    
    const finalContent = isChatMode ? conversation : content;
    const entryTextForAnalysis = isChatMode
      ? conversation.map(m => `${m.sender === 'ai' ? 'AI' : 'Me'}: ${m.text}`).join('\n')
      : (content as string);

    const analysisResult = await getSentimentForEntry(entryTextForAnalysis);
    const primaryEmotion = analysisResult?.emotion || 'Neutral';
    const overallSentiment = analysisResult?.overallSentiment?.toLowerCase() || 'neutral';
    const summary = analysisResult.summary;
    const insights = analysisResult.insights;


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

      if (entryToEditId && !isViewMode) {
        // Update existing entry
        const updatedEntries = existingEntries.map((entry: any) => 
          entry.id === entryToEditId 
            ? { ...entry, content: finalContent, entry_date: entryDate.toISOString(), sentiment: overallSentiment, mood_score, emotion: primaryEmotion, isChat: isChatMode, summary, insights }
            : entry
        );
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        localStorage.removeItem('entryToEditId');
        localStorage.removeItem('entryToEdit');
      } else if (!isViewMode) {
        // Add new entry
        const newEntry = {
          id: new Date().toISOString(),
          content: finalContent,
          entry_date: entryDate.toISOString(),
          mood_score: mood_score,
          sentiment: overallSentiment,
          emotion: primaryEmotion,
          category: 'feelings',
          isChat: isChatMode,
          summary,
          insights,
        };
        const updatedEntries = [...existingEntries, newEntry];
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      }
      // Dispatch a custom event to notify other components of the change
      window.dispatchEvent(new CustomEvent('journalEntriesChanged'));
    }
  }

  const handleSendOrSave = async () => {
    if (isChatMode) {
      // In chat mode, the button sends a message
      await handleChatSubmit();
    } else {
      // In normal mode, it saves the entry
      await saveEntry();
      router.push('/dashboard');
    }
  };

  const handleBack = async () => {
    await saveEntry();
    router.back();
  }


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

  const handleAiChatToggle = async () => {
    if (isViewMode) return;
    if (!isChatMode) {
      setIsChatMode(true);
      if (typeof content === 'string' && content.trim().length > 0) {
        const entryText = content;
        setContent('');
        setIsAiTyping(true);
        // 1. Process the diary entry to get insights for the conversation
        await getSentimentForEntry(entryText); // This now calls the python backend and populates insights
        
        // 2. Start the conversation
        const result = await continueConversationAction("Start the conversation based on the insights");
        setIsAiTyping(false);

        if (result.success && result.data) {
          setConversation([{ sender: 'ai', text: result.data.reply }]);
        } else {
          toast({
            variant: 'destructive',
            title: 'AI Error',
            description: result.error || 'Could not start conversation.',
          });
          setIsChatMode(false); // Revert if AI fails
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Entry is empty',
          description: 'Please write something in your journal before starting a chat.',
        });
        setIsChatMode(false);
      }
    } else {
      setIsChatMode(false);
      if (conversation.length > 0) {
        setContent(conversation.map(m => `${m.sender === 'ai' ? 'AI' : 'Me'}: ${m.text}`).join('\n'));
      } else {
        setContent('');
      }
    }
  };

  const handleChatSubmit = async (e?: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    } else if (e) {
      return;
    }
    
    if (!chatInput.trim() || isAiTyping || isViewMode) return;

    const newUserMessage: ChatMessage = { sender: 'user', text: chatInput };
    setConversation(prev => [...prev, newUserMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsAiTyping(true);

    const result = await continueConversationAction(currentInput);

    if (result.success && result.data) {
      setConversation(prev => [...prev, { sender: 'ai', text: result.data!.reply }]);
    } else {
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: result.error || 'Failed to get AI response.',
      });
      // remove the user message if AI fails
      setConversation(prev => prev.slice(0, prev.length - 1));
    }
    setIsAiTyping(false);
  };

  return (
    <div className="h-screen w-full bg-[#E0D3AF] flex flex-col font-sans">
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
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-800">{isViewMode ? 'Journal Entry' : "What's Up??"}</h1>
          <div className="w-10"></div>
        </header>

        <main className="flex-1 px-6 py-4 flex flex-col overflow-hidden">
         <Link href="/dashboard">
            <Button
              variant="outline"
              className="rounded-full bg-gray-200 border-gray-300"
            >
              <Clock className="w-4 h-4 mr-2" />
              {isClient && entryDate
                ? format(entryDate, 'MMM d, h:mm a')
                : 'Loading...'}
            </Button>
          </Link>

          <div className="flex-1 flex flex-col mt-6">
            {!isChatMode ? (
              <>
                <Textarea
                  name="entry"
                  placeholder="Write anything that's on your mind..."
                  value={typeof content === 'string' ? content : ''}
                  onChange={(e) => setContent(e.target.value)}
                  readOnly={isViewMode}
                  className="flex-1 text-2xl text-black bg-transparent border-none outline-none resize-none p-0 focus-visible:ring-0 placeholder:text-gray-400 read-only:cursor-default"
                />
              </>
            ) : (
               <div ref={chatContainerRef} className="flex-1 space-y-4 overflow-y-auto pr-2">
                {conversation.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'ai' && <Bot className="w-6 h-6 text-gray-500 shrink-0" />}
                    <div className={`p-3 rounded-lg max-w-md bg-[#EAE8E1]`}>
                      <p className="text-black whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.sender === 'user' && <User className="w-6 h-6 text-gray-500 shrink-0" />}
                  </div>
                ))}
                 {isAiTyping && (
                  <div className="flex items-start gap-3">
                    <Bot className="w-6 h-6 text-gray-500 shrink-0" />
                    <div className="p-3 rounded-lg bg-[#EAE8E1]">
                      <p className="text-gray-500 italic">typing...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <footer className={`p-4 mt-auto ${isViewMode && !isChatMode ? 'hidden' : ''}`}>
           {isChatMode ? (
             <div className={`bg-card rounded-lg shadow-lg p-2 flex items-center ${isViewMode ? 'hidden' : ''}`}>
                 <Textarea
                    placeholder="Message your AI friend..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatSubmit}
                    className="flex-1 bg-transparent border-none outline-none resize-none p-2 focus-visible:ring-0 placeholder:text-gray-400 text-black"
                    rows={1}
                    readOnly={isViewMode}
                />
              </div>
          ) : (
             <form action={(formData) => startTransition(() => generatePromptsFormAction(formData))}>
                 <p className={`text-center text-gray-400 text-sm mb-3 ${isViewMode ? 'hidden' : ''}`}>
                    Tap to continue your journal!
                </p>
            </form>
          )}

          <div className={`bg-white rounded-full shadow-lg p-2 flex items-center justify-around mt-3 ${isViewMode ? 'hidden' : ''}`}>
            <Link href="/voice-chat">
              <Button variant="ghost" size="icon" className="text-gray-600">
                <Mic className="w-6 h-6" />
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
             <Button variant="ghost" size="icon" className="text-gray-600" onClick={handleAiChatToggle}>
                <Sparkles className={`w-6 h-6 transition-colors ${isChatMode ? 'text-purple-600' : ''}`} />
              </Button>
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
              onClick={handleSendOrSave}
            >
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
