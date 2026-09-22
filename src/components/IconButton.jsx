import 'react';

const IconButton = ({ 
  icon: Icon, 
  onClick, 
  title, 
  className = '', 
  children,
  size = 20,
  variant = 'default'
}) => {
  const baseClasses = "p-1.5 rounded transition-colors flex items-center gap-1";
  const variants = {
    default: "hover:bg-[var(--selection-bg-dimmed)] text-[var(--text-muted)] hover:text-[var(--selection-g1)]",
    danger: "hover:bg-[var(--selection-bg-dimmed)] text-[var(--text-muted)] hover:text-red-500",
  };

  const variantClass = variants[variant] || variants.default;

  return (
    <button 
      className={`${baseClasses} ${variantClass} ${className}`}
      onClick={onClick}
      title={title}
    >
      <Icon size={size} />
      {children && <span>{children}</span>}
    </button>
  );
};

export default IconButton;
