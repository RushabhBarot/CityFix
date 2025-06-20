package com.cityfix.service;


import com.cityfix.dtos.AuthRequest;
import com.cityfix.dtos.AuthResponse;
import com.cityfix.dtos.UserRequestDTO;
import com.cityfix.entity.User;
import com.cityfix.entity.enums.Role;
import com.cityfix.repository.UserRepository;
import com.cityfix.security.CustomUserDetails;
import com.cityfix.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;



@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(UserRequestDTO request) throws IOException {
        User.UserBuilder userBuilder = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .mobileNumber(request.getMobileNumber())
                .role(request.getRole());

        // Handle optional profile photo
        if (request.getProfilePhoto() != null && !request.getProfilePhoto().isEmpty()) {
            userBuilder.profilePhoto(request.getProfilePhoto().getBytes());
        }

        // Handle role-specific fields
        if (request.getRole() == Role.WORKER) {
            userBuilder.department(request.getDepartment());
            userBuilder.idCardPhoto(request.getIdCard().getBytes());
            userBuilder.active(false); // Workers are inactive by default
        } else {
            userBuilder.active(true); // Citizens (and admins if registered this way)
        }

        User user = userBuilder.build();
        userRepository.save(user);

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("roles", List.of(user.getRole().name()));

        String token = jwtService.generateToken(user.getEmail(), extraClaims);
        String refresh = jwtService.generateRefreshToken(user.getEmail());

        return new AuthResponse(token, refresh);
    }


    public AuthResponse login(AuthRequest request) {
        try{
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword()
                    )
            );
        }catch (Exception e){
            e.printStackTrace();
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }

        var user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("roles", List.of(user.getRole().name()));  // Add roles claim

        String token = jwtService.generateToken(user.getEmail(), extraClaims);
        String refresh = jwtService.generateRefreshToken(user.getEmail());

        return new AuthResponse(token, refresh);
    }

    public AuthResponse refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = new CustomUserDetails(user);

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new RuntimeException("Invalid refresh token");
        }

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("roles", List.of(user.getRole().name()));

        String newAccess = jwtService.generateToken(username, new HashMap<>());
        return new AuthResponse(newAccess, refreshToken);
    }
}
