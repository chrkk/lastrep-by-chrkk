package com.lastrep.backend.repository;

import com.lastrep.backend.model.WorkoutSessionExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WorkoutSessionExerciseRepository extends JpaRepository<WorkoutSessionExercise, Long> {
    Optional<WorkoutSessionExercise> findByIdAndWorkoutSessionId(Long id, Long sessionId);
}