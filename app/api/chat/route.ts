import { chat } from '@/lib/ai';
import { ChatMessage } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history } = body as {
      message: string;
      history: ChatMessage[];
    };

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const content = await chat(message, history || []);

    // Try to extract structured data from response
    let structured = null;
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        structured = JSON.parse(jsonMatch[1]);
      } catch {
        // Ignore parse errors
      }
    }

    return Response.json({ content, structured });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { content: '죄송합니다, 일시적인 오류가 발생했습니다. 다시 시도해주세요.', structured: null },
      { status: 200 }
    );
  }
}
