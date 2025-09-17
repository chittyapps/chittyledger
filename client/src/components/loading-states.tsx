import { Loader2, FileText, Database, Shield, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Generic loading spinner
export function LoadingSpinner({ size = 'default', className = '' }: {
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

// Loading overlay for forms and actions
export function LoadingOverlay({
  message = 'Loading...',
  show = true
}: {
  message?: string;
  show?: boolean;
}) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 flex items-center space-x-3">
        <LoadingSpinner />
        <span className="text-slate-300">{message}</span>
      </div>
    </div>
  );
}

// Evidence card skeleton
export function EvidenceCardSkeleton() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32 bg-slate-700" />
          <Skeleton className="h-6 w-20 bg-slate-700" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 bg-slate-700" />
          <Skeleton className="h-4 w-48 bg-slate-700" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-slate-700" />
          <Skeleton className="h-4 w-3/4 bg-slate-700" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24 bg-slate-700" />
          <Skeleton className="h-4 w-16 bg-slate-700" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20 bg-slate-700" />
          <Skeleton className="h-8 w-24 bg-slate-700" />
        </div>
      </CardContent>
    </Card>
  );
}

// Evidence table skeleton
export function EvidenceTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 bg-slate-700" />
        <Skeleton className="h-10 w-32 bg-slate-700" />
      </div>
      <div className="border border-slate-700 rounded-lg overflow-hidden">
        <div className="bg-slate-800 p-4 border-b border-slate-700">
          <div className="grid grid-cols-6 gap-4">
            <Skeleton className="h-4 w-20 bg-slate-700" />
            <Skeleton className="h-4 w-24 bg-slate-700" />
            <Skeleton className="h-4 w-16 bg-slate-700" />
            <Skeleton className="h-4 w-20 bg-slate-700" />
            <Skeleton className="h-4 w-18 bg-slate-700" />
            <Skeleton className="h-4 w-16 bg-slate-700" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-slate-700 last:border-b-0">
            <div className="grid grid-cols-6 gap-4 items-center">
              <Skeleton className="h-4 w-24 bg-slate-700" />
              <Skeleton className="h-4 w-32 bg-slate-700" />
              <Skeleton className="h-6 w-16 bg-slate-700" />
              <Skeleton className="h-4 w-20 bg-slate-700" />
              <Skeleton className="h-4 w-16 bg-slate-700" />
              <Skeleton className="h-8 w-20 bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard stats skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32 bg-slate-700" />
              <Skeleton className="h-4 w-4 bg-slate-700" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-16 bg-slate-700" />
              <Skeleton className="h-3 w-24 bg-slate-700" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Case sidebar skeleton
export function CaseSidebarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32 bg-slate-700" />
        <Skeleton className="h-4 w-24 bg-slate-700" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3 border border-slate-700 rounded-lg">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 bg-slate-700" />
              <Skeleton className="h-3 w-full bg-slate-700" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16 bg-slate-700" />
                <Skeleton className="h-3 w-20 bg-slate-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Minting eligibility skeleton
export function MintingEligibilitySkeleton() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48 bg-slate-700" />
          <Skeleton className="h-6 w-24 bg-slate-700" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32 bg-slate-700" />
            <Skeleton className="h-4 w-12 bg-slate-700" />
          </div>
          <Skeleton className="h-3 w-full bg-slate-700" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-40 bg-slate-700" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4 bg-slate-700" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-16 bg-slate-700" />
                  <Skeleton className="h-3 w-24 bg-slate-700" />
                </div>
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-8 bg-slate-700" />
                <Skeleton className="h-2 w-16 bg-slate-700" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Chain of custody skeleton
export function ChainOfCustodySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32 bg-slate-700" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4 p-4 border border-slate-700 rounded-lg">
            <Skeleton className="h-8 w-8 bg-slate-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 bg-slate-700" />
                <Skeleton className="h-3 w-32 bg-slate-700" />
              </div>
              <Skeleton className="h-3 w-full bg-slate-700" />
              <Skeleton className="h-3 w-3/4 bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading states for specific actions
export function ActionLoadingState({
  action,
  className = ''
}: {
  action: 'minting' | 'verifying' | 'uploading' | 'calculating';
  className?: string;
}) {
  const actionConfig = {
    minting: { icon: Shield, text: 'Adding to ChittyChain Ledger...', color: 'text-legal-gold-400' },
    verifying: { icon: Database, text: 'Verifying evidence...', color: 'text-blue-400' },
    uploading: { icon: FileText, text: 'Uploading evidence...', color: 'text-green-400' },
    calculating: { icon: Clock, text: 'Calculating trust scores...', color: 'text-purple-400' }
  };

  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-3 p-4 bg-slate-800 rounded-lg border border-slate-600 ${className}`}>
      <div className="relative">
        <Icon className={`w-5 h-5 ${config.color}`} />
        <div className="absolute -inset-1">
          <div className="w-7 h-7 border-2 border-transparent border-t-current rounded-full animate-spin opacity-30"></div>
        </div>
      </div>
      <span className="text-slate-300">{config.text}</span>
    </div>
  );
}

// Empty state component
export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  action
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-slate-300 mb-2">{title}</h3>
      <p className="text-slate-500 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
}