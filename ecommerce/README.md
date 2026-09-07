# Tienda Prisma — E-commerce (Tienda Online Pública)

> **Estado:** Fase 2 — Planificado para desarrollo posterior a la estabilización del Backoffice de Gestión (ver sección 3 de `plan prisma.md`).

---

## 1. Relación con el Sistema de Gestión (Backoffice)

Este proyecto funcionará como la **tienda virtual abierta al cliente final** (tipo catálogo Shein/Zara) y se conectará directamente a la misma base de datos y backend de Spring Boot:

```
┌────────────────────────────────┐         ┌────────────────────────────────┐
│      BACKOFFICE INTERNO        │         │      TIENDA ONLINE PÚBLICA     │
│          (frontend/)           │         │          (ecommerce/)          │
│   POS, Caja, Inventario, etc.  │         │   Catálogo, Carrito, Checkout  │
└───────────────┬────────────────┘         └───────────────┬────────────────┘
                │                                          │
                │        Misma API REST (Spring Boot)      │
                ▼                                          ▼
        ┌──────────────────────────────────────────────────────────┐
        │                 BACKEND (/backend)                       │
        │             GET /api/products (Catálogo)                 │
        │             GET /api/categories (Filtros)                │
        │             POST /api/orders (Nuevos pedidos web)        │
        └───────────────────────────┬──────────────────────────────┘
                                    │
                                    ▼
        ┌──────────────────────────────────────────────────────────┐
        │             BASE DE DATOS POSTGRESQL                     │
        │   Inventario Único: Stock sincronizado en tiempo real   │
        └──────────────────────────────────────────────────────────┘
```

---

## 2. Beneficios de la Arquitectura de Inventario Unificado

1. **Cero Sobreventa:** Cuando un producto se vende en el mostrador físico (POS), el stock disminuye inmediatamente para la tienda online.
2. **Catálogo Único:** Mauricio registra fotos, descripción y precios una sola vez en el módulo de Inventario del backoffice, y aparecen automáticamente en la web pública.
3. **Flujo de Pedidos Directo:** Cada compra finalizada en el e-commerce genera un registro en la tabla `orders` con canal `TIENDA_ONLINE`, apareciendo al instante en la bandeja de Pedidos de Zully para su empaquetado y despacho por Shalom o Comité 6.

---

## 3. Estructura Proyectada para la Fase 2

```
ecommerce/
├── src/
│   ├── components/       # Header público, Footer, Carrusel de novedades
│   ├── pages/
│   │   ├── HomePage      # Portada con colecciones (Femenina, Urbana, Mascotas)
│   │   ├── CatalogPage   # Grilla de productos con filtros de talla/categoría
│   │   ├── ProductDetail # Ficha de prenda con fotos, guía de tallas y botón WhatsApp
│   │   └── CartCheckout  # Carrito de compra y formulario de datos de envío
│   ├── services/         # Conexión con GET /api/products y POST /api/orders
│   └── index.css         # Estilos alineados con la identidad de marca
└── README.md
```
