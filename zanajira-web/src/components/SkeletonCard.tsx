interface Props {
  variant?: 'card' | 'table-row' | 'profile-section' | 'stat';
  count?: number;
}

function SkeletonBase({ className }: { className: string }) {
  return <div className={`skeleton ${className}`} />;
}

function VacancyCardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <SkeletonBase className="h-3 w-24" />
      <SkeletonBase className="h-5 w-3/4" />
      <SkeletonBase className="h-4 w-1/2" />
      <div className="flex gap-2 pt-2">
        <SkeletonBase className="h-4 w-20" />
        <SkeletonBase className="h-4 w-24" />
      </div>
      <div className="flex justify-between pt-2">
        <SkeletonBase className="h-9 w-28 rounded-pill" />
        <SkeletonBase className="h-9 w-20 rounded-pill" />
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-border">
      {[1,2,3,4,5].map(i => (
        <td key={i} className="px-4 py-3">
          <SkeletonBase className={`h-4 ${i === 1 ? 'w-32' : i === 5 ? 'w-16' : 'w-24'}`} />
        </td>
      ))}
    </tr>
  );
}

function ProfileSectionSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <SkeletonBase className="h-6 w-48" />
      <div className="grid grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="space-y-2">
            <SkeletonBase className="h-3 w-20" />
            <SkeletonBase className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="card p-6 space-y-3">
      <SkeletonBase className="h-3 w-24" />
      <SkeletonBase className="h-10 w-20" />
      <SkeletonBase className="h-3 w-16" />
    </div>
  );
}

export default function SkeletonCard({ variant = 'card', count = 1 }: Props) {
  const items = Array.from({ length: count });
  if (variant === 'card')            return <>{items.map((_, i) => <VacancyCardSkeleton key={i} />)}</>;
  if (variant === 'table-row')       return <>{items.map((_, i) => <TableRowSkeleton key={i} />)}</>;
  if (variant === 'profile-section') return <>{items.map((_, i) => <ProfileSectionSkeleton key={i} />)}</>;
  if (variant === 'stat')            return <>{items.map((_, i) => <StatSkeleton key={i} />)}</>;
  return null;
}
