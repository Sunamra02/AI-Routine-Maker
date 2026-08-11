package com.example.airoutinemaker.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Routine Entity
 * Represents a personalized daily routine created by a student.
 */
@Entity
@Table(name = "routines")
public class Routine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String goal;
    
    private Integer availableHours;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime wakeUpTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime sleepTime;

    private String difficulty;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate routineDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    // One Routine has Many RoutineTasks
    // @JsonManagedReference avoids infinite JSON recursion
    @OneToMany(mappedBy = "routine", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<RoutineTask> tasks = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    // Default Constructor
    public Routine() {
        this.createdAt = LocalDateTime.now();
    }

    // Parameterized Constructor
    public Routine(String goal, Integer availableHours, LocalTime wakeUpTime, LocalTime sleepTime, String difficulty) {
        this.goal = goal;
        this.availableHours = availableHours;
        this.wakeUpTime = wakeUpTime;
        this.sleepTime = sleepTime;
        this.difficulty = difficulty;
        this.createdAt = LocalDateTime.now();
    }

    // Helper method to add task to routine
    public void addTask(RoutineTask task) {
        tasks.add(task);
        task.setRoutine(this);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getGoal() {
        return goal;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public Integer getAvailableHours() {
        return availableHours;
    }

    public void setAvailableHours(Integer availableHours) {
        this.availableHours = availableHours;
    }

    public LocalTime getWakeUpTime() {
        return wakeUpTime;
    }

    public void setWakeUpTime(LocalTime wakeUpTime) {
        this.wakeUpTime = wakeUpTime;
    }

    public LocalTime getSleepTime() {
        return sleepTime;
    }

    public void setSleepTime(LocalTime sleepTime) {
        this.sleepTime = sleepTime;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public LocalDate getRoutineDate() { return routineDate; }

    public void setRoutineDate(LocalDate routineDate) { this.routineDate = routineDate; }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<RoutineTask> getTasks() {
        return tasks;
    }

    public void setTasks(List<RoutineTask> tasks) {
        this.tasks = tasks;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
