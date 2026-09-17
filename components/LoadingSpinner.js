'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoadingSpinner({ size = 'md', className, label }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn(sizes[size] || sizes.md, 'animate-spin text-primary')} />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}

export function FullPageLoader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}
