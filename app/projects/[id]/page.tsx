import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getProjectById } from '@/lib/db';
import { ArrowLeft, Github, ExternalLink, Users, Calendar, Trophy } from 'lucide-react';

const activityLabels: Record<string, string> = {
  hackathon: '해커톤',
  icpbl: 'ICPBL',
  club: '동아리',
  competition: '교내대회',
  contest: '공모전',
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" /> 프로젝트 목록
      </Link>

      <div className="grid gap-6">
        {project.imageUrl && (
          <div className="aspect-video overflow-hidden rounded-lg bg-muted">
            <img
              src={project.imageUrl}
              alt={project.projectName}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">
              {activityLabels[project.activityType]}
            </Badge>
            {project.award && (
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                <Trophy className="mr-1 h-3 w-3" /> {project.award}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{project.projectName}</h1>
          <p className="text-muted-foreground">
            {project.eventName} ({project.year}) · {project.organizer}
          </p>
        </div>

        <Separator />

        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold text-lg mb-2">문제 설명</h2>
            <p className="text-muted-foreground leading-relaxed">
              {project.problemDescription}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold text-lg mb-3">기술 스택</h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map(tech => (
                <Badge key={tech} variant="outline" className="text-sm">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">팀 인원</div>
                <div className="font-semibold">{project.teamSize}명</div>
              </div>
            </CardContent>
          </Card>
          {project.university && (
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">학교</div>
                  <div className="font-semibold">{project.university}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-3">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <Github className="mr-2 h-4 w-4" /> GitHub
              </Button>
            </a>
          )}
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
              <Button>
                <ExternalLink className="mr-2 h-4 w-4" /> Demo
              </Button>
            </a>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {project.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
