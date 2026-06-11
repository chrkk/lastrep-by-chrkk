package com.lastrep.backend.repository;

import com.lastrep.backend.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RoutineRepository extends JpaRepository<Routine, Long> {
    List<Routine> findByUserIdOrderByRoutineOrderAsc(Long userId);
    Optional<Routine> findByIdAndUserId(Long id, Long userId);
}