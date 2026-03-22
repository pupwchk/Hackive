import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { ChatMessage, Project, Event } from './types';
import { getProjects, getAllProjectsForContext, getEvents } from './db';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_BEDROCK_REGION || 'us-east-1',
});

const SYSTEM_PROMPT = `당신은 "해커톤스토어" AI 비서입니다.
대학생들의 프로젝트 활동(해커톤, ICPBL, 동아리, 교내대회)을 도와줍니다.

역할:
1. 프로젝트 추천: 유사 프로젝트를 찾아 추천하고 차별화 포인트를 제안
2. 대회 추천: 사용자 관심사에 맞는 대회/활동 추천
3. 팀원 매칭: 필요한 역할과 기술 스택에 맞는 팀원 구성 제안
4. Vibe Coding 가이드: 프로젝트 구현 단계와 프롬프트 생성

반드시 한국어로 응답하세요.
프로젝트를 추천할 때는 반드시 아래 형식의 JSON을 응답 마지막에 포함하세요:
\`\`\`json
{
  "type": "project_recommendation",
  "items": [{"projectId": "...", "projectName": "...", "reason": "추천 이유"}],
  "suggestion": "차별화 포인트",
  "techStackRecommendation": ["추천 기술"]
}
\`\`\`

일반 대화일 경우 JSON 없이 자연스럽게 응답하세요.`;

export async function chat(
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  // Try Bedrock first, fallback to local
  try {
    return await callBedrock(userMessage, conversationHistory);
  } catch (error) {
    console.log('Bedrock unavailable, using local fallback:', (error as Error).message);
    return await localFallback(userMessage);
  }
}

async function callBedrock(
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  const projectsContext = await getAllProjectsForContext();
  const eventsData = await getEvents();
  const eventsContext = eventsData.map(e =>
    `대회: ${e.eventName}\n유형: ${e.eventType}\n주최: ${e.organizer}\n설명: ${e.description}\n일정: ${e.eventDate}\n상금: ${e.prize}`
  ).join('\n---\n');

  const contextPrompt = `${SYSTEM_PROMPT}

아래는 등록된 프로젝트 데이터입니다. 이 데이터를 기반으로 추천해주세요:

${projectsContext}

아래는 대회/활동 정보입니다:

${eventsContext}`;

  const messages = [
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2048,
    system: contextPrompt,
    messages,
  };

  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return responseBody.content[0].text;
}

// Local fallback when Bedrock is unavailable
async function localFallback(userMessage: string): Promise<string> {
  const projects = await getProjects();
  const events = await getEvents();
  const msg = userMessage.toLowerCase();

  // Intent detection (more specific intents first)
  if (msg.includes('icpbl') || msg.includes('ic-pbl')) {
    return handleICPBL(msg, projects);
  }
  if (msg.includes('vibe') || msg.includes('바이브')) {
    return handleVibeCoding(msg);
  }
  if (msg.includes('대회') || msg.includes('참가') || msg.includes('일정')) {
    return handleEventRecommendation(msg, events);
  }
  if (msg.includes('추천') || msg.includes('프로젝트') || msg.includes('해커톤') || msg.includes('아이디어')) {
    return handleProjectRecommendation(msg, projects);
  }
  if (msg.includes('팀') || msg.includes('매칭') || msg.includes('팀원')) {
    return handleTeamMatching(msg, projects);
  }
  if (msg.includes('기술') || msg.includes('스택') || msg.includes('tech')) {
    return handleTechStack(msg, projects);
  }
  if (msg.includes('코딩') || msg.includes('가이드')) {
    return handleVibeCoding(msg);
  }

  // Default: general help
  return `안녕하세요! 해커톤스토어 AI 비서입니다. 다음과 같은 도움을 드릴 수 있어요:

1. **프로젝트 추천** - "AI 관련 해커톤 프로젝트 추천해줘"
2. **대회 정보** - "올해 참가할 만한 대회 알려줘"
3. **ICPBL 아이디어** - "ICPBL 프로젝트 아이디어를 제안해줘"
4. **팀원 매칭** - "웹 개발 프로젝트 팀원 구성을 도와줘"
5. **기술 스택 추천** - "웹 개발에 적합한 기술 스택 추천해줘"
6. **Vibe Coding 가이드** - "프로젝트 구현 단계를 알려줘"

현재 **${projects.length}개의 프로젝트**와 **${events.length}개의 대회** 정보가 등록되어 있습니다. 무엇이든 물어보세요!`;
}

