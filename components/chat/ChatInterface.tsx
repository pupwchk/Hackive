'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import { Send, Loader2 } from 'lucide-react';

const STARTER_QUESTIONS = [
  'AI/ML 관련 해커톤 프로젝트를 추천해줘',
  '올해 참가할 만한 대회를 알려줘',
  '웹 개발 프로젝트에 적합한 기술 스택을 추천해줘',
  'ICPBL 프로젝트 아이디어를 제안해줘',
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage(content: string) {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessageType = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages,
        }),
      });

      const data = await response.json();
      const assistantMessage: ChatMessageType = {
        role: 'assistant',
        content: data.content || '죄송합니다, 응답을 받지 못했습니다. 다시 시도해주세요.',
        structured: data.structured || null,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '죄송합니다, 오류가 발생했습니다. 다시 시도해주세요.',
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold mb-2">AI 비서에게 물어보세요</h2>
            <p className="text-muted-foreground mb-6">
              프로젝트 추천, 대회 정보, 팀원 매칭, Vibe Coding 가이드까지!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {STARTER_QUESTIONS.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="text-left h-auto py-3 px-4 whitespace-normal"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>생각하는 중...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4">
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(input); }}
          className="max-w-3xl mx-auto flex gap-2"
        >
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="프로젝트에 대해 물어보세요..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
