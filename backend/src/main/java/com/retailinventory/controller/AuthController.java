package com.retailinventory.controller;

import com.retailinventory.dto.ApiResponse;
import com.retailinventory.dto.auth.AdminBootstrapRequest;
import com.retailinventory.dto.auth.AuthResponse;
import com.retailinventory.dto.auth.ForgotPasswordRequest;
import com.retailinventory.dto.auth.LoginRequest;
import com.retailinventory.dto.auth.RegisterRequest;
import com.retailinventory.dto.auth.ResetPasswordRequest;
import com.retailinventory.dto.auth.UserResponse;
import com.retailinventory.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/bootstrap-admin")
    public ResponseEntity<ApiResponse<AuthResponse>> bootstrapAdmin(@Valid @RequestBody AdminBootstrapRequest request) {
        AuthResponse response = authService.bootstrapAdmin(request);
        return ResponseEntity.ok(ApiResponse.success("Initial administrator account created successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
            "If an account with this email exists, password reset instructions have been generated.",
            null
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
            "Password has been reset successfully. Please sign in with your new password.",
            null
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        UserResponse response = authService.getCurrentUser(email);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
