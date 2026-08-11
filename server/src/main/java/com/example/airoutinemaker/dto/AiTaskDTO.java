package com.example.airoutinemaker.dto;

public class AiTaskDTO {
    private String time;
    private String activity;
    private Integer duration;

    public AiTaskDTO() {}

    public AiTaskDTO(String time, String activity, Integer duration) {
        this.time = time;
        this.activity = activity;
        this.duration = duration;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getActivity() {
        return activity;
    }

    public void setActivity(String activity) {
        this.activity = activity;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }
}
