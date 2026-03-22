import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import seedProjects from '@/data/seed_projects.json';
import seedEvents from '@/data/seed_events.json';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client);

const PROJECTS_TABLE = process.env.PROJECTS_TABLE || 'HackathonStore-Projects';
const EVENTS_TABLE = process.env.EVENTS_TABLE || 'HackathonStore-Events';

async function seedDatabase() {
  console.log('Seeding projects...');
  for (const project of seedProjects) {
    try {
      await docClient.send(new PutCommand({
        TableName: PROJECTS_TABLE,
        Item: {
          ...project,
          createdAt: new Date().toISOString(),
        },
      }));
      console.log(`  ✓ ${project.projectName}`);
    } catch (error) {
      console.error(`  ✗ ${project.projectName}:`, error);
    }
  }

  console.log('\nSeeding events...');
  for (const event of seedEvents) {
    try {
      await docClient.send(new PutCommand({
        TableName: EVENTS_TABLE,
        Item: {
          ...event,
          createdAt: new Date().toISOString(),
        },
      }));
      console.log(`  ✓ ${event.eventName}`);
    } catch (error) {
      console.error(`  ✗ ${event.eventName}:`, error);
    }
  }

  console.log(`\nDone! Seeded ${seedProjects.length} projects and ${seedEvents.length} events.`);
}

seedDatabase().catch(console.error);
