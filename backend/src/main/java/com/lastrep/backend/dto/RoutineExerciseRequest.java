package com.lastrep.backend.dto;

public class RoutineExerciseRequest {

    private Long exerciseId;
    private Integer targetSets;
    private Integer targetMinReps;
    private Integer targetMaxReps;
    private Integer restSeconds = 90;

    public Integer getRestSeconds() { return restSeconds; }
    public void setRestSeconds(Integer restSeconds) { this.restSeconds = restSeconds; }

    public Long getExerciseId() { return exerciseId; }
    public void setExerciseId(Long exerciseId) { this.exerciseId = exerciseId; }

    public Integer getTargetSets() { return targetSets; }
    public void setTargetSets(Integer targetSets) { this.targetSets = targetSets; }

    public Integer getTargetMinReps() { return targetMinReps; }
    public void setTargetMinReps(Integer targetMinReps) { this.targetMinReps = targetMinReps; }

    public Integer getTargetMaxReps() { return targetMaxReps; }
    public void setTargetMaxReps(Integer targetMaxReps) { this.targetMaxReps = targetMaxReps; }
}