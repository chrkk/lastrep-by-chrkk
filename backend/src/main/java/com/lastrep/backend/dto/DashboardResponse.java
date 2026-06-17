package com.lastrep.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class DashboardResponse {

    private String suggestedRoutineName;
    private Long suggestedRoutineId;
    private String lastWorkoutRoutineName;
    private LocalDateTime lastWorkoutDate;
    private Long lastWorkoutDuration;
    private Integer weeklySessionCount;
    private List<RecentSessionResponse> recentSessions;
    private boolean hasExercises;
    private boolean hasRoutines;

    public String getSuggestedRoutineName() { return suggestedRoutineName; }
    public void setSuggestedRoutineName(String suggestedRoutineName) { this.suggestedRoutineName = suggestedRoutineName; }

    public Long getSuggestedRoutineId() { return suggestedRoutineId; }
    public void setSuggestedRoutineId(Long suggestedRoutineId) { this.suggestedRoutineId = suggestedRoutineId; }

    public String getLastWorkoutRoutineName() { return lastWorkoutRoutineName; }
    public void setLastWorkoutRoutineName(String lastWorkoutRoutineName) { this.lastWorkoutRoutineName = lastWorkoutRoutineName; }

    public LocalDateTime getLastWorkoutDate() { return lastWorkoutDate; }
    public void setLastWorkoutDate(LocalDateTime lastWorkoutDate) { this.lastWorkoutDate = lastWorkoutDate; }

    public Long getLastWorkoutDuration() { return lastWorkoutDuration; }
    public void setLastWorkoutDuration(Long lastWorkoutDuration) { this.lastWorkoutDuration = lastWorkoutDuration; }

    public Integer getWeeklySessionCount() { return weeklySessionCount; }
    public void setWeeklySessionCount(Integer weeklySessionCount) { this.weeklySessionCount = weeklySessionCount; }

    public List<RecentSessionResponse> getRecentSessions() { return recentSessions; }
    public void setRecentSessions(List<RecentSessionResponse> recentSessions) { this.recentSessions = recentSessions; }

    public boolean isHasExercises() { return hasExercises; }
    public void setHasExercises(boolean hasExercises) { this.hasExercises = hasExercises; }

    public boolean isHasRoutines() { return hasRoutines; }
    public void setHasRoutines(boolean hasRoutines) { this.hasRoutines = hasRoutines; }
}