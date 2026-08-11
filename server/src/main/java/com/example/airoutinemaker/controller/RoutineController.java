package com.example.airoutinemaker.controller;

import com.example.airoutinemaker.dto.RoutineSaveRequest;
import com.example.airoutinemaker.dto.TaskStatusUpdateRequest;
import com.example.airoutinemaker.model.Routine;
import com.example.airoutinemaker.model.RoutineTask;
import com.example.airoutinemaker.model.User;
import com.example.airoutinemaker.service.AuthService;
import com.example.airoutinemaker.service.RoutineService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * RoutineController Class
 * REST Controller exposing API endpoints for saving, retrieving, updating,
 * and deleting user-specific routines.
 */
@RestController
@RequestMapping("/api/routines")
@CrossOrigin(origins = "${app.cors.origin}", allowCredentials = "true")
public class RoutineController {

    private final RoutineService routineService;
    private final AuthService authService;

    public RoutineController(RoutineService routineService, AuthService authService) {
        this.routineService = routineService;
        this.authService = authService;
    }

    /**
     * 1. CREATE & SAVE ROUTINE
     * POST /api/routines
     */
    @PostMapping
    public ResponseEntity<?> createRoutine(@RequestBody RoutineSaveRequest request, HttpSession session) {
        Optional<User> currentUser = authService.getCurrentUserEntity(session);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized. Please log in first."));
        }

        if (request.getGoal() == null || request.getGoal().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Main goal is required."));
        }

        try {
            Routine createdRoutine = routineService.createRoutine(request, currentUser.get());
            return new ResponseEntity<>(createdRoutine, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 2. GET ALL ROUTINES FOR CURRENT USER
     * GET /api/routines
     */
    @GetMapping
    public ResponseEntity<?> getUserRoutines(HttpSession session) {
        Optional<User> currentUser = authService.getCurrentUserEntity(session);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized. Please log in first."));
        }

        List<Routine> routines = routineService.getUserRoutines(currentUser.get());
        return ResponseEntity.ok(routines);
    }

    /**
     * 3. GET LATEST ROUTINE FOR CURRENT USER
     * GET /api/routines/latest
     */
    @GetMapping("/latest")
    public ResponseEntity<?> getLatestRoutine(HttpSession session) {
        Optional<User> currentUser = authService.getCurrentUserEntity(session);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized. Please log in first."));
        }

        Optional<Routine> routine = routineService.getLatestUserRoutine(currentUser.get());
        return routine.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<?> getRoutinesForDate(@PathVariable java.time.LocalDate date, HttpSession session) {
        Optional<User> currentUser = authService.getCurrentUserEntity(session);
        if (currentUser.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized. Please log in first."));
        return ResponseEntity.ok(routineService.getUserRoutinesForDate(currentUser.get(), date));
    }

    /**
     * 4. GET ROUTINE BY ID FOR CURRENT USER
     * GET /api/routines/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getRoutineById(@PathVariable Long id, HttpSession session) {
        Optional<User> currentUser = authService.getCurrentUserEntity(session);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized. Please log in first."));
        }

        Optional<Routine> routine = routineService.getRoutineByIdAndUser(id, currentUser.get());
        return routine.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((Routine) null));
    }

    /**
     * 5. UPDATE EXISTING ROUTINE
     * PUT /api/routines/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoutine(@PathVariable Long id, @RequestBody RoutineSaveRequest request, HttpSession session) {
        Optional<User> currentUser = authService.getCurrentUserEntity(session);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized. Please log in first."));
        }

        try {
            Optional<Routine> updatedRoutine = routineService.updateRoutine(id, request, currentUser.get());
            return updatedRoutine.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body((Routine) null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 6. UPDATE TASK COMPLETION STATUS
     * PUT /api/routines/tasks/{taskId}
     */
    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<?> updateTaskCompletion(
            @PathVariable Long taskId,
            @RequestBody TaskStatusUpdateRequest request,
            HttpSession session) {

        Optional<User> currentUser = authService.getCurrentUserEntity(session);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized. Please log in first."));
        }

        Optional<RoutineTask> updatedTask = routineService.updateTaskCompletion(taskId, request.getCompleted(), currentUser.get());
        return updatedTask.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((RoutineTask) null));
    }

    /**
     * 7. DELETE ROUTINE FOR CURRENT USER
     * DELETE /api/routines/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRoutine(@PathVariable Long id, HttpSession session) {
        Optional<User> currentUser = authService.getCurrentUserEntity(session);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized. Please log in first."));
        }

        boolean deleted = routineService.deleteRoutine(id, currentUser.get());
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Routine deleted successfully."));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Routine not found with id: " + id));
    }
}
