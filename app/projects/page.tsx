import { Suspense } from 'react';
import ProjectCard from '@/components/project/ProjectCard';
import FilterBar from '@/components/project/FilterBar';
import { getProjects } from '@/lib/db';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; search?: string }>;
}) {
  const params = await searchParams;
  const projects = await getProjects({
    activityType: params.type,
    search: params.search,
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">프로젝트 아카이브</h1>
      <p className="text-muted-foreground mb-6">
        대학 프로젝트 활동의 결과물을 탐색하세요
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <FilterBar />
      </Suspense>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <ProjectCard key={project.projectId} project={project} />
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}
