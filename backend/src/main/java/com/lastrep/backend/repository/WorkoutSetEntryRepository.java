package com.lastrep.backend.repository;

import com.lastrep.backend.model.WorkoutSetEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutSetEntryRepository extends JpaRepository<WorkoutSetEntry, Long> {
}