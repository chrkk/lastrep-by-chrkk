package com.lastrep.backend.controller;

import com.lastrep.backend.dto.*;
import com.lastrep.backend.service.RoutineService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routines")
public class RoutineController {

    private final RoutineService routineService;

    public RoutineController(RoutineService routineService) {
        this.routineService = routineService;
    }

    @GetMapping
    public ResponseEntity<List<RoutineResponse>> getAll() {
        return ResponseEntity.ok(routineService.getAllRoutines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoutineResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(routineService.getRoutine(id));
    }

    @PostMapping
    public ResponseEntity<RoutineResponse> create(
            @Valid @RequestBody RoutineRequest request) {
        return ResponseEntity.ok(routineService.createRoutine(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoutineResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody RoutineRequest request) {
        return ResponseEntity.ok(routineService.updateRoutine(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        routineService.deleteRoutine(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{routineId}/exercises")
    public ResponseEntity<RoutineResponse> addExercise(
            @PathVariable Long routineId,
            @RequestBody RoutineExerciseRequest request) {
        return ResponseEntity.ok(routineService.addExercise(routineId, request));
    }

    @DeleteMapping("/{routineId}/exercises/{routineExerciseId}")
    public ResponseEntity<Void> removeExercise(
            @PathVariable Long routineId,
            @PathVariable Long routineExerciseId) {
        routineService.removeExercise(routineId, routineExerciseId);
        return ResponseEntity.noContent().build();
    }
}