package com.lastrep.backend.controller;

import com.lastrep.backend.dto.*;
import com.lastrep.backend.service.WorkoutSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-sessions")
public class WorkoutSessionController {

    private final WorkoutSessionService workoutSessionService;

    public WorkoutSessionController(WorkoutSessionService workoutSessionService) {
        this.workoutSessionService = workoutSessionService;
    }

    @PostMapping("/start")
    public ResponseEntity<WorkoutSessionResponse> start(
            @RequestBody StartSessionRequest request) {
        return ResponseEntity.ok(workoutSessionService.startSession(request));
    }

    @GetMapping
    public ResponseEntity<List<WorkoutSessionResponse>> getAll() {
        return ResponseEntity.ok(workoutSessionService.getAllSessions());
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<WorkoutSessionResponse> getOne(
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(workoutSessionService.getSession(sessionId));
    }

    @PostMapping("/{sessionId}/exercises/{sessionExerciseId}/sets")
    public ResponseEntity<WorkoutSessionResponse> logSet(
            @PathVariable Long sessionId,
            @PathVariable Long sessionExerciseId,
            @RequestBody LogSetRequest request) {
        return ResponseEntity.ok(
                workoutSessionService.logSet(sessionId, sessionExerciseId, request));
    }

    @DeleteMapping("/{sessionId}/exercises/{sessionExerciseId}/sets/{setGroupId}")
    public ResponseEntity<WorkoutSessionResponse> deleteSet(
            @PathVariable Long sessionId,
            @PathVariable Long sessionExerciseId,
            @PathVariable Long setGroupId) {
        return ResponseEntity.ok(
                workoutSessionService.deleteSet(sessionId, sessionExerciseId, setGroupId));
    }

    @PostMapping("/{sessionId}/exercises")
    public ResponseEntity<WorkoutSessionResponse> addExercise(
            @PathVariable Long sessionId,
            @RequestBody AddExerciseToSessionRequest request) {
        return ResponseEntity.ok(
                workoutSessionService.addExerciseToSession(sessionId, request.getExerciseId()));
    }

    @PostMapping("/{sessionId}/finish")
    public ResponseEntity<WorkoutSessionResponse> finish(
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(workoutSessionService.finishSession(sessionId));
    }

    @PostMapping("/{sessionId}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long sessionId) {
        workoutSessionService.cancelSession(sessionId);
        return ResponseEntity.noContent().build();
    }
}