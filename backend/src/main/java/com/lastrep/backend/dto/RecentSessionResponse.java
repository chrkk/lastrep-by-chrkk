package com.lastrep.backend.dto;

import com.lastrep.backend.model.WorkoutSession;
import java.time.Duration;
import java.time.LocalDateTime;

public class RecentSessionResponse {

    private Long id;
    private String routineName;
    private LocalDateTime date;
    private Long durationSeconds;
    private Integer totalSets;

    public RecentSessionResponse(WorkoutSession session) {
        this.id = session.getId();
        this.routineName = session.getRoutine() != null
                ? session.getRoutine().getName() : "Custom";
        this.date = session.getCreatedAt();
        if (session.getFinishedAt() != null) {
            this.durationSeconds = Duration.between(
                    session.getCreatedAt(), session.getFinishedAt()).getSeconds();
        }
        this.totalSets = session.getSessionExercises().stream()
                .mapToInt(se -> se.getSetGroups().size())
                .sum();
    }

    public Long getId() { return id; }
    public String getRoutineName() { return routineName; }
    public LocalDateTime getDate() { return date; }
    public Long getDurationSeconds() { return durationSeconds; }
    public Integer getTotalSets() { return totalSets; }
}