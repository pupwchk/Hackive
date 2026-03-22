import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import seedProjects from '@/data/seed_projects.json';
import seedEvents from '@/data/seed_events.json';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client);

const PROJECTS_TABLE = process.env.PROJECTS_TABLE || 'HackathonStore-Projects';
const EVENTS_TABLE = process.env.EVENTS_TABLE || 'HackathonStore-Events';

const SEED_SECRET = process.env.SEED_SECRET || 'kirothon2026';

export async function POST(request: Request) {
  // Simple auth check
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== SEED_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if already seeded
  try {
    const existing = await docClient.send(new ScanCommand({
      TableName: PROJECTS_TABLE,
      Limit: 1,
    }));
    if (existing.Items && existing.Items.length > 0) {
      return Response.json({
        message: 'Database already seeded',
        projects: existing.Count,
      });
    }
  } catch (error) {
    return Response.json({
      error: 'DynamoDB connection failed. Check IAM permissions and table existence.',
      details: (error as Error).message,
    }, { status: 500 });
  }

  const results = { projects: 0, events: 0, errors: [] as string[] };

  // Seed projects
  for (const project of seedProjects) {
    try {
      await docClient.send(new PutCommand({
        TableName: PROJECTS_TABLE,
        Item: { ...project, createdAt: new Date().toISOString() },
      }));
      results.projects++;
    } catch (error) {
      results.errors.push(`Project ${project.projectName}: ${(error as Error).message}`);
    }
  }

  // Seed events
  for (const event of seedEvents) {
    try {
      await docClient.send(new PutCommand({
        TableName: EVENTS_TABLE,
        Item: { ...event, createdAt: new Date().toISOString() },
      }));
      results.events++;
    } catch (error) {
      results.errors.push(`Event ${event.eventName}: ${(error as Error).message}`);
    }
  }

  return Response.json({
    message: `Seeded ${results.projects} projects and ${results.events} events`,
    ...results,
  });
}
