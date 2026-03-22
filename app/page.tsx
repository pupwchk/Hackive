import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/project/ProjectCard';
import EventCard from '@/components/event/EventCard';
import { getProjects, getEvents } from '@/lib/db';
import { MessageSquare, FolderOpen, ArrowRight } from 'lucide-react';

export default async function LandingPage() {
  const projects = await getProjects();
  const events = await getEvents();
  const featuredProjects = projects.filter(p => p.award).slice(0, 4);
  const upcomingEvents = events.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="container mx-auto py-20 md:py-28 px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              대학 프로젝트의<br />모든 것을 한 곳에
            </h1>
            <p className="text-lg md:text-xl text-purple-100 mb-8">
              해커톤, ICPBL, 동아리, 교내대회 &mdash; AI가 프로젝트를 추천하고,
              팀원을 매칭하고, 대회를 알려줍니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/chat">
                <Button size="lg" className="bg-white text-purple-700 hover:bg-purple-50 w-full sm:w-auto">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  AI 비서에게 물어보기
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                  <FolderOpen className="mr-2 h-5 w-5" />
                  프로젝트 둘러보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">수상 프로젝트</h2>
          <Link href="/projects" className="text-sm text-purple-600 hover:underline flex items-center gap-1">
            전체 보기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProjects.map(project => (
            <ProjectCard key={project.projectId} project={project} />
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="container mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-6">대회 & 활동</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingEvents.map(event => (
            <EventCard key={event.eventId} event={event} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600">{projects.length}+</div>
              <div className="text-sm text-muted-foreground mt-1">프로젝트</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{events.length}+</div>
              <div className="text-sm text-muted-foreground mt-1">대회 & 활동</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">AI</div>
              <div className="text-sm text-muted-foreground mt-1">맞춤 추천</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
