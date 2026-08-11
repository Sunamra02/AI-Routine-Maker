package com.example.airoutinemaker.dto;

/**
 * TaskStatusUpdateRequest DTO
 * Simple payload for updating completed status of a RoutineTask.
 */
public class TaskStatusUpdateRequest {

    private Boolean completed;

    public TaskStatusUpdateRequest() {}

    public TaskStatusUpdateRequest(Boolean completed) {
        this.completed = completed;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
}
