package com.lastrep.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class ExerciseRequest {

    @NotBlank(message = "Exercise name is required")
    private String name;

    private String muscleGroup;
    private String equipment;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMuscleGroup() { return muscleGroup; }
    public void setMuscleGroup(String muscleGroup) { this.muscleGroup = muscleGroup; }

    public String getEquipment() { return equipment; }
    public void setEquipment(String equipment) { this.equipment = equipment; }
}