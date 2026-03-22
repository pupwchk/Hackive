import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { Project, Event } from './types';

const client = new DynamoDBClient({
  region: process.env.APP_REGION || 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client);

const PROJECTS_TABLE = process.env.PROJECTS_TABLE || 'HackathonStore-Projects';
const EVENTS_TABLE = process.env.EVENTS_TABLE || 'HackathonStore-Events';

export async function getProjects(filters?: {
  activityType?: string;
  search?: string;
}): Promise<Project[]> {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: PROJECTS_TABLE,
    }));
    let projects = (result.Items || []) as Project[];

    if (filters?.activityType && filters.activityType !== 'all') {
      projects = projects.filter(p => p.activityType === filters.activityType);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      projects = projects.filter(p =>
        p.projectName.toLowerCase().includes(q) ||
        p.problemDescription.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return projects.sort((a, b) => b.year - a.year);
  } catch {
    const data = await import('@/data/seed_projects.json');
    let projects = data.default as Project[];
    if (filters?.activityType && filters.activityType !== 'all') {
      projects = projects.filter(p => p.activityType === filters.activityType);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      projects = projects.filter(p =>
        p.projectName.toLowerCase().includes(q) ||
        p.problemDescription.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return projects.sort((a, b) => b.year - a.year);
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: PROJECTS_TABLE,
      Key: { projectId: id },
    }));
    return (result.Item as Project) || null;
  } catch {
    const data = await import('@/data/seed_projects.json');
    return (data.default as Project[]).find(p => p.projectId === id) || null;
  }
}

export async function getEvents(): Promise<Event[]> {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: EVENTS_TABLE,
    }));
    return (result.Items || []) as Event[];
  } catch {
    const data = await import('@/data/seed_events.json');
    return data.default as Event[];
  }
}

export async function getAllProjectsForContext(): Promise<string> {
  const projects = await getProjects();
  return projects.map(p =>
    `프로젝트: ${p.projectName}\n활동유형: ${p.activityType}\n대회: ${p.eventName} (${p.year})\n수상: ${p.award}\n문제: ${p.problemDescription}\n기술스택: ${p.techStack.join(', ')}\n태그: ${p.tags.join(', ')}\n학교: ${p.university}\n---`
  ).join('\n');
}
