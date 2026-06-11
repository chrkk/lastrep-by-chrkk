package com.lastrep.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "routine_exercises")
public class RoutineExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_id", nullable = false)
    private Routine routine;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(nullable = false)
    private Integer orderIndex = 0;

    private Integer targetSets;
    private Integer targetMinReps;
    private Integer targetMaxReps;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Routine getRoutine() { return routine; }
    public void setRoutine(Routine routine) { this.routine = routine; }

    public Exercise getExercise() { return exercise; }
    public void setExercise(Exercise exercise) { this.exercise = exercise; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }

    public Integer getTargetSets() { return targetSets; }
    public void setTargetSets(Integer targetSets) { this.targetSets = targetSets; }

    public Integer getTargetMinReps() { return targetMinReps; }
    public void setTargetMinReps(Integer targetMinReps) { this.targetMinReps = targetMinReps; }

    public Integer getTargetMaxReps() { return targetMaxReps; }
    public void setTargetMaxReps(Integer targetMaxReps) { this.targetMaxReps = targetMaxReps; }
}