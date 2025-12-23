import { config } from 'dotenv';
config();

import '@/ai/flows/classify-and-summarize-email.ts';
import '@/ai/flows/draft-email-reply-and-suggest-actions.ts';