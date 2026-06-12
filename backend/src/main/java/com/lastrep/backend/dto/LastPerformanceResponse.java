package com.lastrep.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class LastPerformanceResponse {
    private Long exerciseId;
    private String exerciseName;
    private LocalDateTime sessionDate;
    private List<SetGroupResponse> setGroups;

    public LastPerformanceResponse(Long exerciseId, String exerciseName,
                                   LocalDateTime sessionDate, List<SetGroupResponse> setGroups) {
        this.exerciseId = exerciseId;
        this.exerciseName = exerciseName;
        this.sessionDate = sessionDate;
        this.setGroups = setGroups;
    }

    public Long getExerciseId() { return exerciseId; }
    public String getExerciseName() { return exerciseName; }
    public LocalDateTime getSessionDate() { return sessionDate; }
    public List<SetGroupResponse> getSetGroups() { return setGroups; }
}