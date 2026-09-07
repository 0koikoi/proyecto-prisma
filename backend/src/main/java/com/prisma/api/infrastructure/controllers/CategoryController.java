package com.prisma.api.infrastructure.controllers;

import com.prisma.api.domain.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * RESPONSABLE: Mauricio
 * MÓDULO: Inventario — Categorías (REST Controller)
 *
 * Expone las categorías de producto (Femenina, Urbana, Mascotas)
 * para los selectores del POS, filtros y formularios de alta de producto.
 *
 * ENDPOINTS ASOCIADOS:
 *  - GET  /api/categories       -> Listado de categorías activas
 *  - POST /api/categories       -> Crear nueva categoría (Admin)
 *
 * TODO Mauricio:
 *  - Inyectar CategoryRepository o CategoryUseCase.
 */
@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        // TODO Mauricio: retornar categoryRepository.findAll()
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "name", "Femenina", "description", "Ropa juvenil femenina de temporada"),
            Map.of("id", 2, "name", "Urbana", "description", "Moda urbana y streetwear unisex"),
            Map.of("id", 3, "name", "Mascotas", "description", "Prendas y accesorios para mascotas")
        ));
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Map<String, Object> payload) {
        // TODO Mauricio: guardar nueva categoría
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", payload
        ));
    }
}
