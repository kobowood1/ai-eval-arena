type LabelColor = 'pink' | 'cyan' | 'lime';

const STYLE: Record<LabelColor, string> = {
  pink: 'text-pink-500 border-pink-500/40',
  cyan: 'text-cyan-400 border-cyan-400/40',
  lime: 'text-lime-400 border-lime-400/40',
};

export function TerminalLabel({
  children,
  color = 'pink',
}: {
  children: React.ReactNode;
  color?: LabelColor;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 border ${STYLE[color]} font-code text-[10px] uppercase tracking-widest`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current blink" />
      {children}
    </div>
  );
}
