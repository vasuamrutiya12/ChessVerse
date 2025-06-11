package com.chess.game;

public class Move {
    private String from;
    private String to;
    private String promotion;

    public Move() {}

    public Move(String from, String to) {
        this.from = from;
        this.to = to;
    }

    public Move(String from, String to, String promotion) {
        this.from = from;
        this.to = to;
        this.promotion = promotion;
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

    public String getPromotion() {
        return promotion;
    }

    public void setPromotion(String promotion) {
        this.promotion = promotion;
    }
}