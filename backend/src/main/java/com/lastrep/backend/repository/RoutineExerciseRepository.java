package com.lastrep.backend.repository;

import com.lastrep.backend.model.RoutineExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoutineExerciseRepository extends JpaRepository<RoutineExercise, Long> {
    Optional<RoutineExercise> findByIdAndRoutineId(Long id, Long routineId);
}