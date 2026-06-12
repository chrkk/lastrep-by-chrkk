package com.lastrep.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "workout_set_entries")
public class WorkoutSetEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_group_id", nullable = false)
    private WorkoutSetGroup setGroup;

    @Column(nullable = false)
    private Integer entryNumber;

    private Double weight;
    private Integer reps;
    private Boolean reachedFailure = false;
    private Integer restSeconds;
    private String notes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public WorkoutSetGroup getSetGroup() { return setGroup; }
    public void setSetGroup(WorkoutSetGroup setGroup) { this.setGroup = setGroup; }

    public Integer getEntryNumber() { return entryNumber; }
    public void setEntryNumber(Integer entryNumber) { this.entryNumber = entryNumber; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Integer getReps() { return reps; }
    public void setReps(Integer reps) { this.reps = reps; }

    public Boolean getReachedFailure() { return reachedFailure; }
    public void setReachedFailure(Boolean reachedFailure) { this.reachedFailure = reachedFailure; }

    public Integer getRestSeconds() { return restSeconds; }
    public void setRestSeconds(Integer restSeconds) { this.restSeconds = restSeconds; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}