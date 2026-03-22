import ChatInterface from '@/components/chat/ChatInterface';

export const metadata = {
  title: 'AI 비서 | 해커톤스토어',
  description: 'AI 비서에게 프로젝트 추천, 대회 정보, 팀원 매칭을 물어보세요',
};

export default function ChatPage() {
  return <ChatInterface />;
}
