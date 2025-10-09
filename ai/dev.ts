'use client';
import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-journal-entries.ts';
import '@/ai/flows/provide-emotional-insights.ts';
import '@/ai/flows/generate-self-reflection-prompts.ts';
import '@/ai/flows/get-balance-of-life-insight.ts';
import '@/ai/flows/get-negative-source-insight.ts';
import '@/ai/flows/get-bad-mood-triggers-insight.ts';
import '@/ai/flows/continue-conversation.ts';
import '@/ai/flows/summarize-conversation.ts';
