package com.prisma.api.application.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.prisma.api.domain.entities.User;
import com.prisma.api.domain.enums.UserRole;
import com.prisma.api.domain.repository.UserRepository;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.server.ResponseStatusException;

class AuthServiceTest {

    @Test
    void seededAdministratorPasswordMatchesTheDocumentedTemporaryCredential() {
        assertTrue(new BCryptPasswordEncoder().matches(
                "admin123", "$2a$10$b0.wWhwMjnnn9ERurLtt.e/ZUFDEH5jMIgRSu6uLT2csIygcyPQIC"));
    }

    private final UserRepository userRepository = mock(UserRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final JwtEncoder jwtEncoder = mock(JwtEncoder.class);
    private final Jwt jwt = mock(Jwt.class);
    private final AuthService authService = new AuthService(userRepository, passwordEncoder, jwtEncoder, 60000);

    @BeforeEach
    void setUp() {
        when(jwt.getTokenValue()).thenReturn("signed-token");
        when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(jwt);
    }

    @Test
    void loginReturnsTokenAndPublicUserForActiveAccount() {
        User user = new User("keila", "bcrypt-hash", "Keila", UserRole.ADMIN);
        user.setId(7L);
        when(userRepository.findByUsernameIgnoreCaseForUpdate("keila")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct-password", "bcrypt-hash")).thenReturn(true);

        AuthService.AuthResponse response = authService.login(" keila ", "correct-password");

        assertEquals("signed-token", response.token());
        assertEquals(7L, response.user().id());
        assertEquals("keila", response.user().username());
        assertEquals("Keila", response.user().fullName());
        assertEquals("ADMIN", response.user().role());
        assertFalse(response.user().mustChangePassword());
        assertEquals(60000, response.expiresIn());
        assertEquals(0, user.getFailedLoginAttempts());
        assertNull(user.getLockedUntil());
    }

    @Test
    void loginRejectsUnknownAccount() {
        when(userRepository.findByUsernameIgnoreCaseForUpdate("missing")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> authService.login("missing", "password"));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    void loginRejectsInactiveAccount() {
        User user = new User("disabled", "bcrypt-hash", "Disabled", UserRole.VENDEDOR);
        user.setActive(false);
        when(userRepository.findByUsernameIgnoreCaseForUpdate("disabled")).thenReturn(Optional.of(user));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> authService.login("disabled", "password"));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    void thirdConsecutiveFailedAttemptBlocksAccountForTenMinutes() {
        User user = new User("keila", "bcrypt-hash", "Keila", UserRole.ADMIN);
        when(userRepository.findByUsernameIgnoreCaseForUpdate("keila")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "bcrypt-hash")).thenReturn(false);

        for (int attempt = 1; attempt <= 2; attempt++) {
            ResponseStatusException exception = assertThrows(
                    ResponseStatusException.class, () -> authService.login("keila", "wrong-password"));
            assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
            assertEquals(attempt, user.getFailedLoginAttempts());
        }

        Instant beforeLock = Instant.now();
        ResponseStatusException lockedException = assertThrows(
                ResponseStatusException.class, () -> authService.login("keila", "wrong-password"));

        assertEquals(HttpStatus.LOCKED, lockedException.getStatusCode());
        assertEquals(0, user.getFailedLoginAttempts());
        assertTrue(user.getLockedUntil().isAfter(beforeLock.plusSeconds(9 * 60)));

        ResponseStatusException retryException = assertThrows(
                ResponseStatusException.class, () -> authService.login("keila", "correct-password"));
        assertEquals(HttpStatus.LOCKED, retryException.getStatusCode());
        verify(passwordEncoder, never()).matches("correct-password", "bcrypt-hash");
    }

    @Test
    void successfulLoginResetsPriorFailuresAndExpiredLock() {
        User user = new User("keila", "bcrypt-hash", "Keila", UserRole.ADMIN);
        user.setFailedLoginAttempts(2);
        user.setLockedUntil(Instant.now().minusSeconds(1));
        when(userRepository.findByUsernameIgnoreCaseForUpdate("keila")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct-password", "bcrypt-hash")).thenReturn(true);

        authService.login("keila", "correct-password");

        assertEquals(0, user.getFailedLoginAttempts());
        assertNull(user.getLockedUntil());
    }

    @Test
    void passwordChangeRemovesRequiredChangeFlagAndHashUpdatesPassword() {
        User user = new User("admin", "temporary-hash", "Administrator", UserRole.ADMIN);
        user.setMustChangePassword(true);
        when(userRepository.findByUsernameIgnoreCaseForUpdate("admin")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("admin123", "temporary-hash")).thenReturn(true);
        when(passwordEncoder.matches("Prisma2026!", "temporary-hash")).thenReturn(false);
        when(passwordEncoder.encode("Prisma2026!")).thenReturn("new-hash");

        AuthService.AuthResponse response = authService.changePassword("admin", "admin123", "Prisma2026!");

        assertEquals("new-hash", user.getPasswordHash());
        assertEquals("signed-token", response.token());
        assertFalse(response.user().mustChangePassword());
        assertEquals(0, user.getFailedLoginAttempts());
    }
}
