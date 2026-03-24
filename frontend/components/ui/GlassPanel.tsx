// GlassPanel - Glassmorphism container panel
// Backdrop blur with semi-transparent white background

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'aside' | 'section' | 'nav';
}

export default function GlassPanel({ children, className = '', as: Component = 'div' }: GlassPanelProps) {
  return (
    <Component
      className={`bg-white/65 backdrop-blur-xl border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ${className}`}
    >
      {children}
    </Component>
  );
}
