package com.chess.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    private String name;
    
    @Indexed(unique = true)
    private String email;
    
    private List<String> friendRequests = new ArrayList<>();
    private List<String> friendList = new ArrayList<>();
    private List<GameRequest> gameRequests = new ArrayList<>();
    private int elo = 1200;
    private int wins = 0;
    private int losses = 0;
    private int draws = 0;
    private List<String> gameHistory = new ArrayList<>();
    private int currentStreak = 0; // positive for win streak, negative for loss streak
    private double averageMoveTime = 0.0;

    // Constructors
    public User() {}

    public User(String name, String email) {
        this.name = name;
        this.email = email;
        this.friendRequests = new ArrayList<>();
        this.friendList = new ArrayList<>();
        this.gameRequests = new ArrayList<>();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getFriendRequests() {
        return friendRequests;
    }

    public void setFriendRequests(List<String> friendRequests) {
        this.friendRequests = friendRequests;
    }

    public List<String> getFriendList() {
        return friendList;
    }

    public void setFriendList(List<String> friendList) {
        this.friendList = friendList;
    }

    public List<GameRequest> getGameRequests() {
        return gameRequests;
    }

    public void setGameRequests(List<GameRequest> gameRequests) {
        this.gameRequests = gameRequests;
    }

    public int getElo() {
        return elo;
    }

    public void setElo(int elo) {
        this.elo = elo;
    }

    public int getWins() {
        return wins;
    }

    public void setWins(int wins) {
        this.wins = wins;
    }

    public int getLosses() {
        return losses;
    }

    public void setLosses(int losses) {
        this.losses = losses;
    }

    public int getDraws() {
        return draws;
    }

    public void setDraws(int draws) {
        this.draws = draws;
    }

    public List<String> getGameHistory() {
        return gameHistory;
    }

    public void setGameHistory(List<String> gameHistory) {
        this.gameHistory = gameHistory;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public double getAverageMoveTime() {
        return averageMoveTime;
    }

    public void setAverageMoveTime(double averageMoveTime) {
        this.averageMoveTime = averageMoveTime;
    }

    // Inner class for GameRequest
    public static class GameRequest {
        private String from;
        private String gameId;

        public GameRequest() {}

        public GameRequest(String from, String gameId) {
            this.from = from;
            this.gameId = gameId;
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
    }
}