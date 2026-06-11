package com.lastrep.backend.dto;

import com.lastrep.backend.model.Routine;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class RoutineResponse {

    private Long id;
    private String name;
    private String description;
    private Integer routineOrder;
    private List<RoutineExerciseResponse> exercises;
    private LocalDateTime createdAt;

    public RoutineResponse(Routine routine) {
        this.id = routine.getId();
        this.name = routine.getName();
        this.description = routine.getDescription();
        this.routineOrder = routine.getRoutineOrder();
        this.createdAt = routine.getCreatedAt();
        this.exercises = routine.getRoutineExercises()
                .stream()
                .map(RoutineExerciseResponse::new)
                .collect(Collectors.toList());
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Integer getRoutineOrder() { return routineOrder; }
    public List<RoutineExerciseResponse> getExercises() { return exercises; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}