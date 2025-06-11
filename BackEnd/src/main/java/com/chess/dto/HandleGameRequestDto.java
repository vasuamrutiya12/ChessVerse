package com.chess.dto;

public class HandleGameRequestDto {
    private String to;
    private String from;
    private String gameId;
    private String action;

    // Constructors
    public HandleGameRequestDto() {}

    public HandleGameRequestDto(String to, String from, String gameId, String action) {
        this.to = to;
        this.from = from;
        this.gameId = gameId;
        this.action = action;
    }

    // Getters and Setters
    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getGameId() {
        return gameId;
    }

    public void setGameId(String gameId) {
        this.gameId = gameId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }
}