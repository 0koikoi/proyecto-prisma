/**
 * RESPONSABLE: Todos los integrantes del equipo
 *
 * Componente Button reutilizable con Tailwind.
 * Usa las clases semánticas definidas en index.css (@layer components).
 * No modificar sin coordinar con Zully (Líder del Proyecto).
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  icon: Icon,
  className = '',
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon size={17} />}
      <span>{children}</span>
    </button>
  );
};
