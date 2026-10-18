package com.prisma.api.infrastructure.web;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Estructura estándar de error HTTP de Tienda Prisma.
 * Compatible con apiClient.js en frontend (consume el campo `message`).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {

    private final Instant timestamp;
    private final int status;
    private final String error;
    private final String message;
    private final String code;
    private final List<Map<String, String>> fieldErrors;

    public ApiError(int status, String error, String message, String code, List<Map<String, String>> fieldErrors) {
        this.timestamp = Instant.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.code = code;
        this.fieldErrors = fieldErrors;
    }

    public static ApiError of(int status, String error, String message, String code) {
        return new ApiError(status, error, message, code, null);
    }

    public static ApiError ofValidation(int status, String error, String message, List<Map<String, String>> fieldErrors) {
        return new ApiError(status, error, message, "VALIDATION_FAILED", fieldErrors);
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public String getCode() {
        return code;
    }

    public List<Map<String, String>> getFieldErrors() {
        return fieldErrors;
    }
}
