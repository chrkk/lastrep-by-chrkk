package com.lastrep.backend.dto;

import com.lastrep.backend.model.Exercise;
import java.time.LocalDateTime;

public class ExerciseResponse {

    private Long id;
    private String name;
    private String muscleGroup;
    private String equipment;
    private LocalDateTime createdAt;

    public ExerciseResponse(Exercise exercise) {
        this.id = exercise.getId();
        this.name = exercise.getName();
        this.muscleGroup = exercise.getMuscleGroup();
        this.equipment = exercise.getEquipment();
        this.createdAt = exercise.getCreatedAt();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getMuscleGroup() { return muscleGroup; }
    public String getEquipment() { return equipment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}