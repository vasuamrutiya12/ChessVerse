package com.chess.dto;

public class FriendRequestDto {
    private String from;
    private String to;

    // Constructors
    public FriendRequestDto() {}

    public FriendRequestDto(String from, String to) {
        this.from = from;
        this.to = to;
    }

    // Getters and Setters
    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }
}