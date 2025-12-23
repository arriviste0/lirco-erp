'use server';

import { classifyAndSummarizeEmail } from '@/ai/flows/classify-and-summarize-email';
import { draftEmailReplyAndSuggestActions } from '@/ai/flows/draft-email-reply-and-suggest-actions';
import { z } from 'zod';

const emailContentSchema = z.object({
  emailContent: z.string(),
});

export async function getClassifyAndSummarize(data: { emailContent: string }) {
  const parsed = emailContentSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid input');
  }
  return await classifyAndSummarizeEmail({ emailContent: parsed.data.emailContent });
}

export async function getDraftReply(data: { emailContent: string }) {
  const parsed = emailContentSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid input');
  }
  return await draftEmailReplyAndSuggestActions({ emailContent: parsed.data.emailContent });
}
