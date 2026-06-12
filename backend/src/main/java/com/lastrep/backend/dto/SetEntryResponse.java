package com.lastrep.backend.dto;

import com.lastrep.backend.model.WorkoutSetEntry;

public class SetEntryResponse {
    private Long id;
    private Integer entryNumber;
    private Double weight;
    private Integer reps;
    private Boolean reachedFailure;
    private Integer restSeconds;

    public SetEntryResponse(WorkoutSetEntry entry) {
        this.id = entry.getId();
        this.entryNumber = entry.getEntryNumber();
        this.weight = entry.getWeight();
        this.reps = entry.getReps();
        this.reachedFailure = entry.getReachedFailure();
        this.restSeconds = entry.getRestSeconds();
    }

    public Long getId() { return id; }
    public Integer getEntryNumber() { return entryNumber; }
    public Double getWeight() { return weight; }
    public Integer getReps() { return reps; }
    public Boolean getReachedFailure() { return reachedFailure; }
    public Integer getRestSeconds() { return restSeconds; }
}