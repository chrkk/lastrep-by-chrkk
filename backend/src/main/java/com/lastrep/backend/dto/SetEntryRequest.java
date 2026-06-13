package com.lastrep.backend.dto;

import com.lastrep.backend.model.WeightUnit;

public class SetEntryRequest {
    private Double weight;
    private WeightUnit weightUnit = WeightUnit.KG;
    private Integer reps;
    private Boolean reachedFailure;
    private Integer restSeconds;

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public WeightUnit getWeightUnit() { return weightUnit; }
    public void setWeightUnit(WeightUnit weightUnit) { this.weightUnit = weightUnit; }

    public Integer getReps() { return reps; }
    public void setReps(Integer reps) { this.reps = reps; }

    public Boolean getReachedFailure() { return reachedFailure; }
    public void setReachedFailure(Boolean reachedFailure) { this.reachedFailure = reachedFailure; }

    public Integer getRestSeconds() { return restSeconds; }
    public void setRestSeconds(Integer restSeconds) { this.restSeconds = restSeconds; }
}