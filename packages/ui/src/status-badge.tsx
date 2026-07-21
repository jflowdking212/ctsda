import React from 'react';
import { Badge } from './badge';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusVariantMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default' | 'premium'> = {
  active: 'success',
  approved: 'success',
  completed: 'success',
  paid: 'success',
  clean: 'success',
  draft: 'default',
  pending: 'warning',
  submitted: 'info',
  under_review: 'info',
  initial_screening: 'info',
  payment_pending: 'warning',
  changes_requested: 'warning',
  resubmitted: 'info',
  final_review: 'info',
  suspended: 'warning',
  expired: 'error',
  revoked: 'error',
  rejected: 'error',
  failed: 'error',
  withdrawn: 'default',
  cancelled: 'default',
  refunded: 'info',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const variant = statusVariantMap[status] || 'default';
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return <Badge variant={variant} className={className}>{label}</Badge>;
}