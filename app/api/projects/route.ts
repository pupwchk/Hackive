import { getProjects, getProjectById } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const project = await getProjectById(id);
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }
    return Response.json(project);
  }

  const activityType = searchParams.get('type') || undefined;
  const search = searchParams.get('search') || undefined;

  const projects = await getProjects({ activityType, search });
  return Response.json(projects);
}
