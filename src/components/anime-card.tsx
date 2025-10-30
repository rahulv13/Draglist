'use client';

import type { Title } from '@/lib/data';
import Image from 'next/image';
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Minus, Plus, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type AnimeCardProps = {
  item: Title;
};

export function AnimeCard({ item }: AnimeCardProps) {
  const [progress, setProgress] = useState(item.progress);
  const percentage = (progress / item.total) * 100;

  const handleProgressChange = (increment: number) => {
    setProgress((prev) => {
      const newValue = prev + increment;
      if (newValue < 0) return 0;
      if (newValue > item.total) return item.total;
      return newValue;
    });
  };

  return (
    <Card className="group overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
      <CardHeader className="p-0 relative">
        <Image
          src={item.imageUrl}
          alt={`Cover for ${item.title}`}
          width={400}
          height={600}
          className="w-full h-auto object-cover aspect-[2/3] transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={item.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <CardTitle className="text-lg font-bold text-white drop-shadow-lg">
            {item.title}
          </CardTitle>
        </div>
        {item.score > 0 && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 text-base bg-background/80"
          >
            <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
            {item.score}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {item.type === 'Anime' ? 'Episode' : 'Chapter'} {progress} /{' '}
            {item.total}
          </span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleProgressChange(-1)}
            disabled={progress <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex-1 text-center font-mono text-lg font-medium">
            {progress}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleProgressChange(1)}
            disabled={progress >= item.total}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
