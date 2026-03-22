import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProjectRecommendCard from './ProjectRecommendCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user';

  // Parse structured data from content if present
  let displayContent = message.content || '';
  let structured = message.structured;

  if (!structured && !isUser && displayContent) {
    const jsonMatch = displayContent.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        structured = JSON.parse(jsonMatch[1]);
        displayContent = message.content.replace(/```json\s*[\s\S]*?```/, '').trim();
      } catch {
        // Keep original content
      }
    }
  }

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <Bot className="h-4 w-4 text-purple-600" />
        </div>
      )}
      <div className={cn('max-w-[80%] space-y-3', isUser ? 'items-end' : 'items-start')}>
        <Card className={cn(
          isUser ? 'bg-purple-600 text-white' : 'bg-muted'
        )}>
          <CardContent className="p-3">
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap">{displayContent}</p>
            ) : (
              <div className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-li:my-0.5 prose-headings:my-2 prose-table:my-2 prose-hr:my-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {displayContent}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>

        {structured?.type === 'project_recommendation' && structured.items && (
          <div className="space-y-2">
            {(structured.items as unknown as { projectId: string; projectName: string; reason: string }[]).map((item, i) => (
              <ProjectRecommendCard key={i} item={item} />
            ))}
            {structured.suggestion && (
              <Card className="bg-purple-50">
                <CardContent className="p-3">
                  <p className="text-xs font-semibold text-purple-700 mb-1">차별화 포인트</p>
                  <p className="text-sm text-purple-900">{structured.suggestion}</p>
                </CardContent>
              </Card>
            )}
            {structured.techStackRecommendation && (
              <div className="flex flex-wrap gap-1">
                {structured.techStackRecommendation.map((tech: string) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}
