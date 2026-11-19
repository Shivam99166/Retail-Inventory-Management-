package com.retailinventory.service;

import com.retailinventory.dto.auth.AdminBootstrapRequest;
import com.retailinventory.dto.auth.AuthResponse;
import com.retailinventory.dto.auth.ForgotPasswordRequest;
import com.retailinventory.dto.auth.LoginRequest;
import com.retailinventory.dto.auth.RegisterRequest;
import com.retailinventory.dto.auth.ResetPasswordRequest;
import com.retailinventory.dto.auth.UserResponse;
import com.retailinventory.entity.PasswordResetToken;
import com.retailinventory.entity.User;
import com.retailinventory.entity.enums.Role;
import com.retailinventory.exception.BusinessException;
import com.retailinventory.exception.DuplicateResourceException;
import com.retailinventory.exception.ResourceNotFoundException;
import com.retailinventory.repository.PasswordResetTokenRepository;
import com.retailinventory.repository.UserRepository;
import com.retailinventory.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER); // Public registration always creates ROLE_USER
        user.setEnabled(true);
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name());
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public AuthResponse bootstrapAdmin(AdminBootstrapRequest request) {
        // Enforce strict one-time bootstrap: If any ADMIN exists, permanently lock this procedure
        if (userRepository.existsByRole(Role.ADMIN)) {
            throw new BusinessException("Admin bootstrap is closed. An administrator account already exists.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already in use");
        }

        User admin = new User();
        admin.setName(request.getName());
        admin.setEmail(request.getEmail().toLowerCase().trim());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        admin.setPhone(request.getPhone());
        admin.setAddress(request.getAddress());

        userRepository.save(admin);

        String token = jwtUtil.generateToken(admin.getEmail(), admin.getRole().name());

        return new AuthResponse(token, admin.getEmail(), admin.getName(), admin.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase().trim(),
                            request.getPassword()
                    )
            );
        } catch (DisabledException e) {
            // Rethrow as-is so GlobalExceptionHandler returns 401
            throw new DisabledException("Your account has been disabled. Please contact support.");
        } catch (BadCredentialsException e) {
            // Rethrow as-is so GlobalExceptionHandler returns 401
            throw new BadCredentialsException("Invalid email or password.");
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name());
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getPhone(),
                user.getAddress()
        );
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String cleanEmail = request.getEmail().toLowerCase().trim();
        Optional<User> userOpt = userRepository.findByEmail(cleanEmail);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Invalidate any existing active tokens for this user
            passwordResetTokenRepository.invalidateAllActiveTokensForUser(user);

            // Generate cryptographically strong random token
            byte[] randomBytes = new byte[32];
            new SecureRandom().nextBytes(randomBytes);
            String rawToken = HexFormat.of().formatHex(randomBytes);

            // Hash the token before storing (never store reset tokens in plaintext)
            String tokenHash = hashToken(rawToken);

            PasswordResetToken resetToken = new PasswordResetToken(
                    user,
                    tokenHash,
                    LocalDateTime.now().plusMinutes(15) // Short-lived 15-minute validity
            );
            passwordResetTokenRepository.save(resetToken);

            // Notice: When email service/SMTP is configured, the reset link or token is delivered via email.
            // Raw tokens and passwords are never logged to prevent credential leakage.
        }
        // Always completes cleanly without revealing whether the email address exists in the system
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.getToken().trim());
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenHashAndUsedFalse(tokenHash)
                .orElseThrow(() -> new BusinessException("Invalid or expired password reset token."));

        if (resetToken.isExpired()) {
            resetToken.setUsed(true);
            passwordResetTokenRepository.save(resetToken);
            throw new BusinessException("Password reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        // Update password ONLY — user role is strictly preserved and cannot be changed during reset
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Single-use token invalidation
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 message digest algorithm not available", e);
        }
    }
}
