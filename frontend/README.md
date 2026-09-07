# Tienda Prisma — Frontend (Sistema de Gestión / Backoffice)

Aplicación web de gestión interna construida con **React 19**, **Vite** y **Tailwind CSS v4** para Tienda Prisma (Huánuco).

---

## 1. Tecnologías y Stack

- **Framework:** React 19 + Vite
- **Estilos:** Tailwind CSS v4 (`@layer components` semánticos en `src/index.css`)
- **Iconografía:** Lucide React
- **Enrutamiento:** React Router v7 (`react-router-dom`)
- **Comunicación:** Fetch API centralizado con inyección JWT (`src/core/api/apiClient.js`)

---

## 2. Comandos de Ejecución

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (puerto 5173)
npm run dev

# Compilar para producción (validación)
npm run build

# Previsualizar build de producción
npm run preview
```

---

## 3. Estructura del Código

```
src/
├── core/                  # Infraestructura transversal (Keila)
│   ├── api/apiClient.js   # Cliente HTTP con cabecera JWT y control 401
│   ├── context/AuthContext.jsx # Estado de sesión de usuario y rol
│   ├── guards/ProtectedRoute.jsx # Protección de rutas según rol (ADMIN vs VENDEDOR)
│   └── routes/AppRoutes.jsx # Mapeo de rutas de la aplicación
├── feature/               # Módulos de negocio (Por integrante)
│   ├── auth/              # Login y autenticación (Keila)
│   ├── cash-register/     # Apertura, arqueo y cierre de caja (Leo)
│   ├── dashboard/         # Métricas en tiempo real y gráficos (Keila)
│   ├── financial-reports/ # Libro diario y balance con exportación CSV (Meli)
│   ├── inventory/         # CRUD de productos, categorías y stock (Mauricio)
│   ├── orders/            # Pedidos WhatsApp/Web y couriers Shalom/Comité 6 (Zully)
│   ├── pos/               # Punto de venta y lector de código de barras (Leo)
│   ├── settings/          # Configuración del negocio y usuarios (Keila)
│   └── suppliers/         # Directorio de proveedores y compras (Zully)
└── shared/                # Componentes y utilidades comunes
    ├── components/        # Button, Input, Modal, Sidebar, Navbar
    ├── constants/         # Rutas del sistema (ROUTES)
    └── utils/             # Formateadores de moneda (S/) y fechas (formatters.js)
```

---

## 4. Distribución de Roles en el Frontend

- **Zully (Líder del Proyecto):** Pedidos y Logística, Proveedores y Compras, y Administración de Versiones (Git/GitHub).
- **Keila:** Dashboard, Autenticación (JWT), Configuración institucional y Layouts.
- **Mauricio:** Inventario de productos, categorías y códigos de barra (`feature/inventory/`).
- **Leo:** Punto de Venta (POS) y Caja/Arqueo diario (`feature/pos/` y `feature/cash-register/`).
- **Meli:** Reporte Financiero consolidado y exportación para Excel (`feature/financial-reports/`).
