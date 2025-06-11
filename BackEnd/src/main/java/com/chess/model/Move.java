package com.chess.model;

import org.springframework.data.mongodb.core.mapping.Document;

public class Move {
    private String fromSquare;
    private String toSquare;
    private String piece;
    private int moveNumber;

    public Move() {
    }

    public Move(String fromSquare, String toSquare, String piece, int moveNumber) {
        this.fromSquare = fromSquare;
        this.toSquare = toSquare;
        this.piece = piece;
        this.moveNumber = moveNumber;
    }

    public String getFromSquare() {
        return fromSquare;
    }

    public void setFromSquare(String fromSquare) {
        this.fromSquare = fromSquare;
    }

    public String getToSquare() {
        return toSquare;
    }

    public void setToSquare(String toSquare) {
        this.toSquare = toSquare;
    }

    public String getPiece() {
        return piece;
    }

    public void setPiece(String piece) {
        this.piece = piece;
    }

    public int getMoveNumber() {
        return moveNumber;
    }

    public void setMoveNumber(int moveNumber) {
        this.moveNumber = moveNumber;
    }
} 