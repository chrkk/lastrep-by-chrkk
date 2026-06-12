package com.lastrep.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class RoutineRequest {

    @NotBlank(message = "Routine name is required")
    private String name;

    private String description;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}