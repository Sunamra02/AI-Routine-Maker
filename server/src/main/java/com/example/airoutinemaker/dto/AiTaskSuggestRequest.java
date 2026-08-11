package com.example.airoutinemaker.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;
import java.time.LocalDate;

public class AiTaskSuggestRequest {
    private String goal;
    private Integer availableHours;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime wakeUpTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime sleepTime;

    private String difficulty;
    private String selectedRoutineTitle;
    private String selectedRoutineDescription;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate routineDate;

    public AiTaskSuggestRequest() {}

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

    public String getSelectedRoutineTitle() {
        return selectedRoutineTitle;
    }

    public void setSelectedRoutineTitle(String selectedRoutineTitle) {
        this.selectedRoutineTitle = selectedRoutineTitle;
    }

    public String getSelectedRoutineDescription() {
        return selectedRoutineDescription;
    }

    public void setSelectedRoutineDescription(String selectedRoutineDescription) {
        this.selectedRoutineDescription = selectedRoutineDescription;
    }
    public LocalDate getRoutineDate() { return routineDate; }
    public void setRoutineDate(LocalDate routineDate) { this.routineDate = routineDate; }
}
