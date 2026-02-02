'use client';

import { CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Client, Media } from '@prisma/client';

interface ClientLogoPreviewProps {
  client: Client & { logoMedia?: Media | null };
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function ClientLogoPreview({ client, size = 'md' }: ClientLogoPreviewProps) {
  if (!client) return null;

  const hasLogo = !!client.logoMedia?.url;
  const initials = client.name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3">
      {/* Avatar/Logo */}
      <Avatar className={sizeClasses[size]}>
        {hasLogo && client.logoMedia ? (
          <AvatarImage src={client.logoMedia.url} alt={client.name} />
        ) : null}
        <AvatarFallback className="bg-primary/10 text-primary">
          {initials || <Building2 className={iconSizes[size]} />}
        </AvatarFallback>
      </Avatar>

      {/* Client Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{client.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {hasLogo ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="text-xs text-muted-foreground">Logo ready</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              <span className="text-xs text-muted-foreground">No logo</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
