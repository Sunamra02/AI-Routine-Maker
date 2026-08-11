package com.example.airoutinemaker.service;

import com.example.airoutinemaker.dto.AiTaskDTO;
import com.example.airoutinemaker.dto.RoutineSaveRequest;
import com.example.airoutinemaker.model.Routine;
import com.example.airoutinemaker.model.RoutineTask;
import com.example.airoutinemaker.model.User;
import com.example.airoutinemaker.repository.RoutineRepository;
import com.example.airoutinemaker.repository.RoutineTaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

/**
 * RoutineService Class
 * Handles DB persistence, updating, retrieval, and deletion of user routines and tasks.
 */
@Service
public class RoutineService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final RoutineRepository routineRepository;
    private final RoutineTaskRepository routineTaskRepository;

    public RoutineService(RoutineRepository routineRepository, RoutineTaskRepository routineTaskRepository) {
        this.routineRepository = routineRepository;
        this.routineTaskRepository = routineTaskRepository;
    }

    /**
     * Creates and saves a new routine along with user-selected/custom tasks.
     */
    @Transactional
    public Routine createRoutine(RoutineSaveRequest request, User user) {
        Routine routine = new Routine(
                request.getGoal(),
                request.getAvailableHours() != null ? request.getAvailableHours() : 6,
                request.getWakeUpTime() != null ? request.getWakeUpTime() : LocalTime.of(7, 0),
                request.getSleepTime() != null ? request.getSleepTime() : LocalTime.of(23, 0),
                request.getDifficulty() != null ? request.getDifficulty() : "Intermediate"
        );
        routine.setUser(user);

        if (request.getTasks() != null) {
            for (AiTaskDTO taskDTO : request.getTasks()) {
                LocalTime taskTime;
                try {
                    taskTime = LocalTime.parse(taskDTO.getTime(), TIME_FORMATTER);
                } catch (Exception e) {
                    taskTime = routine.getWakeUpTime();
                }
                RoutineTask task = new RoutineTask(
                        taskTime,
                        taskDTO.getActivity() != null ? taskDTO.getActivity() : "Task Activity",
                        taskDTO.getDuration() != null ? taskDTO.getDuration() : 30,
                        false
                );
                routine.addTask(task);
            }
        }

        return routineRepository.save(routine);
    }

    /**
     * Retrieves all routines belonging to the authenticated user.
     */
    public List<Routine> getUserRoutines(User user) {
        return routineRepository.findByUserIdOrderByIdDesc(user.getId());
    }

    /**
     * Retrieves the latest routine belonging to the authenticated user.
     */
    public Optional<Routine> getLatestUserRoutine(User user) {
        List<Routine> routines = routineRepository.findByUserIdOrderByIdDesc(user.getId());
        if (routines.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(routines.get(0));
    }

    /**
     * Retrieves routine by ID verifying user ownership.
     */
    public Optional<Routine> getRoutineByIdAndUser(Long id, User user) {
        return routineRepository.findByIdAndUserId(id, user.getId());
    }

    /**
     * Updates an existing routine and its tasks for the authenticated user.
     */
    @Transactional
    public Optional<Routine> updateRoutine(Long id, RoutineSaveRequest request, User user) {
        Optional<Routine> optionalRoutine = routineRepository.findByIdAndUserId(id, user.getId());
        if (optionalRoutine.isEmpty()) {
            return Optional.empty();
        }

        Routine routine = optionalRoutine.get();
        if (request.getGoal() != null) routine.setGoal(request.getGoal());
        if (request.getAvailableHours() != null) routine.setAvailableHours(request.getAvailableHours());
        if (request.getWakeUpTime() != null) routine.setWakeUpTime(request.getWakeUpTime());
        if (request.getSleepTime() != null) routine.setSleepTime(request.getSleepTime());
        if (request.getDifficulty() != null) routine.setDifficulty(request.getDifficulty());

        // Replace tasks
        routine.getTasks().clear();
        if (request.getTasks() != null) {
            for (AiTaskDTO taskDTO : request.getTasks()) {
                LocalTime taskTime;
                try {
                    taskTime = LocalTime.parse(taskDTO.getTime(), TIME_FORMATTER);
                } catch (Exception e) {
                    taskTime = routine.getWakeUpTime();
                }
                RoutineTask task = new RoutineTask(
                        taskTime,
                        taskDTO.getActivity() != null ? taskDTO.getActivity() : "Task Activity",
                        taskDTO.getDuration() != null ? taskDTO.getDuration() : 30,
                        false
                );
                routine.addTask(task);
            }
        }

        return Optional.of(routineRepository.save(routine));
    }

    /**
     * Updates task completion status verifying user ownership of the parent routine.
     */
    @Transactional
    public Optional<RoutineTask> updateTaskCompletion(Long taskId, Boolean completed, User user) {
        Optional<RoutineTask> optionalTask = routineTaskRepository.findById(taskId);
        if (optionalTask.isPresent()) {
            RoutineTask task = optionalTask.get();
            if (task.getRoutine() != null && task.getRoutine().getUser() != null
                    && task.getRoutine().getUser().getId().equals(user.getId())) {
                task.setCompleted(completed != null ? completed : false);
                return Optional.of(routineTaskRepository.save(task));
            }
        }
        return Optional.empty();
    }

    /**
     * Deletes user routine verifying user ownership.
     */
    @Transactional
    public boolean deleteRoutine(Long id, User user) {
        Optional<Routine> optionalRoutine = routineRepository.findByIdAndUserId(id, user.getId());
        if (optionalRoutine.isPresent()) {
            routineRepository.delete(optionalRoutine.get());
            return true;
        }
        return false;
    }
}
