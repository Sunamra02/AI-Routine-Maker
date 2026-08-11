package com.example.airoutinemaker.controller;

import com.example.airoutinemaker.dto.RoutineRequest;
import com.example.airoutinemaker.dto.TaskStatusUpdateRequest;
import com.example.airoutinemaker.model.Routine;
import com.example.airoutinemaker.model.RoutineTask;
import com.example.airoutinemaker.service.RoutineService;
// import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * RoutineController Class
 * REST Controller exposing API endpoints for creating, retrieving, updating,
 * and deleting routines.
 * Enables CORS for React frontend running at http://localhost:5173.
 */
@RestController
@RequestMapping("/api/routines")
@CrossOrigin(origins = "${app.cors.origin}")
public class RoutineController {

    private final RoutineService routineService;

    // @Autowired
    public RoutineController(RoutineService routineService) {
        this.routineService = routineService;
    }

    /**
     * 1. CREATE ROUTINE
     * POST /api/routines
     */
    @PostMapping
    public ResponseEntity<Routine> createRoutine(@RequestBody RoutineRequest request) {
        if (request.getGoal() == null || request.getGoal().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Routine createdRoutine = routineService.createRoutine(request);
        return new ResponseEntity<>(createdRoutine, HttpStatus.CREATED);
    }

    /**
     * 2. GET ALL ROUTINES
     * GET /api/routines
     */
    @GetMapping
    public ResponseEntity<List<Routine>> getAllRoutines() {
        List<Routine> routines = routineService.getAllRoutines();
        return ResponseEntity.ok(routines);
    }

    /**
     * 3. GET ROUTINE BY ID
     * GET /api/routines/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Routine> getRoutineById(@PathVariable Long id) {
        Optional<Routine> routine = routineService.getRoutineById(id);
        return routine.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * 4. UPDATE TASK COMPLETION
     * PUT /api/routines/tasks/{taskId}
     */
    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<RoutineTask> updateTaskCompletion(
            @PathVariable Long taskId,
            @RequestBody TaskStatusUpdateRequest request) {

        Optional<RoutineTask> updatedTask = routineService.updateTaskCompletion(taskId, request.getCompleted());
        return updatedTask.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * 5. DELETE ROUTINE
     * DELETE /api/routines/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRoutine(@PathVariable Long id) {
        boolean deleted = routineService.deleteRoutine(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Routine deleted successfully."));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Routine not found with id: " + id));
    }
}
