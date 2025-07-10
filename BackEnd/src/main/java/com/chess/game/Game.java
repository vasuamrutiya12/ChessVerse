package com.chess.game;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

public class Game {
    private WebSocketSession player1;
    private WebSocketSession player2;
    private ChessEngine chessEngine;
    private boolean isYourTurn;
    private int moveCount = 0;
    private Timer timer;
    private int timeLeft = 60;
    private String gameId;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private GameManager gameManager;

    public Game(WebSocketSession player1, WebSocketSession player2) {
        this(player1, player2, generateGameId());
    }

    public Game(WebSocketSession player1, WebSocketSession player2, String gameId) {
        this(player1, player2, gameId, null);
    }

    public Game(WebSocketSession player1, WebSocketSession player2, String gameId, GameManager gameManager) {
        this.player1 = player1;
        this.player2 = player2;
        this.chessEngine = new ChessEngine();
        this.isYourTurn = true;
        this.gameId = (gameId != null) ? gameId : generateGameId(); // <-- Fix here
        this.gameManager = gameManager;

        initializeGame();
        startTimer();
    }

    private void initializeGame() {
        try {
            String player1Email = getPlayerEmailFromSession(player1);
            String player2Email = getPlayerEmailFromSession(player2);
            
            System.out.println("Initializing game between: " + player1Email + " and " + player2Email + " with gameId: " + gameId);
            
            // Send initial game state to both players
            String player1Message = objectMapper.writeValueAsString(Map.of(
                "type", Messages.INIT_GAME,
                "isYourTurn", true,
                "payload", Map.of(
                    "color", "white",
                    "gameId", gameId,
                    "opponent", player2Email != null ? player2Email : "Unknown Player"
                )
            ));

            String player2Message = objectMapper.writeValueAsString(Map.of(
                "type", Messages.INIT_GAME,
                "isYourTurn", false,
                "payload", Map.of(
                    "color", "black",
                    "gameId", gameId,
                    "opponent", player1Email != null ? player1Email : "Unknown Player"
                )
            ));

            player1.sendMessage(new TextMessage(player1Message));
            player2.sendMessage(new TextMessage(player2Message));

        } catch (Exception e) {
            System.err.println("Error initializing game: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void makeMove(WebSocketSession socket, Move move) {
        // Validate turn
        if (moveCount % 2 == 0 && !socket.equals(player1)) {
            return;
        }
        if (moveCount % 2 == 1 && !socket.equals(player2)) {
            return;
        }

        try {
            boolean moveSuccessful = chessEngine.makeMove(move);
            if (!moveSuccessful) {
                return;
            }

            // Reset the timer for the next player
            resetTimer();

            if (chessEngine.isGameOver()) {
                sendGameOver();
                return;
            }

            // Send the updated move to both players
            isYourTurn = !isYourTurn;
            
            String moveMessage1 = objectMapper.writeValueAsString(Map.of(
                "type", Messages.MOVE,
                "isYourTurn", isYourTurn,
                "payload", move
            ));

            String moveMessage2 = objectMapper.writeValueAsString(Map.of(
                "type", Messages.MOVE,
                "isYourTurn", !isYourTurn,
                "payload", move
            ));

            player1.sendMessage(new TextMessage(moveMessage1));
            player2.sendMessage(new TextMessage(moveMessage2));

            moveCount++;

        } catch (Exception e) {
            System.err.println("Error making move: " + e.getMessage());
        }
    }

    public void resign(WebSocketSession session) {
        try {
            String winner;
            String loser;
            String result;

            if (session.equals(player1)) {
                winner = "Player-2(Black)";
                loser = "Player-1(White)";
                result = "player2_win";
            } else {
                winner = "Player-1(White)";
                loser = "Player-2(Black)";
                result = "player1_win";
            }

            String gameOverMessage1 = objectMapper.writeValueAsString(Map.of(
                    "type", Messages.GAME_OVER,
                    "payload", Map.of(
                            "winner", winner,
                            "msg", loser.equals("Player-1(White)") ? "You resigned" : "Opponent resigned"
                    )
            ));

            String gameOverMessage2 = objectMapper.writeValueAsString(Map.of(
                    "type", Messages.GAME_OVER,
                    "payload", Map.of(
                            "winner", winner,
                            "msg", loser.equals("Player-2(Black)") ? "You resigned" : "Opponent resigned"
                    )
            ));

            player1.sendMessage(new TextMessage(gameOverMessage1));
            player2.sendMessage(new TextMessage(gameOverMessage2));

            if (timer != null) {
                timer.cancel();
            }

            // Update ELO and stats
            if (gameManager != null) {
                gameManager.updatePlayerStatsAndElo(player1, player2, result, gameId);
            }

        } catch (Exception e) {
            System.err.println("Error handling resignation: " + e.getMessage());
        }
    }

    private void resetTimer() {
        if (timer != null) {
            timer.cancel();
        }
        timeLeft = 60;
        startTimer();
    }

    private void startTimer() {
        timer = new Timer();
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                timeLeft--;
                if (timeLeft <= 0) {
                    sendGameOver();
                    timer.cancel();
                }
            }
        }, 1000, 1000);
    }

    private void sendGameOver() {
        try {
            String currentPlayer = chessEngine.getTurn().equals("w") ? "white" : "black";
            String winner;
            String message;
            String result;

            if (chessEngine.isStalemate() || chessEngine.isDraw()) {
                winner = "No one win";
                message = "It's a draw!";
                result = "draw";
            } else {
                winner = currentPlayer.equals("white") ? "Player-2(Black)" : "Player-1(White)";
                message = null;
                result = currentPlayer.equals("white") ? "player2_win" : "player1_win";
            }

            String gameOverMessage1 = objectMapper.writeValueAsString(Map.of(
                "type", Messages.GAME_OVER,
                "payload", Map.of(
                    "winner", winner,
                    "msg", message != null ? message : (winner.equals("Player-1(White)") ? "You win" : "You lose")
                )
            ));

            String gameOverMessage2 = objectMapper.writeValueAsString(Map.of(
                "type", Messages.GAME_OVER,
                "payload", Map.of(
                    "winner", winner,
                    "msg", message != null ? message : (winner.equals("Player-2(Black)") ? "You win" : "You lose")
                )
            ));

            player1.sendMessage(new TextMessage(gameOverMessage1));
            player2.sendMessage(new TextMessage(gameOverMessage2));

            if (timer != null) {
                timer.cancel();
            }

            // Update ELO and stats
            if (gameManager != null) {
                gameManager.updatePlayerStatsAndElo(player1, player2, result, gameId);
            }

        } catch (Exception e) {
            System.err.println("Error sending game over: " + e.getMessage());
        }
    }

    private String getPlayerEmailFromSession(WebSocketSession session) {
        try {
            if (session != null && session.getUri() != null && session.getUri().getQuery() != null) {
                String query = session.getUri().getQuery();
                String[] params = query.split("&");
                for (String param : params) {
                    String[] keyValue = param.split("=");
                    if (keyValue.length == 2 && "email".equals(keyValue[0])) {
                        return java.net.URLDecoder.decode(keyValue[1], java.nio.charset.StandardCharsets.UTF_8);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error extracting email from session: " + e.getMessage());
        }
        return null;
    }

    private static String generateGameId() {
        return java.util.UUID.randomUUID().toString().substring(0, 7);
    }

    // Getters
    public WebSocketSession getPlayer1() {
        return player1;
    }

    public WebSocketSession getPlayer2() {
        return player2;
    }

    public String getGameId() {
        return gameId;
    }
}