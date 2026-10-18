package com.prisma.api.application.auth;

import com.prisma.api.application.auth.dto.LoginRequest;
import com.prisma.api.application.auth.dto.LoginResponse;
import com.prisma.api.domain.entities.User;
import com.prisma.api.domain.enums.UserRole;
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.infrastructure.config.JwtService;
import com.prisma.api.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("admin", "$2a$10$hashedPassword", "Administrador General", UserRole.ADMIN);
        sampleUser.setId(1L);
    }

    @Test
    @DisplayName("Login exitoso debe retornar token JWT y datos de usuario")
    void loginSuccess() {
        LoginRequest request = new LoginRequest("admin", "admin123");

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("admin123", sampleUser.getPasswordHash())).thenReturn(true);
        when(jwtService.generateToken("admin", "ADMIN", 1L)).thenReturn("mocked.jwt.token");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.token());
        assertEquals("Bearer", response.tokenType());
        assertEquals(1L, response.userId());
        assertEquals("admin", response.username());
        assertEquals("ADMIN", response.role());
    }

    @Test
    @DisplayName("Login con usuario inexistente debe lanzar BusinessRuleException con INVALID_CREDENTIALS")
    void loginUserNotFound() {
        LoginRequest request = new LoginRequest("inexistente", "clave123");
        when(userRepository.findByUsername("inexistente")).thenReturn(Optional.empty());

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> authService.login(request));
        assertEquals("INVALID_CREDENTIALS", ex.getCode());
    }

    @Test
    @DisplayName("Login con contraseña incorrecta debe lanzar BusinessRuleException con INVALID_CREDENTIALS")
    void loginWrongPassword() {
        LoginRequest request = new LoginRequest("admin", "clave_mala");

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("clave_mala", sampleUser.getPasswordHash())).thenReturn(false);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> authService.login(request));
        assertEquals("INVALID_CREDENTIALS", ex.getCode());
    }

    @Test
    @DisplayName("Login con usuario inactivo debe lanzar BusinessRuleException con USER_INACTIVE")
    void loginUserInactive() {
        sampleUser.setActive(false);
        LoginRequest request = new LoginRequest("admin", "admin123");

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(sampleUser));

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> authService.login(request));
        assertEquals("USER_INACTIVE", ex.getCode());
    }
}
