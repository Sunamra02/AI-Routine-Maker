package com.example.airoutinemaker.service;

import com.example.airoutinemaker.dto.RoutineRequest;
import com.example.airoutinemaker.model.Routine;
import com.example.airoutinemaker.model.RoutineTask;
import com.example.airoutinemaker.repository.RoutineRepository;
import com.example.airoutinemaker.repository.RoutineTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * RoutineService Class
 * Contains business logic for routine creation, algorithm task generation, database persistence, and task updates.
 */
@Service
public class RoutineService {

    private final RoutineRepository routineRepository;
    private final RoutineTaskRepository routineTaskRepository;

    @Autowired
    public RoutineService(RoutineRepository routineRepository, RoutineTaskRepository routineTaskRepository) {
        this.routineRepository = routineRepository;
        this.routineTaskRepository = routineTaskRepository;
    }

    /**
     * Creates a new routine and generates tailored tasks based on user's goal and schedule parameters.
     */
    @Transactional
    public Routine createRoutine(RoutineRequest request) {
        // 1. Create Routine Object
        Routine routine = new Routine(
                request.getGoal(),
                request.getAvailableHours(),
                request.getWakeUpTime() != null ? request.getWakeUpTime() : LocalTime.of(7, 0),
                request.getSleepTime() != null ? request.getSleepTime() : LocalTime.of(23, 0),
                request.getDifficulty() != null ? request.getDifficulty() : "Intermediate"
        );

        // 2. Generate tasks based on user goal and schedule
        generateRoutineTasks(routine);

        // 3. Save Routine (Cascades saving tasks)
        return routineRepository.save(routine);
    }

    /**
     * Pure Java Routine Generation Logic
     * NOTE: Can later be replaced by an external AI API call service.
     */
    private void generateRoutineTasks(Routine routine) {
        String goalLower = routine.getGoal().toLowerCase();
        LocalTime wakeTime = routine.getWakeUpTime();
        Integer hours = routine.getAvailableHours() != null ? routine.getAvailableHours() : 4;
        String difficulty = routine.getDifficulty() != null ? routine.getDifficulty() : "Intermediate";

        // Determine activity subjects based on goal keywords
        String primaryActivity;
        String secondaryActivity;

        if (goalLower.contains("programming") || goalLower.contains("coding") || goalLower.contains("java") || goalLower.contains("python") || goalLower.contains("software")) {
            primaryActivity = "Programming Practice & Coding Problems";
            secondaryActivity = "Project Work & Code Debugging";
        } else if (goalLower.contains("exam") || goalLower.contains("study") || goalLower.contains("test") || goalLower.contains("aptitude")) {
            primaryActivity = "Subject Study & Theory Review";
            secondaryActivity = "Aptitude Practice & Mock Test";
        } else {
            primaryActivity = "Goal-focused Study (" + routine.getGoal() + ")";
            secondaryActivity = "Hands-on Practice & Skill Revision";
        }

        // Generate baseline routine tasks using wakeUpTime
        LocalTime currentTime = wakeTime;

        // Morning Wake Up
        routine.addTask(new RoutineTask(currentTime, "Morning Exercise & Hydration", 30, false));
        currentTime = currentTime.plusMinutes(30);

        // Breakfast
        routine.addTask(new RoutineTask(currentTime, "Breakfast & Goal Planning", 30, false));
        currentTime = currentTime.plusMinutes(60); // Breakfast + prep time

        // Primary Study Session
        int mainSessionDuration = Math.min(hours * 30, 90);
        routine.addTask(new RoutineTask(currentTime, primaryActivity, mainSessionDuration, false));
        currentTime = currentTime.plusMinutes(mainSessionDuration + 30);

        // Short Break
        routine.addTask(new RoutineTask(currentTime, "Short Rest & Snack Break", 30, false));
        currentTime = currentTime.plusMinutes(30);

        // Secondary Session
        int secondSessionDuration = difficulty.equalsIgnoreCase("Advanced") ? 90 : 60;
        routine.addTask(new RoutineTask(currentTime, secondaryActivity, secondSessionDuration, false));
        currentTime = currentTime.plusMinutes(secondSessionDuration + 60);

        // Lunch
        routine.addTask(new RoutineTask(currentTime, "Lunch & Relaxation", 60, false));
        currentTime = currentTime.plusMinutes(120);

        // Revision
        routine.addTask(new RoutineTask(currentTime, "Revision & Self Assessment", 60, false));
        currentTime = currentTime.plusMinutes(180);

        // Evening Review
        routine.addTask(new RoutineTask(currentTime, "Daily Review & Wind Down", 30, false));
    }

    /**
     * Retrieve all routines
     */
    public List<Routine> getAllRoutines() {
        return routineRepository.findAll();
    }

    /**
     * Retrieve routine by ID
     */
    public Optional<Routine> getRoutineById(Long id) {
        return routineRepository.findById(id);
    }

    /**
     * Update task completion status
     */
    @Transactional
    public Optional<RoutineTask> updateTaskCompletion(Long taskId, Boolean completed) {
        Optional<RoutineTask> optionalTask = routineTaskRepository.findById(taskId);
        if (optionalTask.isPresent()) {
            RoutineTask task = optionalTask.get();
            task.setCompleted(completed != null ? completed : false);
            return Optional.of(routineTaskRepository.save(task));
        }
        return Optional.empty();
    }

    /**
     * Delete routine and associated tasks
     */
    @Transactional
    public boolean deleteRoutine(Long id) {
        if (routineRepository.existsById(id)) {
            routineRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
