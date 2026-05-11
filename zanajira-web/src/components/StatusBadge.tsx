const config: Record<string, { bg: string; text: string; icon: string; label: string; pulse?: boolean }> = {
  received:    { bg: '#DBEAFE', text: '#1B5FA6', icon: '📩', label: 'Imepokelewa' },
  in_progress: { bg: '#FEF3C7', text: '#92400E', icon: '⏳', label: 'Inaendelea', pulse: true },
  shortlisted: { bg: '#EDE9FE', text: '#5B21B6', icon: '⭐', label: 'Imechaguliwa' },
  placed:      { bg: '#D1FAE5', text: '#065F46', icon: '✅', label: 'Imewekwa' },
  rejected:    { bg: '#FEE2E2', text: '#991B1B', icon: '✗',  label: 'Imekataliwa' },
  published:   { bg: '#D1FAE5', text: '#065F46', icon: '●',  label: 'Imechapishwa' },
  draft:       { bg: '#F3F4F6', text: '#6B7280', icon: '○',  label: 'Rasimu' },
  closed:      { bg: '#FEE2E2', text: '#991B1B', icon: '✗',  label: 'Imefungwa' },
  active:      { bg: '#D1FAE5', text: '#065F46', icon: '●',  label: 'Hai' },
  expired:     { bg: '#FEE2E2', text: '#991B1B', icon: '✗',  label: 'Imekwisha' },
  revoked:     { bg: '#FEF3C7', text: '#92400E', icon: '!',  label: 'Imebatilishwa' },
};

export default function StatusBadge({ status }: { status: string }) {
  const c = config[status] ?? { bg: '#F3F4F6', text: '#6B7280', icon: '?', label: status };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-medium font-body"
      style={{ background: c.bg, color: c.text }}
    >
      <span className={c.pulse ? 'animate-pulse-soft' : ''}>{c.icon}</span>
      {c.label}
    </span>
  );
}