function handleProjectRecommendation(msg: string, projects: Project[]): string {
  let filtered = projects;

  if (msg.includes('ai') || msg.includes('ml') || msg.includes('인공지능')) {
    filtered = projects.filter(p =>
      p.tags.some(t => ['AI', '딥러닝', 'NLP', '컴퓨터비전', 'LLM'].includes(t)) ||
      p.techStack.some(t => t.toLowerCase().includes('ai') || t.toLowerCase().includes('deep'))
    );
  } else if (msg.includes('웹') || msg.includes('web')) {
    filtered = projects.filter(p =>
      p.techStack.some(t => ['Web', 'React', 'TypeScript', 'JavaScript', 'Next.js'].includes(t))
    );
  } else if (msg.includes('모바일') || msg.includes('앱')) {
    filtered = projects.filter(p =>
      p.techStack.some(t => ['Mobile', 'Android', 'iOS', 'Kotlin', 'Swift', 'Flutter'].includes(t))
    );
  } else if (msg.includes('핀테크') || msg.includes('금융')) {
    filtered = projects.filter(p =>
      p.tags.some(t => ['핀테크', '금융', 'FinTech'].includes(t))
    );
  }

  if (filtered.length === 0) filtered = projects;
  const top = filtered.filter(p => p.award).slice(0, 4);
  if (top.length === 0) return '해당 분야의 프로젝트를 찾지 못했습니다. 다른 키워드로 시도해보세요.';

  const descriptions = top.map((p, i) =>
    `${i + 1}. **${p.projectName}** (${p.eventName}, ${p.year})\n   - ${p.award}\n   - ${p.problemDescription}\n   - 기술: ${p.techStack.join(', ')}`
  ).join('\n\n');

  const json = {
    type: 'project_recommendation',
    items: top.map(p => ({
      projectId: p.projectId,
      projectName: p.projectName,
      reason: `${p.eventName}에서 ${p.award || '참가'}. ${p.techStack.slice(0, 3).join(', ')} 활용`
    })),
    suggestion: '기존 프로젝트들과 차별화하려면 최신 기술(LLM, Agent 등)을 접목하거나, 타겟 사용자층을 더 구체화하세요.',
    techStackRecommendation: [...new Set(top.flatMap(p => p.techStack))].slice(0, 5)
  };

  return `관련 프로젝트를 추천해드립니다!\n\n${descriptions}\n\n**차별화 포인트**: 기존 프로젝트들과 차별화하려면 최신 기술(LLM, Agent 등)을 접목하거나, 타겟 사용자층을 더 구체화해보세요.\n\n\`\`\`json\n${JSON.stringify(json, null, 2)}\n\`\`\``;
}

function handleEventRecommendation(msg: string, events: Event[]): string {
  const upcoming = events.slice(0, 5);
  const list = upcoming.map((e, i) =>
    `${i + 1}. **${e.eventName}**\n   - 주최: ${e.organizer}\n   - 일정: ${e.eventDate}\n   - ${e.description}\n   - 상금: ${e.prize}`
  ).join('\n\n');

  return `참가하실 만한 대회를 추천해드립니다!\n\n${list}\n\n대회 참가 팁: 팀 구성 시 기획/디자인/개발 역할을 균형있게 배치하면 좋습니다. 사전에 주제 관련 기술을 미리 학습해두세요.`;
}

function handleICPBL(msg: string, projects: Project[]): string {
  const icpblProjects = projects.filter(p => p.activityType === 'icpbl');

  const examples = icpblProjects.slice(0, 3).map((p, i) =>
    `${i + 1}. **${p.projectName}**\n   - ${p.problemDescription}\n   - 기술: ${p.techStack.join(', ')}`
  ).join('\n\n');

  return `ICPBL 프로젝트 아이디어를 제안해드립니다!\n\n### 기존 ICPBL 사례\n${examples}\n\n### 새로운 아이디어 제안\n\n1. **캠퍼스 탄소발자국 트래커** - 대학 캠퍼스의 에너지 사용량을 IoT 센서로 수집하고 탄소 배출량을 시각화하는 프로젝트\n   - 기술: IoT, Data Visualization, Python\n\n2. **지역 소상공인 디지털 전환 지원** - 안산/성남 등 지역 소상공인의 디지털 마케팅 지원 플랫폼\n   - 기술: Web, SNS API, Data Analysis\n\n3. **유학생 생활 적응 도우미** - 외국인 유학생의 한국 생활 적응을 돕는 AI 챗봇 서비스\n   - 기술: NLP, ChatBot, Multilingual\n\nIC-PBL의 핵심은 **실제 기업/기관과의 연계**입니다. 한양대 ERICA의 경우 신한은행, 카카오, 캐논코리아 등과 협력한 사례가 있어요.`;
}

