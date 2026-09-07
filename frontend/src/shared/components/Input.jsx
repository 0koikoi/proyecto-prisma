/**
 * RESPONSABLE: Todos los integrantes
 *
 * Componente Input reutilizable con Tailwind.
 * Soporta ícono leading, mensaje de error y estados deshabilitados.
 */
export const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  error,
  icon: Icon,
  disabled = false,
  required = false,
}) => {
  return (
    <div className="input-field-group">
      {label && (
        <label className="input-label" htmlFor={name}>
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'border-red-400 ring-2 ring-red-400' : ''}`}>
        {Icon && <Icon size={16} className="text-gray-400 shrink-0 mr-1" />}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="input-element"
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
