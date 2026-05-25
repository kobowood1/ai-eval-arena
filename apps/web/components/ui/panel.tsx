type PanelColor = 'default' | 'pink' | 'cyan' | 'lime';

const BORDER: Record<PanelColor, string> = {
  default: 'border-white/10',
  pink: 'border-pink-500/30',
  cyan: 'border-cyan-400/30',
  lime: 'border-lime-400/30',
};

interface PanelProps {
  children: React.ReactNode;
  color?: PanelColor;
  className?: string;
}

export function Panel({ children, color = 'default', className = '' }: PanelProps) {
  return (
    <div className={`relative bg-zinc-950/80 border ${BORDER[color]} backdrop-blur p-4 ${className}`}>
      {children}
    </div>
  );
}