function handleTeamMatching(msg: string, projects: Project[]): string {
  return `프로젝트 팀 구성을 도와드립니다!\n\n### 이상적인 해커톤 팀 구성 (4인 기준)\n\n| 역할 | 주요 업무 | 필요 역량 |\n|------|---------|----------|\n| **PM/기획** | 아이디어 구체화, 발표 | 기획력, 커뮤니케이션 |\n| **프론트엔드** | UI/UX 구현 | React, CSS, 디자인 감각 |\n| **백엔드** | API, DB 설계 | Python/Java, DB, 클라우드 |\n| **AI/데이터** | 모델 학습, 분석 | ML/DL, Python, 데이터 |\n\n### 팀빌딩 팁\n- 해커톤은 **24시간** 내 결과물을 만들어야 하므로 역할 분담이 핵심\n- 발표(Demo)가 중요하니 **기획자 또는 발표를 잘하는 팀원** 필수\n- 기술 스택은 팀원들이 **이미 익숙한 것**으로 선택 (해커톤에서 새로운 기술 배우기는 위험)\n- Git 브랜치 전략을 미리 정해두면 충돌 방지\n\n수상 프로젝트들의 평균 팀 사이즈는 **${Math.round(projects.reduce((a, p) => a + p.teamSize, 0) / projects.length)}명**입니다.`;
}

function handleTechStack(msg: string, projects: Project[]): string {
  const techCount: Record<string, number> = {};
  projects.forEach(p => p.techStack.forEach(t => { techCount[t] = (techCount[t] || 0) + 1; }));
  const sorted = Object.entries(techCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const list = sorted.map(([tech, count], i) => `${i + 1}. **${tech}** (${count}개 프로젝트)`).join('\n');

  return `등록된 프로젝트들에서 가장 많이 사용된 기술 스택을 분석했습니다!\n\n### Top 10 기술 스택\n${list}\n\n### 추천 조합\n- **웹 풀스택**: React + TypeScript + Python(FastAPI) + PostgreSQL\n- **AI 프로젝트**: Python + PyTorch + OpenAI API + Gradio\n- **모바일**: Kotlin(Android) 또는 Swift(iOS) + Firebase\n- **데이터 분석**: Python + Pandas + Jupyter + Visualization\n\n최근 트렌드는 **LLM(GPT, Claude) API 활용**과 **에이전트(Agent) 패턴**이 강세입니다.`;
}

function handleVibeCoding(msg: string): string {
  return `Vibe Coding 가이드를 제공해드립니다!\n\n### Vibe Coding이란?\nAI 도구(Cursor, Copilot, Kiro 등)를 활용하여 빠르게 프로토타입을 만드는 개발 방식입니다.\n\n### 단계별 가이드\n\n**1단계: 아이디어 구체화 (30분)**\n- 문제 정의: "누구의 어떤 문제를 해결하는가?"\n- 핵심 기능 3개로 압축\n- 기술 스택 결정\n\n**2단계: 프로젝트 셋업 (30분)**\n- AI에게: "Next.js + Tailwind + shadcn으로 프로젝트 생성해줘"\n- 기본 레이아웃과 라우팅 구성\n\n**3단계: 핵심 기능 구현 (3-4시간)**\n- 각 기능별 프롬프트 작성\n- 예: "사용자가 프로젝트를 검색하고 필터링할 수 있는 페이지를 만들어줘"\n\n**4단계: UI 폴리싱 (1-2시간)**\n- 반응형 디자인 적용\n- 애니메이션, 로딩 상태 추가\n\n**5단계: 배포 (30분)**\n- Vercel/Amplify에 배포\n- 데모 URL 확보\n\n### 프롬프트 작성 팁\n- **구체적으로**: "버튼 추가해줘" ❌ → "프로젝트 카드에 GitHub 링크 버튼을 추가하고, lucide-react의 Github 아이콘을 사용해줘" ✅\n- **컨텍스트 제공**: 기존 코드와 디자인 시스템을 함께 전달\n- **단계적으로**: 한 번에 많은 것을 요청하지 말고 기능 단위로 나누기`;
}
