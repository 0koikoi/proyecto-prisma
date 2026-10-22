package com.prisma.api.infrastructure.error;

import jakarta.persistence.OptimisticLockException;
import jakarta.persistence.LockTimeoutException;
import jakarta.persistence.PessimisticLockException;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice(basePackages = "com.prisma.api.infrastructure.controllers.catalog")
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CatalogExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(CatalogExceptionHandler.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> responseStatus(ResponseStatusException exception) {
        int status = exception.getStatusCode().value();
        String code = switch (status) {
            case 400 -> "VALIDATION_ERROR";
            case 401 -> "UNAUTHORIZED";
            case 403 -> "FORBIDDEN";
            case 404 -> "NOT_FOUND";
            case 409 -> "CONFLICT";
            default -> status >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR";
        };
        String message = status >= 500 ? "No se pudo completar la operación."
                : exception.getReason() == null ? "No se pudo procesar la solicitud." : exception.getReason();
        return ResponseEntity.status(status).body(new ApiError(status, code, message, Map.of()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> invalidBody(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
                errors.putIfAbsent(error.getField(), error.getDefaultMessage() == null
                        ? "Valor inválido." : error.getDefaultMessage()));
        return invalid(errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> invalidConstraint(ConstraintViolationException exception) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getConstraintViolations().forEach(error -> {
            String property = error.getPropertyPath().toString();
            int separator = property.lastIndexOf('.');
            errors.putIfAbsent(property.substring(separator + 1), error.getMessage());
        });
        return invalid(errors);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiError> invalidParameters(HandlerMethodValidationException exception) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getParameterValidationResults().forEach(result -> {
            String name = result.getMethodParameter().getParameterName();
            result.getResolvableErrors().forEach(error -> errors.putIfAbsent(
                    name == null ? "parameter" : name,
                    error.getDefaultMessage() == null ? "Valor inválido." : error.getDefaultMessage()));
        });
        return invalid(errors);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> invalidType(MethodArgumentTypeMismatchException exception) {
        return invalid(Map.of(exception.getName(), "Formato inválido."));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> missingParameter(MissingServletRequestParameterException exception) {
        return invalid(Map.of(exception.getParameterName(), "El parámetro es obligatorio."));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> unreadableBody(HttpMessageNotReadableException exception) {
        return invalid(Map.of("body", "El cuerpo JSON contiene valores inválidos o está incompleto."));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> integrityConflict(DataIntegrityViolationException exception) {
        return error(HttpStatus.CONFLICT, "CONFLICT", "Los datos ya existen o entran en conflicto con otro registro.");
    }

    @ExceptionHandler({OptimisticLockingFailureException.class, OptimisticLockException.class,
            PessimisticLockingFailureException.class, PessimisticLockException.class, LockTimeoutException.class})
    public ResponseEntity<ApiError> concurrentUpdate(RuntimeException exception) {
        return error(HttpStatus.CONFLICT, "CONFLICT", "El registro cambió. Actualice los datos antes de intentarlo nuevamente.");
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> unsupportedMethod(HttpRequestMethodNotSupportedException exception) {
        return error(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", "Método HTTP no permitido.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> unexpected(Exception exception) {
        log.error("Unexpected catalog API failure", exception);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "No se pudo completar la operación.");
    }

    private ResponseEntity<ApiError> invalid(Map<String, String> fieldErrors) {
        return ResponseEntity.badRequest().body(new ApiError(400, "VALIDATION_ERROR",
                "Revise los datos de la solicitud.", fieldErrors));
    }

    private ResponseEntity<ApiError> error(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(new ApiError(status.value(), code, message, Map.of()));
    }
}
