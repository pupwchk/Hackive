'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const filters = [
  { value: 'all', label: '전체' },
  { value: 'hackathon', label: '해커톤' },
  { value: 'icpbl', label: 'ICPBL' },
  { value: 'club', label: '동아리' },
  { value: 'competition', label: '교내대회' },
  { value: 'contest', label: '공모전' },
];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type') || 'all';
  const currentSearch = searchParams.get('search') || '';

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/projects?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="프로젝트 검색..."
          defaultValue={currentSearch}
          onChange={e => updateParams('search', e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <Badge
            key={f.value}
            variant={currentType === f.value ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-purple-100"
            onClick={() => updateParams('type', f.value)}
          >
            {f.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
