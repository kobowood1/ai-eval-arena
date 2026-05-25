'use client';

type Color = 'pink' | 'cyan' | 'lime' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const COLOR: Record<Color, string> = {
  pink: 'bg-pink-500 hover:bg-pink-400 text-black border-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.6)]',
  cyan: 'bg-cyan-400 hover:bg-cyan-300 text-black border-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.6)]',
  lime: 'bg-lime-400 hover:bg-lime-300 text-black border-lime-200 shadow-[0_0_20px_rgba(163,230,53,0.6)]',
  ghost: 'bg-transparent hover:bg-white/5 text-white border-white/30',
};

const SIZE: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-4 text-base',
};

interface NeoButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: Color;
  size?: Size;
  icon?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function NeoButton({
  children,
  onClick,
  color = 'pink',
  size = 'md',
  icon,
  disabled,
  type = 'button',
  className = '',
}: NeoButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${COLOR[color]} ${SIZE[size]} font-code font-bold uppercase tracking-widest border-2 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 clip-corner ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
