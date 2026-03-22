import OpenAI from 'openai';
import { ChatMessage, Project, Event } from './types';
import { getProjects, getEvents } from './db';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `당신은 "해커톤스토어" AI 비서입니다.
대학생들의 프로젝트 활동(해커톤, ICPBL, 동아리, 교내대회)을 도와줍니다.

역할:
1. 프로젝트 추천: 유사 프로젝트를 찾아 추천하고 차별화 포인트를 제안
2. 대회 추천: 사용자 관심사에 맞는 대회/활동 추천
3. 팀원 매칭: 필요한 역할과 기술 스택에 맞는 팀원 구성 제안
4. Vibe Coding 가이드: 프로젝트 구현 단계와 프롬프트 생성
5. ICPBL 아이디어 제안: IC-PBL 프로젝트 아이디어 브레인스토밍

응답 규칙:
- 반드시 한국어로 응답하세요.
- 마크다운 형식을 사용하여 보기 좋게 응답하세요 (제목, 볼드, 리스트 등).
- 프로젝트를 추천할 때는 반드시 아래 형식의 JSON을 응답 마지막에 포함하세요:

\`\`\`json
{
  "type": "project_recommendation",
  "items": [{"projectId": "...", "projectName": "...", "reason": "추천 이유"}],
  "suggestion": "차별화 포인트",
  "techStackRecommendation": ["추천 기술"]
}
\`\`\`

- 일반 대화일 경우 JSON 없이 자연스럽게 응답하세요.
- 데이터에 없는 내용을 지어내지 마세요. 제공된 프로젝트/대회 데이터를 기반으로 답변하세요.`;

// RAG: 사용자 질문에 관련된 프로젝트를 검색
function searchProjects(query: string, projects: Project[]): Project[] {
  const q = query.toLowerCase();
  const keywords = q.split(/\s+/).filter(k => k.length > 1);

  const scored = projects.map(project => {
    let score = 0;
    const searchable = [
      project.projectName,
      project.problemDescription,
      project.eventName,
      ...project.techStack,
      ...project.tags,
      project.activityType,
    ].join(' ').toLowerCase();

    for (const keyword of keywords) {
      if (searchable.includes(keyword)) score += 2;
    }

    // Boost awarded projects
    if (project.award) score += 1;

    // Boost by activity type match
    if (q.includes('icpbl') && project.activityType === 'icpbl') score += 5;
    if (q.includes('해커톤') && project.activityType === 'hackathon') score += 5;
    if (q.includes('동아리') && project.activityType === 'club') score += 5;
    if (q.includes('교내') && project.activityType === 'competition') score += 5;

    // Boost by tech keywords
    if ((q.includes('ai') || q.includes('인공지능') || q.includes('ml')) &&
      project.tags.some(t => ['AI', '딥러닝', 'NLP', '컴퓨터비전', 'LLM'].includes(t))) score += 3;
    if ((q.includes('웹') || q.includes('web')) &&
      project.techStack.some(t => ['React', 'Next.js', 'Web', 'TypeScript'].includes(t))) score += 3;
    if ((q.includes('모바일') || q.includes('앱')) &&
      project.techStack.some(t => ['Mobile', 'Android', 'iOS', 'Flutter'].includes(t))) score += 3;

    return { project, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(s => s.project);
}

function searchEvents(query: string, events: Event[]): Event[] {
  const q = query.toLowerCase();
  const keywords = q.split(/\s+/).filter(k => k.length > 1);

  const scored = events.map(event => {
    let score = 0;
    const searchable = [
      event.eventName,
      event.description,
      event.organizer,
      event.eventType,
    ].join(' ').toLowerCase();

    for (const keyword of keywords) {
      if (searchable.includes(keyword)) score += 2;
    }
    // All events get a base score for general queries
    score += 1;

    return { event, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.event);
}

function buildRAGContext(
  query: string,
  projects: Project[],
  events: Event[]
): string {
  const relevantProjects = searchProjects(query, projects);
  const relevantEvents = searchEvents(query, events);

  let context = '';

  if (relevantProjects.length > 0) {
    context += '=== 관련 프로젝트 데이터 ===\n\n';
    context += relevantProjects.map(p =>
      `프로젝트ID: ${p.projectId}\n프로젝트명: ${p.projectName}\n활동유형: ${p.activityType}\n대회: ${p.eventName} (${p.year})\n수상: ${p.award || '없음'}\n문제설명: ${p.problemDescription}\n기술스택: ${p.techStack.join(', ')}\n태그: ${p.tags.join(', ')}\n팀규모: ${p.teamSize}명\n학교: ${p.university}`
    ).join('\n---\n');
  }

  if (relevantEvents.length > 0) {
    context += '\n\n=== 관련 대회/활동 정보 ===\n\n';
    context += relevantEvents.map(e =>
      `대회명: ${e.eventName}\n유형: ${e.eventType}\n주최: ${e.organizer}\n설명: ${e.description}\n일정: ${e.eventDate}\n상금: ${e.prize}`
    ).join('\n---\n');
  }

  return context;
}

export async function chat(
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  // Load data for RAG
  const projects = await getProjects();
  const events = await getEvents();

  // Build RAG context based on user query
  const ragContext = buildRAGContext(userMessage, projects, events);

  const systemMessage = `${SYSTEM_PROMPT}

아래는 사용자 질문과 관련된 데이터입니다. 이 데이터를 기반으로 답변하세요:

${ragContext}

총 등록 프로젝트: ${projects.length}개, 총 등록 대회: ${events.length}개`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemMessage },
    ...conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const completion = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages,
    max_tokens: 2048,
    temperature: 0.7,
  });

  return completion.choices[0].message.content || '응답을 생성할 수 없습니다.';
}
