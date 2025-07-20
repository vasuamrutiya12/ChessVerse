package com.chess.game;

import java.util.*;

public class ChessEngine {
    private String[][] board;
    private String currentPlayer;
    private boolean gameOver;
    private String winner;
    private List<String> moveHistory;

    public ChessEngine() {
        initializeBoard();
        this.currentPlayer = "w";
        this.gameOver = false;
        this.winner = null;
        this.moveHistory = new ArrayList<>();
    }

    private void initializeBoard() {
        board = new String[8][8];
        
        // Initialize empty squares
        for (int i = 0; i < 8; i++) {
            for (int j = 0; j < 8; j++) {
                board[i][j] = null;
            }
        }

        // Set up initial pieces
        // Black pieces
        board[0][0] = "br"; board[0][1] = "bn"; board[0][2] = "bb"; board[0][3] = "bq";
        board[0][4] = "bk"; board[0][5] = "bb"; board[0][6] = "bn"; board[0][7] = "br";
        for (int i = 0; i < 8; i++) {
            board[1][i] = "bp";
        }

        // White pieces
        for (int i = 0; i < 8; i++) {
            board[6][i] = "wp";
        }
        board[7][0] = "wr"; board[7][1] = "wn"; board[7][2] = "wb"; board[7][3] = "wq";
        board[7][4] = "wk"; board[7][5] = "wb"; board[7][6] = "wn"; board[7][7] = "wr";
    }

    public boolean makeMove(Move move) {
        if (gameOver) return false;

        int[] fromPos = algebraicToPosition(move.getFrom());
        int[] toPos = algebraicToPosition(move.getTo());

        if (fromPos == null || toPos == null) return false;

        String piece = board[fromPos[0]][fromPos[1]];
        if (piece == null || !piece.startsWith(currentPlayer)) return false;

        if (!isValidMove(fromPos, toPos, piece)) return false;

        // Make the move
        board[toPos[0]][toPos[1]] = piece;
        board[fromPos[0]][fromPos[1]] = null;

        // Handle pawn promotion
        if (move.getPromotion() != null && piece.endsWith("p")) {
            board[toPos[0]][toPos[1]] = currentPlayer + move.getPromotion();
        }

        moveHistory.add(move.getFrom() + move.getTo());
        
        // Switch players
        currentPlayer = currentPlayer.equals("w") ? "b" : "w";

        // Check for game over conditions
        checkGameOver();

        return true;
    }

    private boolean isValidMove(int[] from, int[] to, String piece) {
        // Basic validation - piece exists and belongs to current player
        if (piece == null || !piece.startsWith(currentPlayer)) {
            return false;
        }

        // Check if destination has own piece
        String destPiece = board[to[0]][to[1]];
        if (destPiece != null && destPiece.startsWith(currentPlayer)) {
            return false;
        }

        // Basic piece movement validation (simplified)
        char pieceType = piece.charAt(1);
        int rowDiff = to[0] - from[0];
        int colDiff = to[1] - from[1];

        switch (pieceType) {
            case 'p': // Pawn
                return isValidPawnMove(from, to, rowDiff, colDiff, destPiece != null);
            case 'r': // Rook
                return (rowDiff == 0 || colDiff == 0) && isPathClear(from, to);
            case 'n': // Knight
                return (Math.abs(rowDiff) == 2 && Math.abs(colDiff) == 1) || 
                       (Math.abs(rowDiff) == 1 && Math.abs(colDiff) == 2);
            case 'b': // Bishop
                return Math.abs(rowDiff) == Math.abs(colDiff) && isPathClear(from, to);
            case 'q': // Queen
                return ((rowDiff == 0 || colDiff == 0) || (Math.abs(rowDiff) == Math.abs(colDiff))) && isPathClear(from, to);
            case 'k': // King
                return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
            default:
                return false;
        }
    }

    private boolean isValidPawnMove(int[] from, int[] to, int rowDiff, int colDiff, boolean isCapture) {
        boolean isWhite = currentPlayer.equals("w");
        int direction = isWhite ? -1 : 1;
        int startRow = isWhite ? 6 : 1;

        if (colDiff == 0 && !isCapture) {
            // Forward move
            if (rowDiff == direction) return true;
            if (from[0] == startRow && rowDiff == 2 * direction) return true;
        } else if (Math.abs(colDiff) == 1 && rowDiff == direction && isCapture) {
            // Diagonal capture
            return true;
        }
        return false;
    }

