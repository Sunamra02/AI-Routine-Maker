package com.example.airoutinemaker.dto;

import java.util.List;

public class AiRoutineSuggestResponse {
    private List<AiRoutineOptionDTO> options;

    public AiRoutineSuggestResponse() {}

    public AiRoutineSuggestResponse(List<AiRoutineOptionDTO> options) {
        this.options = options;
    }

    public List<AiRoutineOptionDTO> getOptions() {
        return options;
    }

    public void setOptions(List<AiRoutineOptionDTO> options) {
        this.options = options;
    }
}
