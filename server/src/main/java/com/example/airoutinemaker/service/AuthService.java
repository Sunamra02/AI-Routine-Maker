package com.example.airoutinemaker.service;

import com.example.airoutinemaker.dto.LoginRequest;
import com.example.airoutinemaker.dto.SignUpRequest;
import com.example.airoutinemaker.dto.UserDTO;
import com.example.airoutinemaker.model.User;
import com.example.airoutinemaker.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    public static final String SESSION_USER_ID = "USER_ID";

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Registers a new student user.
     * Enforces username space check and hashes password with BCrypt.
     */
    public UserDTO signUp(SignUpRequest request, HttpSession session) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required.");
        }
        String username = request.getUsername().trim();
        if (username.contains(" ")) {
            throw new IllegalArgumentException("Username cannot contain any spaces.");
        }
        if (username.length() < 3) {
            throw new IllegalArgumentException("Username must be at least 3 characters long.");
        }

        if (request.getPassword() == null || request.getPassword().length() < 4) {
            throw new IllegalArgumentException("Password must be at least 4 characters long.");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken. Please choose another username.");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(username, hashedPassword);
        User savedUser = userRepository.save(user);

        // Store user ID in session
        session.setAttribute(SESSION_USER_ID, savedUser.getId());

        return new UserDTO(savedUser.getId(), savedUser.getUsername());
    }

    /**
     * Logs in an existing student user by validating credentials against hashed password.
     */
    public UserDTO login(LoginRequest request, HttpSession session) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required.");
        }
        String username = request.getUsername().trim();
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }

        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("Invalid username or password.");
        }

        User user = optionalUser.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password.");
        }

        // Store user ID in session
        session.setAttribute(SESSION_USER_ID, user.getId());

        return new UserDTO(user.getId(), user.getUsername());
    }

    /**
     * Logs out the user by invalidating the HTTP session.
     */
    public void logout(HttpSession session) {
        if (session != null) {
            session.invalidate();
        }
    }

    /**
     * Gets the currently authenticated User entity from session.
     */
    public Optional<User> getCurrentUserEntity(HttpSession session) {
        if (session == null) return Optional.empty();
        Object userIdObj = session.getAttribute(SESSION_USER_ID);
        if (userIdObj instanceof Long userId) {
            return userRepository.findById(userId);
        }
        return Optional.empty();
    }

    /**
     * Gets current user DTO from session.
     */
    public Optional<UserDTO> getCurrentUserDTO(HttpSession session) {
        return getCurrentUserEntity(session)
                .map(user -> new UserDTO(user.getId(), user.getUsername()));
    }
}
