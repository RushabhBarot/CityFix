package com.cityfix.service;


import com.cityfix.dtos.AuthRequest;
import com.cityfix.dtos.AuthResponse;
import com.cityfix.dtos.RegisterRequest;
import com.cityfix.entity.User;
import com.cityfix.repository.UserRepository;
import com.cityfix.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), new HashMap<>());
        String refresh = jwtService.generateRefreshToken(user.getEmail());

        return new AuthResponse(token, refresh);
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtService.generateToken(user.getEmail(), new HashMap<>());
        String refresh = jwtService.generateRefreshToken(user.getEmail());

        return new AuthResponse(token, refresh);
    }

    public AuthResponse refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        if (!jwtService.isTokenValid(refreshToken, username)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String newAccess = jwtService.generateToken(username, new HashMap<>());
        return new AuthResponse(newAccess, refreshToken);
    }
}
