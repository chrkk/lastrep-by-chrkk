package com.lastrep.backend.dto;

public class AuthResponse {
    private String token;
    private String name;
    private String username;

    public AuthResponse(String token, String name, String username) {
        this.token = token;
        this.name = name;
        this.username = username;
    }

    public String getToken() { return token; }
    public String getName() { return name; }
    public String getUsername() { return username; }
}