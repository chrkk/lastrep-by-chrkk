package com.lastrep.backend.repository;

import com.lastrep.backend.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Exercise> findByIdAndUserId(Long id, Long userId);
}