package com.prisma.api.infrastructure.controllers;

import com.prisma.api.application.auth.AuthService;
import com.prisma.api.application.auth.AuthService.AuthResponse;
import com.prisma.api.application.auth.AuthService.UserResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.username(), request.password());
    }

    @GetMapping("/me")
    public UserResponse currentUser(@AuthenticationPrincipal Jwt jwt) {
        return authService.getCurrentUser(jwt.getSubject());
    }

    @PostMapping("/change-password")
    public AuthResponse changePassword(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ChangePasswordRequest request) {
        return authService.changePassword(jwt.getSubject(), request.currentPassword(), request.newPassword());
    }

    public record LoginRequest(
            @NotBlank @Size(max = 50) String username,
            @NotBlank @Size(max = 100) String password) {
    }

    public record ChangePasswordRequest(
            @NotBlank @Size(max = 100) String currentPassword,
            @NotBlank @Size(min = 8, max = 100)
            @Pattern(
                    regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).+$",
                    message = "La contraseña debe tener una mayúscula, un número y un símbolo.")
            String newPassword) {
    }
}
