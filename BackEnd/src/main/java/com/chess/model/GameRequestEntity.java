package com.chess.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "gamerequests")
public class GameRequestEntity {
    @Id
    private String id;
    
    private String from;
    private String to;
    private String status = "pending";
    private String gameId;
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public GameRequestEntity() {}

    public GameRequestEntity(String from, String to, String gameId) {
        this.from = from;
        this.to = to;
        this.gameId = gameId;
        this.status = "pending";
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getGameId() {
        return gameId;
    }

    public void setGameId(String gameId) {
        this.gameId = gameId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}