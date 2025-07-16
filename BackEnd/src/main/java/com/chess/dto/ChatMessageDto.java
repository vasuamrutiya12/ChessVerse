package com.chess.dto;

import java.time.LocalDateTime;

public class ChatMessageDto {
    private String from;
    private String to;
    private String message;
    private String gameId;
    private LocalDateTime timestamp;

    public ChatMessageDto() {
        this.timestamp = LocalDateTime.now();
    }

    public ChatMessageDto(String from, String to, String message, String gameId) {
        this.from = from;
        this.to = to;
        this.message = message;
        this.gameId = gameId;
        this.timestamp = LocalDateTime.now();
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

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getGameId() {
        return gameId;
    }

    public void setGameId(String gameId) {
        this.gameId = gameId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}