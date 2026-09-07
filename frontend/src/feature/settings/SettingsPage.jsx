/**
 * RESPONSABLE: Keila
 * MÓDULO: Configuración (Admin)
 *
 * Página de configuración del sistema — solo accesible para el rol ADMIN.
 * El VENDEDOR no puede ingresar aquí (proteger con ProtectedRoute según rol).
 *
 * SECCIONES A IMPLEMENTAR:
 *  1. Gestión de usuarios: crear, editar y desactivar usuarios del sistema
 *     (roles ADMIN y VENDEDOR). Contraseñas siempre con hash BCrypt.
 *  2. Gestión de categorías: agregar o renombrar las categorías del negocio
 *     (Femenina, Urbana, Mascotas — configurable para el futuro).
 *
 * CONEXIÓN CON BACKEND:
 *  - GET  /api/users       → listar usuarios del sistema
 *  - POST /api/users       → crear usuario (Admin)
 *  - PUT  /api/users/{id}  → editar usuario / cambiar contraseña
 *  - GET  /api/categories  → listar categorías
 *  - POST /api/categories  → crear categoría
 *  - PUT  /api/categories/{id} → renombrar categoría
 *
 * TODO Keila: Implementar la lista de usuarios con botón de "Nuevo Usuario".
 * TODO Keila: Implementar la lista de categorías con botón de "Nueva Categoría".
 * TODO Keila: Proteger esta ruta para que solo ADMIN pueda accederla (en AppRoutes.jsx).
 */
export const SettingsPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Configuración del Sistema</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gestión de usuarios y categorías — solo Admin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección Usuarios */}
        {/* TODO Keila: implementar la lista de usuarios y el formulario de creación */}
        <div className="content-card">
          <h3 className="mb-3">Usuarios del Sistema</h3>
          <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
            [ Tabla de usuarios: Nombre, Rol, Acciones ]
          </div>
        </div>

        {/* Sección Categorías */}
        {/* TODO Keila: implementar la lista de categorías y el formulario de edición */}
        <div className="content-card">
          <h3 className="mb-3">Categorías del Negocio</h3>
          <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
            [ Lista de categorías: Femenina, Urbana, Mascotas + botón Agregar ]
          </div>
        </div>
      </div>
    </div>
  );
};
