package com.prisma.api.application.auth;

import com.prisma.api.domain.entities.User;
import com.prisma.api.domain.repository.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 3;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(10);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final long expirationMs;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            @Value("${jwt.expiration-ms:86400000}") long expirationMs) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.expirationMs = expirationMs;
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public AuthResponse login(String username, String password) {
        User user = userRepository.findByUsernameIgnoreCaseForUpdate(username.trim())
                .filter(User::isActive)
                .orElseThrow(() -> invalidCredentials());

        Instant now = Instant.now();
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) {
            long minutesRemaining = Math.max(1, Duration.between(now, user.getLockedUntil()).toMinutes() + 1);
            throw new ResponseStatusException(
                    HttpStatus.LOCKED,
                    "Tu cuenta está bloqueada temporalmente. Intenta de nuevo en " + minutesRemaining + " minutos.");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            if (user.getLockedUntil() != null) {
                user.setLockedUntil(null);
                user.setFailedLoginAttempts(0);
            }
            int failedAttempts = user.getFailedLoginAttempts() + 1;
            if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
                user.setFailedLoginAttempts(0);
                user.setLockedUntil(now.plus(LOCK_DURATION));
                throw new ResponseStatusException(
                        HttpStatus.LOCKED,
                        "Tu cuenta se bloqueó por 10 minutos tras 3 intentos fallidos.");
            }
            user.setFailedLoginAttempts(failedAttempts);
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Usuario o contraseña incorrectos. Te quedan "
                            + (MAX_FAILED_ATTEMPTS - failedAttempts) + " intentos.");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);

        return createAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        return userRepository.findByUsernameIgnoreCase(username)
                .filter(User::isActive)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión no válida."));
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public AuthResponse changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsernameIgnoreCaseForUpdate(username)
                .filter(User::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión no válida."));
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual no es correcta.");
        }
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "La nueva contraseña debe ser diferente a la actual.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        return createAuthResponse(user);
    }

    private AuthResponse createAuthResponse(User user) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(expirationMs, ChronoUnit.MILLIS);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("prisma-api")
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(user.getUsername())
                .claim("role", user.getRole().name())
                .claim("name", user.getFullName())
                .claim("mustChangePassword", user.isMustChangePassword())
                .build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new AuthResponse(token, UserResponse.from(user), expirationMs);
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos.");
    }

    public record AuthResponse(String token, UserResponse user, long expiresIn) {
    }

    public record UserResponse(Long id, String username, String fullName, String role, boolean mustChangePassword) {
        static UserResponse from(User user) {
            return new UserResponse(
                    user.getId(), user.getUsername(), user.getFullName(), user.getRole().name(),
                    user.isMustChangePassword());
        }
    }
}
