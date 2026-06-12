package com.lastrep.backend.dto;

import com.lastrep.backend.model.SessionStatus;
import com.lastrep.backend.model.WorkoutSession;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class WorkoutSessionResponse {
    private Long id;
    private Long routineId;
    private String routineName;
    private SessionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime finishedAt;
    private List<SessionExerciseResponse> exercises;

    public WorkoutSessionResponse(WorkoutSession session) {
        this.id = session.getId();
        this.routineId = session.getRoutine() != null ? session.getRoutine().getId() : null;
        this.routineName = session.getRoutine() != null ? session.getRoutine().getName() : null;
        this.status = session.getStatus();
        this.createdAt = session.getCreatedAt();
        this.finishedAt = session.getFinishedAt();
        this.exercises = session.getSessionExercises()
                .stream()
                .map(SessionExerciseResponse::new)
                .collect(Collectors.toList());
    }

    public Long getId() { return id; }
    public Long getRoutineId() { return routineId; }
    public String getRoutineName() { return routineName; }
    public SessionStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getFinishedAt() { return finishedAt; }
    public List<SessionExerciseResponse> getExercises() { return exercises; }
}