package com.lastrep.backend.controller;

import com.lastrep.backend.dto.LastPerformanceResponse;
import com.lastrep.backend.service.WorkoutSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exercise-performance")
public class ExercisePerformanceController {

    private final WorkoutSessionService workoutSessionService;

    public ExercisePerformanceController(WorkoutSessionService workoutSessionService) {
        this.workoutSessionService = workoutSessionService;
    }

    @GetMapping("/{exerciseId}/last")
    public ResponseEntity<LastPerformanceResponse> lastPerformance(
            @PathVariable Long exerciseId) {
        LastPerformanceResponse res = workoutSessionService.getLastPerformance(exerciseId);
        if (res == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(res);
    }
}