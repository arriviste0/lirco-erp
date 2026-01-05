'use server';
/**
 * @fileOverview Classifies and summarizes emails based on their content.
 *
 * - classifyAndSummarizeEmail - A function that handles the email classification and summarization process.
 * - ClassifyAndSummarizeEmailInput - The input type for the classifyAndSummarizeEmail function.
 * - ClassifyAndSummarizeEmailOutput - The return type for the classifyAndSummarizeEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyAndSummarizeEmailInputSchema = z.object({
  emailContent: z.string().describe('The content of the email to be classified and summarized.'),
});
export type ClassifyAndSummarizeEmailInput = z.infer<typeof ClassifyAndSummarizeEmailInputSchema>;

const ClassifyAndSummarizeEmailOutputSchema = z.object({
  classification: z.enum(['RFQ', 'Follow-up', 'Complaint', 'Payment', 'General']).describe('The classification of the email.'),
  summary: z.string().describe('A brief summary of the email content.'),
});
export type ClassifyAndSummarizeEmailOutput = z.infer<typeof ClassifyAndSummarizeEmailOutputSchema>;

export async function classifyAndSummarizeEmail(input: ClassifyAndSummarizeEmailInput): Promise<ClassifyAndSummarizeEmailOutput> {
  return classifyAndSummarizeEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyAndSummarizeEmailPrompt',
  input: {schema: ClassifyAndSummarizeEmailInputSchema},
  output: {schema: ClassifyAndSummarizeEmailOutputSchema},
  prompt: `You are an AI assistant tasked with classifying and summarizing emails.

  Classify the following email based on its content into one of the following categories: RFQ, Follow-up, Complaint, Payment, or General.
  Provide a brief summary of the email content.

  Email Content: {{{emailContent}}}

  Classification: 
  Summary: `,
});

const classifyAndSummarizeEmailFlow = ai.defineFlow(
  {
    name: 'classifyAndSummarizeEmailFlow',
    inputSchema: ClassifyAndSummarizeEmailInputSchema,
    outputSchema: ClassifyAndSummarizeEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
