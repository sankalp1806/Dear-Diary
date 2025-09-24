import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-journal-entries.ts';
import '@/ai/flows/provide-emotional-insights.ts';
import '@/ai/flows/generate-self-reflection-prompts.ts';