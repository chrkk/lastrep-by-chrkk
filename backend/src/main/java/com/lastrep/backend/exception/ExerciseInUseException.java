package com.lastrep.backend.exception;

public class ExerciseInUseException extends RuntimeException {
    public ExerciseInUseException(String message) {
        super(message);
    }
}