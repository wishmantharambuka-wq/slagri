// GlassCard - Glassmorphism card with hover effect
// Lighter glass effect with hover state

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = '',
  hover = true,
  onClick,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/60 backdrop-blur-sm border border-white/50
        shadow-[0_4px_20px_rgba(0,0,0,0.03)]
        transition-all duration-300
        ${hover ? 'hover:bg-white/95 hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] hover:border-white/80' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
