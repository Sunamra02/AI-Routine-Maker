package com.example.airoutinemaker.controller;

import com.example.airoutinemaker.dto.*;
import com.example.airoutinemaker.model.User;
import com.example.airoutinemaker.service.AiRoutineService;
import com.example.airoutinemaker.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "${app.cors.origin}", allowCredentials = "true")
public class AiController {

    private final AiRoutineService aiRoutineService;
    private final AuthService authService;

    public AiController(AiRoutineService aiRoutineService, AuthService authService) {
        this.aiRoutineService = aiRoutineService;
        this.authService = authService;
    }

    /**
     * Request AI Routine Suggestions (3 options)
     * POST /api/ai/suggest-routines
     */
    @PostMapping("/suggest-routines")
    public ResponseEntity<?> suggestRoutines(@RequestBody AiRoutineSuggestRequest request, HttpSession session) {
        Optional<User> currentUser = authService.getCurrentUserEntity(session);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Please log in to receive AI routine suggestions."));
        }

        if (request.getGoal() == null || request.getGoal().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Goal is required for AI routine suggestions."));
        }

        try {
            AiRoutineSuggestResponse response = aiRoutineService.suggestRoutines(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Unable to get AI suggestions right now. You can create your routine manually."));
        }
    }

    /**
     * Request AI Task Suggestions for a routine
     * POST /api/ai/suggest-tasks
     */
    @PostMapping("/suggest-tasks")
    public ResponseEntity<?> suggestTasks(@RequestBody AiTaskSuggestRequest request, HttpSession session) {
        Optional<User> currentUser = authService.getCurrentUserEntity(session);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Please log in to receive AI task suggestions."));
        }

        if (request.getGoal() == null || request.getGoal().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Goal is required for AI task suggestions."));
        }

        try {
            AiTaskSuggestResponse response = aiRoutineService.suggestTasks(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "The AI response could not be processed. Please try again or create tasks manually."));
        }
    }
}
