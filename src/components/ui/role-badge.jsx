'use client';

import { Badge } from '@/components/ui/badge';
import { getRoleLabel, getRoleColor, getRoleIcon } from '@/lib/roles';

export default function RoleBadge({ 
  role, 
  showIcon = true, 
  size = 'default',
  className = '',
  style = {}
}) {
  if (!role) return null;

  const roleLabel = getRoleLabel(role);
  const roleColor = getRoleColor(role);
  const roleIcon = getRoleIcon(role);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Badge 
      variant="secondary" 
      className={`
        ${roleColor} 
        ${sizeClasses[size]} 
        font-medium 
        inline-flex 
        items-center 
        gap-1 
        border-0
        ${className}
      `}
      style={style}
    >
      {showIcon && <span className="text-xs">{roleIcon}</span>}
      <span>{roleLabel}</span>
    </Badge>
  );
}