    private boolean isPathClear(int[] from, int[] to) {
        int rowStep = Integer.compare(to[0], from[0]);
        int colStep = Integer.compare(to[1], from[1]);
        
        int currentRow = from[0] + rowStep;
        int currentCol = from[1] + colStep;
        
        while (currentRow != to[0] || currentCol != to[1]) {
            if (board[currentRow][currentCol] != null) {
                return false;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }
        return true;
    }

    private void checkGameOver() {
        // Check for checkmate and stalemate
        if (isCheckmate()) {
            gameOver = true;
            winner = currentPlayer.equals("w") ? "Player-2(Black)" : "Player-1(White)";
        } else if (isStalemate()) {
            gameOver = true;
            winner = "Draw";
        }
        
        // Count kings as fallback
        boolean whiteKingExists = false;
        boolean blackKingExists = false;
        
        for (int i = 0; i < 8; i++) {
            for (int j = 0; j < 8; j++) {
                if ("wk".equals(board[i][j])) whiteKingExists = true;
                if ("bk".equals(board[i][j])) blackKingExists = true;
            }
        }
        
        if (!whiteKingExists) {
            gameOver = true;
            winner = "Player-2(Black)";
        } else if (!blackKingExists) {
            gameOver = true;
            winner = "Player-1(White)";
        }
    }
    
    private boolean isCheckmate() {
        if (!isInCheck(currentPlayer)) {
            return false;
        }
        
        // Try all possible moves for the current player
        for (int fromRow = 0; fromRow < 8; fromRow++) {
            for (int fromCol = 0; fromCol < 8; fromCol++) {
                String piece = board[fromRow][fromCol];
                if (piece != null && piece.startsWith(currentPlayer)) {
                    for (int toRow = 0; toRow < 8; toRow++) {
                        for (int toCol = 0; toCol < 8; toCol++) {
                            if (isValidMove(new int[]{fromRow, fromCol}, new int[]{toRow, toCol}, piece)) {
                                // Make the move temporarily
                                String originalPiece = board[toRow][toCol];
                                board[toRow][toCol] = piece;
                                board[fromRow][fromCol] = null;
                                
                                boolean stillInCheck = isInCheck(currentPlayer);
                                
                                // Undo the move
                                board[fromRow][fromCol] = piece;
                                board[toRow][toCol] = originalPiece;
                                
                                if (!stillInCheck) {
                                    return false; // Found a legal move
                                }
                            }
                        }
                    }
                }
            }
        }
        return true; // No legal moves found
    }
    
    private boolean isInCheck(String player) {
        // Find the king
        int[] kingPos = findKing(player);
        if (kingPos == null) return false;
        
        // Check if any opponent piece can attack the king
        String opponent = player.equals("w") ? "b" : "w";
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                String piece = board[row][col];
                if (piece != null && piece.startsWith(opponent)) {
                    if (isValidMove(new int[]{row, col}, kingPos, piece)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    private int[] findKing(String player) {
        String kingPiece = player + "k";
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                if (kingPiece.equals(board[row][col])) {
                    return new int[]{row, col};
                }
            }
        }
        return null;
    }

    private int[] algebraicToPosition(String algebraic) {
        if (algebraic == null || algebraic.length() != 2) return null;
        
        char file = algebraic.charAt(0);
        char rank = algebraic.charAt(1);
        
        if (file < 'a' || file > 'h' || rank < '1' || rank > '8') return null;
        
        int col = file - 'a';
        int row = 8 - (rank - '0');
        
        return new int[]{row, col};
    }

    public String[][] getBoard() {
        return board;
    }

    public String getCurrentPlayer() {
        return currentPlayer;
    }

    public boolean isGameOver() {
        return gameOver;
    }

    public String getWinner() {
        return winner;
    }

    public String getTurn() {
        return currentPlayer;
    }

    public boolean isDraw() {
        // Simplified draw detection
        return false;
    }

    public boolean isStalemate() {
        if (isInCheck(currentPlayer)) {
            return false; // Can't be stalemate if in check
        }
        
        // Check if current player has any legal moves
        for (int fromRow = 0; fromRow < 8; fromRow++) {
            for (int fromCol = 0; fromCol < 8; fromCol++) {
                String piece = board[fromRow][fromCol];
                if (piece != null && piece.startsWith(currentPlayer)) {
                    for (int toRow = 0; toRow < 8; toRow++) {
                        for (int toCol = 0; toCol < 8; toCol++) {
                            if (isValidMove(new int[]{fromRow, fromCol}, new int[]{toRow, toCol}, piece)) {
                                // Make the move temporarily
                                String originalPiece = board[toRow][toCol];
                                board[toRow][toCol] = piece;
                                board[fromRow][fromCol] = null;
                                
                                boolean wouldBeInCheck = isInCheck(currentPlayer);
                                
                                // Undo the move
                                board[fromRow][fromCol] = piece;
                                board[toRow][toCol] = originalPiece;
                                
                                if (!wouldBeInCheck) {
                                    return false; // Found a legal move
                                }
                            }
                        }
                    }
                }
            }
        }
        return true; // No legal moves found
    }
}