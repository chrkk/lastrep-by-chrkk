package com.lastrep.backend.dto;

public class SetEntryRequest {
    private Double weight;
    private Integer reps;
    private Boolean reachedFailure;
    private Integer restSeconds;

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Integer getReps() { return reps; }
    public void setReps(Integer reps) { this.reps = reps; }

    public Boolean getReachedFailure() { return reachedFailure; }
    public void setReachedFailure(Boolean reachedFailure) { this.reachedFailure = reachedFailure; }

    public Integer getRestSeconds() { return restSeconds; }
    public void setRestSeconds(Integer restSeconds) { this.restSeconds = restSeconds; }
}