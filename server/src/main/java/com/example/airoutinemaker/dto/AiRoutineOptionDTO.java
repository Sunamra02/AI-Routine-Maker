package com.example.airoutinemaker.dto;

public class AiRoutineOptionDTO {
    private String id;
    private String title;
    private String description;
    private String focusStyle;

    public AiRoutineOptionDTO() {}

    public AiRoutineOptionDTO(String id, String title, String description, String focusStyle) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.focusStyle = focusStyle;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFocusStyle() {
        return focusStyle;
    }

    public void setFocusStyle(String focusStyle) {
        this.focusStyle = focusStyle;
    }
}
