import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Event } from '@/lib/types';
import { Calendar, ExternalLink } from 'lucide-react';

export default function EventCard({ event }: { event: Event }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">{event.eventType}</Badge>
          <span className="text-xs text-muted-foreground">{event.organizer}</span>
        </div>
        <h3 className="font-semibold mb-1">{event.eventName}</h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{event.eventDate}</span>
        </div>
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-purple-600 mt-2 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            자세히 보기
          </a>
        )}
      </CardContent>
    </Card>
  );
}
