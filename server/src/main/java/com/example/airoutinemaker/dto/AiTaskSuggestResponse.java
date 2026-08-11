package com.example.airoutinemaker.dto;

import java.util.List;

public class AiTaskSuggestResponse {
    private List<AiTaskDTO> tasks;

    public AiTaskSuggestResponse() {}

    public AiTaskSuggestResponse(List<AiTaskDTO> tasks) {
        this.tasks = tasks;
    }

    public List<AiTaskDTO> getTasks() {
        return tasks;
    }

    public void setTasks(List<AiTaskDTO> tasks) {
        this.tasks = tasks;
    }
}
