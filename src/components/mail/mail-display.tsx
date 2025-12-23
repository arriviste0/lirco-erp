'use client';

import type { Email } from '@/lib/types';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  getClassifyAndSummarize,
  getDraftReply,
} from '@/app/actions';
import { useState, useTransition } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Bot, FileText, Loader2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface MailDisplayProps {
  email: Email;
}

type AIEmailInfo = {
  classification: string;
  summary: string;
} | null;

type AIReplyInfo = {
  draftReply: string;
  suggestedActions: string[];
} | null;

export function MailDisplay({ email }: MailDisplayProps) {
  const { toast } = useToast();
  const [isClassifying, startClassifying] = useTransition();
  const [isDrafting, startDrafting] = useTransition();

  const [aiEmailInfo, setAIEmailInfo] = useState<AIEmailInfo>(null);
  const [aiReplyInfo, setAIReplyInfo] = useState<AIReplyInfo>(null);

  const handleClassify = () => {
    startClassifying(async () => {
      try {
        const result = await getClassifyAndSummarize({ emailContent: email.body });
        setAIEmailInfo(result);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to classify and summarize the email.',
        });
      }
    });
  };
  
  const handleDraftReply = () => {
    startDrafting(async () => {
      try {
        const result = await getDraftReply({ emailContent: email.body });
        setAIReplyInfo(result);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to draft a reply.',
        });
      }
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-start p-4">
        <div className="flex items-start gap-4 text-sm">
          <Avatar>
            <AvatarImage alt={email.from.name} src={email.from.avatar} />
            <AvatarFallback>
              {email.from.name
                .split(' ')
                .map((chunk) => chunk[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <div className="font-semibold">{email.from.name}</div>
            <div className="line-clamp-1 text-xs">{email.subject}</div>
            <div className="line-clamp-1 text-xs">
              <span className="font-medium">Reply-To:</span>{' '}
              <span className="text-muted-foreground">{email.from.email}</span>
            </div>
          </div>
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          {format(new Date(email.date), 'PPpp')}
        </div>
      </div>
      <Separator />
      <div className="whitespace-pre-wrap p-4 text-sm">{email.body}</div>
      <Separator />
      <div className="p-4">
        <div className="flex gap-2">
          <Button onClick={handleClassify} disabled={isClassifying}>
            {isClassifying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Classify & Summarize
          </Button>
          <Button onClick={handleDraftReply} disabled={isDrafting}>
            {isDrafting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bot className="mr-2 h-4 w-4" />
            )}
            Draft Reply
          </Button>
        </div>
        {aiEmailInfo && (
          <Alert className="mt-4">
            <Bot className="h-4 w-4" />
            <AlertTitle>AI Summary</AlertTitle>
            <AlertDescription className="space-y-2">
              <div className="flex items-center gap-2">
                Classification: <Badge variant="secondary">{aiEmailInfo.classification}</Badge>
              </div>
              <p>{aiEmailInfo.summary}</p>
            </AlertDescription>
          </Alert>
        )}
        {aiReplyInfo && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5" /> AI Generated Draft
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold">Suggested Actions:</h3>
                <div className="flex flex-wrap gap-2">
                  {aiReplyInfo.suggestedActions.map((action, i) => (
                    <Badge key={i} variant="outline">{action}</Badge>
                  ))}
                </div>
              </div>
              <Textarea
                defaultValue={aiReplyInfo.draftReply}
                rows={8}
                className="font-code"
              />
               <Button>
                <Send className="mr-2 h-4 w-4" /> Send Reply
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
