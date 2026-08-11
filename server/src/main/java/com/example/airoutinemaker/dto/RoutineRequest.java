package com.example.airoutinemaker.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;

/**
 * RoutineRequest DTO
 * Data Transfer Object for receiving routine creation payload from React frontend.
 */
public class RoutineRequest {

    private String goal;
    private Integer availableHours;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime wakeUpTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime sleepTime;

    private String difficulty;

    public RoutineRequest() {}

    public RoutineRequest(String goal, Integer availableHours, LocalTime wakeUpTime, LocalTime sleepTime, String difficulty) {
        this.goal = goal;
        this.availableHours = availableHours;
        this.wakeUpTime = wakeUpTime;
        this.sleepTime = sleepTime;
        this.difficulty = difficulty;
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

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
}
