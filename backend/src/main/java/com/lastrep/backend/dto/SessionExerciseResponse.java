package com.lastrep.backend.dto;

import com.lastrep.backend.model.WorkoutSessionExercise;
import java.util.List;
import java.util.stream.Collectors;

public class SessionExerciseResponse {
    private Long id;
    private Long exerciseId;
    private String exerciseName;
    private String muscleGroup;
    private String equipment;
    private Integer orderIndex;
    private List<SetGroupResponse> setGroups;

    public SessionExerciseResponse(WorkoutSessionExercise se) {
        this.id = se.getId();
        this.exerciseId = se.getExercise().getId();
        this.exerciseName = se.getExercise().getName();
        this.muscleGroup = se.getExercise().getMuscleGroup();
        this.equipment = se.getExercise().getEquipment();
        this.orderIndex = se.getOrderIndex();
        this.setGroups = se.getSetGroups()
                .stream()
                .map(SetGroupResponse::new)
                .collect(Collectors.toList());
    }

    public Long getId() { return id; }
    public Long getExerciseId() { return exerciseId; }
    public String getExerciseName() { return exerciseName; }
    public String getMuscleGroup() { return muscleGroup; }
    public String getEquipment() { return equipment; }
    public Integer getOrderIndex() { return orderIndex; }
    public List<SetGroupResponse> getSetGroups() { return setGroups; }
}