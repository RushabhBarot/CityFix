package com.cityfix.controller;


import com.cityfix.dtos.AuthRequest;
import com.cityfix.dtos.AuthResponse;
import com.cityfix.dtos.UserRequestDTO;
import com.cityfix.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(value = "/register",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AuthResponse register(@ModelAttribute UserRequestDTO request) throws IOException {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@RequestHeader("Authorization") String refreshToken) {
        refreshToken = refreshToken.replace("Bearer ", "");
        return authService.refreshToken(refreshToken);
    }
}
