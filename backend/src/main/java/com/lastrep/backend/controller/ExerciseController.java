package com.lastrep.backend.controller;

import com.lastrep.backend.dto.ExerciseRequest;
import com.lastrep.backend.dto.ExerciseResponse;
import com.lastrep.backend.service.ExerciseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping
    public ResponseEntity<List<ExerciseResponse>> getAll() {
        return ResponseEntity.ok(exerciseService.getAllExercises());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(exerciseService.getExercise(id));
    }

    @PostMapping
    public ResponseEntity<ExerciseResponse> create(
            @Valid @RequestBody ExerciseRequest request) {
        return ResponseEntity.ok(exerciseService.createExercise(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExerciseResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ExerciseRequest request) {
        return ResponseEntity.ok(exerciseService.updateExercise(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        exerciseService.deleteExercise(id);
        return ResponseEntity.noContent().build();
    }
}