package com.chess.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.Date;

@Document(collection = "games")
public class Game {
    @Id
    private String id;
    private String player1Email;
    private String player2Email;
    private Date startTime;
    private Date endTime;
    private String winnerEmail;
    private String status; // e.g., "IN_PROGRESS", "WHITE_WON", "BLACK_WON", "DRAW"
    private List<Move> moves;

    public Game() {
        this.moves = new ArrayList<>();
        this.startTime = new Date();
        this.status = "IN_PROGRESS";
    }

    public Game(String player1Email, String player2Email) {
        this();
        this.player1Email = player1Email;
        this.player2Email = player2Email;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPlayer1Email() {
        return player1Email;
    }

    public void setPlayer1Email(String player1Email) {
        this.player1Email = player1Email;
    }

    public String getPlayer2Email() {
        return player2Email;
    }

    public void setPlayer2Email(String player2Email) {
        this.player2Email = player2Email;
    }

    public Date getStartTime() {
        return startTime;
    }

    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }

    public Date getEndTime() {
        return endTime;
    }

    public void setEndTime(Date endTime) {
        this.endTime = endTime;
    }

    public String getWinnerEmail() {
        return winnerEmail;
    }

    public void setWinnerEmail(String winnerEmail) {
        this.winnerEmail = winnerEmail;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<Move> getMoves() {
        return moves;
    }

    public void setMoves(List<Move> moves) {
        this.moves = moves;
    }

    public void addMove(Move move) {
        this.moves.add(move);
    }
} 