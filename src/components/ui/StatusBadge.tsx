import { getOrderStatusColor, getOrderStatusLabel } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const color = getOrderStatusColor(status);
  const label = getOrderStatusLabel(status);

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: color + '18',
        color: color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
