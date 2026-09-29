import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = false, onClick, ...props }) {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover ? {
    whileHover: { y: -4, scale: 1.01 },
    transition: { type: 'spring', stiffness: 300 },
  } : {};

  return (
    <Component
      className={`glass-card ${hover ? 'cursor-pointer' : ''} p-6 ${className}`}
      onClick={onClick}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
}
