package com.lastrep.backend.dto;

import com.lastrep.backend.model.RoutineExercise;

public class RoutineExerciseResponse {

    private Long id;
    private Long exerciseId;
    private String exerciseName;
    private String muscleGroup;
    private String equipment;
    private Integer orderIndex;
    private Integer targetSets;
    private Integer targetMinReps;
    private Integer targetMaxReps;

    public RoutineExerciseResponse(RoutineExercise re) {
        this.id = re.getId();
        this.exerciseId = re.getExercise().getId();
        this.exerciseName = re.getExercise().getName();
        this.muscleGroup = re.getExercise().getMuscleGroup();
        this.equipment = re.getExercise().getEquipment();
        this.orderIndex = re.getOrderIndex();
        this.targetSets = re.getTargetSets();
        this.targetMinReps = re.getTargetMinReps();
        this.targetMaxReps = re.getTargetMaxReps();
    }

    public Long getId() { return id; }
    public Long getExerciseId() { return exerciseId; }
    public String getExerciseName() { return exerciseName; }
    public String getMuscleGroup() { return muscleGroup; }
    public String getEquipment() { return equipment; }
    public Integer getOrderIndex() { return orderIndex; }
    public Integer getTargetSets() { return targetSets; }
    public Integer getTargetMinReps() { return targetMinReps; }
    public Integer getTargetMaxReps() { return targetMaxReps; }
}