'use client';

import { useActionState, useEffect, useState, useOptimistic, useTransition } from 'react';
import { analyzeEntryAction, generatePromptsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BrainCircuit,
  Lightbulb,
  Mic,
  Send,
  Sparkles,
  StopCircle,
  Tag,
  RefreshCw,
  Wind,
} from 'lucide-react';
import type { AnalysisState, PromptsState } from '@/lib/types';

export function JournalEditor() {
  const { toast } = useToast();
  const [entryText, setEntryText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const [analysisState, analysisFormAction, isAnalyzing] = useActionState(analyzeEntryAction, null);
  const [promptsState, promptsFormAction, isGeneratingPrompts] = useActionState(generatePromptsAction, null);

  useEffect(() => {
    promptsFormAction();
  }, [promptsFormAction]);

  useEffect(() => {
    if (analysisState?.error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Error',
        description: analysisState.error,
      });
    }
  }, [analysisState, toast]);

  useEffect(() => {
    if (promptsState?.error) {
      toast({
        variant: 'destructive',
        title: 'Prompt Generation Error',
        description: promptsState.error,
      });
    }
  }, [promptsState, toast]);

  const handleVoiceRecording = async () => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        recorder.start();
        recorder.ondataavailable = () => {
          setEntryText(prev => prev + (prev ? ' ' : '') + '[Voice note transcribed...]');
          stream.getTracks().forEach(track => track.stop());
        };
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast({
          variant: 'destructive',
          title: 'Microphone Error',
          description: 'Could not access the microphone. Please check your browser permissions.',
        });
      }
    }
  };
  
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (entryText.length >= 10 && !isAnalyzing) {
        (e.target as HTMLTextAreaElement).form?.requestSubmit();
      }
    }
  }

  const handlePromptClick = (prompt: string) => {
    setEntryText(prompt);
  }

  return (
    <div className="container grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">My Journal</CardTitle>
            <CardDescription>What&apos;s on your mind today? You can use Ctrl+Enter to save.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <form action={analysisFormAction} className="flex-1 flex flex-col space-y-4">
              <input type="hidden" name="entry" value={entryText} />
              <Textarea
                placeholder="Start writing, or use a prompt..."
                className="flex-1 text-base resize-none"
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                rows={15}
              />
              <div className="flex items-center justify-between">
                <Button type="button" variant="ghost" size="icon" onClick={handleVoiceRecording} aria-label={isRecording ? 'Stop recording' : 'Start recording'}>
                  {isRecording ? <StopCircle className="text-red-500" /> : <Mic />}
                </Button>
                <Button type="submit" disabled={isAnalyzing || entryText.length < 10}>
                  {isAnalyzing ? 'Analyzing...' : 'Save Entry'}
                  <Send className="ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between font-headline">
              Reflection Prompts
              <form action={promptsFormAction}>
                  <Button type="submit" variant="ghost" size="icon" disabled={isGeneratingPrompts} aria-label="Get new prompts">
                    <RefreshCw className={isGeneratingPrompts ? 'animate-spin' : ''}/>
                  </Button>
              </form>
            </CardTitle>
            <CardDescription>Feeling stuck? Try one of these.</CardDescription>
          </CardHeader>
          <CardContent>
            {isGeneratingPrompts && !promptsState?.data ? (
                <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-6 w-full" />
                </div>
            ) : (
                <ul className="space-y-3">
                {promptsState?.data?.prompts.slice(0, 3).map((prompt, i) => (
                    <li key={i} className="text-sm text-foreground/80 hover:text-foreground transition-colors cursor-pointer flex items-start gap-2" onClick={() => handlePromptClick(prompt)}>
                        <Lightbulb className="h-4 w-4 shrink-0 mt-1 text-primary"/>
                        <span>{prompt}</span>
                    </li>
                ))}
                </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">AI Insights</CardTitle>
            <CardDescription>
              {analysisState?.data ? 'Here\'s what I gathered from your entry.' : 'Your insights will appear here after you save an entry.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isAnalyzing && (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
            )}
            {analysisState?.data && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div>
                  <h3 className="font-semibold flex items-center mb-2"><Wind className="mr-2 h-4 w-4"/>Overall Sentiment</h3>
                  <p className="text-sm capitalize text-muted-foreground">{analysisState.data.insights.overallSentiment}</p>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center mb-2"><Tag className="mr-2 h-4 w-4" />Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisState.data.categories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="capitalize">{cat}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center mb-2"><BrainCircuit className="mr-2 h-4 w-4"/>Emotional Patterns</h3>
                  <p className="text-sm text-muted-foreground">{analysisState.data.insights.emotionalPatterns}</p>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center mb-2"><Sparkles className="mr-2 h-4 w-4"/>Personalized Insights</h3>
                  <p className="text-sm text-muted-foreground">{analysisState.data.insights.personalizedInsights}</p>
                </div>
              </div>
            )}
            {!isAnalyzing && !analysisState?.data && (
                <div className="text-center text-muted-foreground py-8">
                    <p>No analysis yet.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
