import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Project } from '@/lib/types';
import { Trophy, Users } from 'lucide-react';

const activityLabels: Record<string, string> = {
  hackathon: '해커톤',
  icpbl: 'ICPBL',
  club: '동아리',
  competition: '교내대회',
  contest: '공모전',
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.projectId}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.projectName}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
              <Trophy className="h-12 w-12 text-purple-400" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {activityLabels[project.activityType] || project.activityType}
            </Badge>
            {project.award && (
              <Badge className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                {project.award.length > 15 ? project.award.slice(0, 15) + '...' : project.award}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{project.projectName}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {project.problemDescription}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {project.techStack.slice(0, 3).map(tech => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.techStack.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.techStack.length - 3}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{project.eventName} ({project.year})</span>
            {project.university && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {project.university}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
