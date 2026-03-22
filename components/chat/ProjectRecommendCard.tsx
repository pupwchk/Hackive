import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface RecommendItem {
  projectId: string;
  projectName: string;
  reason: string;
}

export default function ProjectRecommendCard({ item }: { item: RecommendItem }) {
  return (
    <Link href={`/projects/${item.projectId}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">{item.projectName}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
