package com.prisma.api.application.auth;

import com.prisma.api.application.auth.dto.LoginRequest;
import com.prisma.api.application.auth.dto.LoginResponse;
import com.prisma.api.domain.entities.User;
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.infrastructure.config.JwtService;
import com.prisma.api.infrastructure.persistence.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BusinessRuleException("INVALID_CREDENTIALS", "Usuario o contraseña incorrectos"));

        if (!user.isActive()) {
            throw new BusinessRuleException("USER_INACTIVE", "El usuario se encuentra inactivo. Contacte al administrador.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessRuleException("INVALID_CREDENTIALS", "Usuario o contraseña incorrectos");
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole().name(), user.getId());

        return LoginResponse.of(
                token,
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getRole().name()
        );
    }
}
