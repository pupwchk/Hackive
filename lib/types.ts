export interface Project {
  projectId: string;
  projectName: string;
  activityType: 'hackathon' | 'icpbl' | 'club' | 'competition' | 'contest';
  eventName: string;
  year: number;
  organizer: string;
  award: string;
  problemDescription: string;
  techStack: string[];
  githubUrl: string;
  demoUrl: string;
  imageUrl: string;
  thumbnailUrl?: string;
  teamSize: number;
  university: string;
  tags: string[];
  createdAt?: string;
}

export interface Event {
  eventId: string;
  eventName: string;
  eventType: 'hackathon' | 'contest' | 'icpbl' | 'competition';
  organizer: string;
  description: string;
  eligibility: string;
  prize: string;
  registrationDeadline: string;
  eventDate: string;
  techFocus: string[];
  url: string;
  imageUrl: string;
  pastWinnersCount?: number;
  createdAt?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  structured?: {
    type: 'project_recommendation' | 'event_recommendation' | 'text';
    items?: Project[];
    suggestion?: string;
    techStackRecommendation?: string[];
  };
}
