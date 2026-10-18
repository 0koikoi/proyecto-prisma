package com.prisma.api.application.auth.dto;

public record LoginResponse(
        String token,
        String tokenType,
        Long userId,
        String username,
        String fullName,
        String role
) {
    public static LoginResponse of(String token, Long userId, String username, String fullName, String role) {
        return new LoginResponse(token, "Bearer", userId, username, fullName, role);
    }
}
