import { getEvents } from '@/lib/db';

export async function GET() {
  const events = await getEvents();
  return Response.json(events);
}
