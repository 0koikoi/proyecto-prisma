package com.prisma.api.infrastructure.error;

import java.util.Map;

public record ApiError(int status, String code, String message, Map<String, String> fieldErrors) {
    public ApiError {
        fieldErrors = fieldErrors == null ? Map.of() : Map.copyOf(fieldErrors);
    }
}
