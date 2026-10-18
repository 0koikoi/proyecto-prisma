# Convenciones de Arquitectura y Desarrollo Backend — Tienda Prisma

Este documento establece las directrices que **todos los desarrolladores (Keila, Mauricio, Leo, Zully, Meli)** deben seguir al codificar en el backend Spring Boot.

---

## 1. Estructura de Paquetes (Arquitectura Hexagonal / Limpia Ligera)

El código se organiza bajo `com.prisma.api`:

```text
com.prisma.api
├── domain/                    # Entidades JPA, Enums, Reglas puras y Excepciones
│   ├── entities/              # Entidades sin Lombok (Java estándar)
│   ├── enums/                 # Enums del modelo
│   └── exceptions/            # ResourceNotFoundException, BusinessRuleException
├── application/               # Casos de uso, orquestación y DTOs
│   ├── <modulo>/              # supplier, order, product, sale, cash, etc.
│   │   ├── dto/               # Request y Response usando Java Records
│   │   ├── mapper/            # Mapeadores manuales (sin entidades expuestas en API)
│   │   └── *Service.java      # Servicios transaccionales (@Transactional)
│   └── port/                  # Interfaces de desacople (CurrentUserProvider, StockPort, etc.)
└── infrastructure/            # Implementaciones técnicas y adaptadores externos
    ├── persistence/           # Repositorios Spring Data JPA
    ├── web/                   # Controladores REST, GlobalExceptionHandler, ApiError
    └── config/                # CorsConfig, SecurityStubConfig, CommonConfig (Clock)
```

---

## 2. Manejo de Errores y Códigos HTTP

Toda respuesta de error debe generarse mediante excepciones capturadas por [GlobalExceptionHandler](file:///c:/Users/USER/Documents/github/prisma/proyecto-prisma/backend/src/main/java/com/prisma/api/infrastructure/web/GlobalExceptionHandler.java), retornando la estructura unificada [ApiError](file:///c:/Users/USER/Documents/github/prisma/proyecto-prisma/backend/src/main/java/com/prisma/api/infrastructure/web/ApiError.java):

```json
{
  "timestamp": "2026-10-18T05:10:00Z",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "Un envío nacional requiere la cancelación total de los productos antes del despacho",
  "code": "NATIONAL_PAYMENT_REQUIRED",
  "fieldErrors": null
}
```

- **400 Bad Request:** Argumentos inválidos o errores de `@Valid` (genera lista `fieldErrors`).
- **404 Not Found:** Lanzar `new ResourceNotFoundException("Recurso", id)`.
- **422 Unprocessable Entity:** Regla de negocio violada. Lanzar `new BusinessRuleException("CODIGO", "Mensaje claro")`.
- **409 Conflict:** Inconsistencias de concurrencia o duplicados únicos.

---

## 3. DTOs y Validación

1. **Usar Java Records** para todos los DTOs de entrada y salida:
   ```java
   public record SupplierRequest(
       @NotBlank(message = "La razón social es obligatoria") String companyName,
       @NotBlank(message = "El teléfono es obligatorio") String phone,
       String email
   ) {}
   ```
2. **Validación obligatoria:** Colocar `@Valid` en los parámetros de los métodos en `@RestController`:
   ```java
   @PostMapping
   public ResponseEntity<SupplierResponse> create(@Valid @RequestBody SupplierRequest request) { ... }
   ```
3. **No exponer Entidades JPA:** Los controladores REST **nunca** reciben ni retornan entidades JPA directamente; siempre DTOs records.

---

## 4. Auditoría y Usuario Actual

Para registrar `created_by` o `changed_by`:
- **Inyectar `CurrentUserProvider`** en el servicio.
- `currentUserProvider.getCurrentUser()` devuelve la entidad `User` responsable (en desarrollo apunta automáticamente a `admin`).

---

## 5. Pruebas Unitarias

- **Servicios:** Pruebas con JUnit 5 + Mockito (`@ExtendWith(MockitoExtension.class)`).
- **Controladores:** Pruebas con `@WebMvcTest` verificando códigos HTTP y payloads JSON.
- **Base de Datos:** Para pruebas que toquen SQL real o vistas de Neon, usar el perfil `test` (`spring.profiles.active=test`).
