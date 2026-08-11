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

import java.time.LocalDate;
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
        validateRequest(request);
        Routine routine = new Routine(
                request.getGoal(),
                request.getAvailableHours() != null ? request.getAvailableHours() : 6,
                request.getWakeUpTime() != null ? request.getWakeUpTime() : LocalTime.of(7, 0),
                request.getSleepTime() != null ? request.getSleepTime() : LocalTime.of(23, 0),
                request.getDifficulty() != null ? request.getDifficulty() : "Intermediate"
        );
        routine.setRoutineDate(request.getRoutineDate());
        routine.setUser(user);
        addValidatedTasks(routine, request.getTasks(), user);

        return routineRepository.save(routine);
    }

    /**
     * Retrieves all routines belonging to the authenticated user.
     */
    public List<Routine> getUserRoutines(User user) {
        return routineRepository.findByUserIdOrderByIdDesc(user.getId());
    }

    public List<Routine> getUserRoutinesForDate(User user, LocalDate date) {
        return routineRepository.findByUserIdAndRoutineDateOrderByIdDesc(user.getId(), date);
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
        if (request.getRoutineDate() == null) request.setRoutineDate(routine.getRoutineDate());
        validateRequest(request);
        if (request.getGoal() != null) routine.setGoal(request.getGoal());
        if (request.getAvailableHours() != null) routine.setAvailableHours(request.getAvailableHours());
        if (request.getWakeUpTime() != null) routine.setWakeUpTime(request.getWakeUpTime());
        if (request.getSleepTime() != null) routine.setSleepTime(request.getSleepTime());
        if (request.getDifficulty() != null) routine.setDifficulty(request.getDifficulty());
        routine.setRoutineDate(request.getRoutineDate());

        // Replace tasks
        routine.getTasks().clear();
        addValidatedTasks(routine, request.getTasks(), user);

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

    private void validateRequest(RoutineSaveRequest request) {
        LocalDate date = request.getRoutineDate();
        if (date == null) throw new IllegalArgumentException("Routine date is required.");
        if (date.isBefore(LocalDate.now())) throw new IllegalArgumentException("A routine cannot be scheduled for a past date.");
        if (date.equals(LocalDate.now()) && LocalTime.now().isAfter(LocalTime.of(23, 57))) throw new IllegalArgumentException("There is not enough time left today to create a routine.");
        LocalTime start = request.getWakeUpTime() == null ? LocalTime.of(7, 0) : request.getWakeUpTime();
        LocalTime end = request.getSleepTime() == null ? LocalTime.of(23, 0) : request.getSleepTime();
        if (!end.isAfter(start)) throw new IllegalArgumentException("Routine end time must be after its start time.");
        if (date.equals(LocalDate.now()) && start.isBefore(nextAvailableMinute())) {
            throw new IllegalArgumentException("Today's routine cannot start in the past.");
        }
    }

    private void addValidatedTasks(Routine routine, List<AiTaskDTO> taskDtos, User user) {
        if (taskDtos == null || taskDtos.isEmpty()) throw new IllegalArgumentException("A routine needs at least one task.");
        if (taskDtos.size() > 20) throw new IllegalArgumentException("A routine can contain at most 20 tasks.");
        List<RoutineTask> accepted = new java.util.ArrayList<>();
        for (AiTaskDTO dto : taskDtos) {
            if (dto == null || dto.getActivity() == null || dto.getActivity().trim().isEmpty()) throw new IllegalArgumentException("Every task needs an activity.");
            LocalTime taskTime;
            try { taskTime = LocalTime.parse(dto.getTime(), TIME_FORMATTER); }
            catch (Exception e) { throw new IllegalArgumentException("Task time must use HH:mm format."); }
            int duration = dto.getDuration() == null ? 0 : dto.getDuration();
            if (duration <= 0 || duration > 240) throw new IllegalArgumentException("Task duration must be between 1 and 240 minutes.");
            LocalTime taskEnd = taskTime.plusMinutes(duration);
            if (taskEnd.isBefore(taskTime) || taskEnd.isAfter(LocalTime.of(23, 59))) throw new IllegalArgumentException("Tasks must finish by 23:59.");
            if (taskTime.isBefore(routine.getWakeUpTime()) || taskEnd.isAfter(routine.getSleepTime())) throw new IllegalArgumentException("Tasks must stay within the routine start and end time.");
            if (routine.getRoutineDate().equals(LocalDate.now()) && taskTime.isBefore(nextAvailableMinute())) throw new IllegalArgumentException("Today's tasks cannot be scheduled in the past.");
            for (RoutineTask existing : accepted) {
                LocalTime existingEnd = existing.getTime().plusMinutes(existing.getDuration());
                if (taskTime.isBefore(existingEnd) && existing.getTime().isBefore(taskEnd)) throw new IllegalArgumentException("Tasks cannot overlap.");
            }
            RoutineTask task = new RoutineTask(taskTime, dto.getActivity().trim(), duration, false);
            task.setUser(user); routine.addTask(task); accepted.add(task);
        }
    }

    private LocalTime nextAvailableMinute() {
        LocalTime now = LocalTime.now();
        return now.plusMinutes(1).withSecond(0).withNano(0);
    }
}
