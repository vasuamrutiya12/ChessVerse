package com.chess.game;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.chess.service.ChessEngineService;
import com.chess.dto.ChatMessageDto;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;

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
    private ChessEngineService chessEngineService;
    private List<ChatMessageDto> chatHistory = new ArrayList<>();
    private List<String> moveHistory = new ArrayList<>();

    public Game(WebSocketSession player1, WebSocketSession player2) {
        this(player1, player2, generateGameId());
    }

    public Game(WebSocketSession player1, WebSocketSession player2, String gameId) {
        this(player1, player2, gameId, null);
    }

    public Game(WebSocketSession player1, WebSocketSession player2, String gameId, GameManager gameManager, ChessEngineService chessEngineService) {
        this.player1 = player1;
        this.player2 = player2;
        this.chessEngine = new ChessEngine();
        this.isYourTurn = true;
        this.gameId = (gameId != null) ? gameId : generateGameId(); // <-- Fix here
        this.gameManager = gameManager;
        this.chessEngineService = chessEngineService;

        initializeGame();
        startTimer();
    }

    public Game(WebSocketSession player1, WebSocketSession player2, String gameId, Object o) {
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
            // Check if move captures a piece
            String capturedPiece = null;
            String[][] board = chessEngine.getBoard();
            int[] toPos = algebraicToPosition(move.getTo());
            if (toPos != null && board[toPos[0]][toPos[1]] != null) {
                capturedPiece = board[toPos[0]][toPos[1]];
            }
            
            boolean moveSuccessful = chessEngine.makeMove(move);
            if (!moveSuccessful) {
                return;
            }

            // Add move to history for analysis
            moveHistory.add(move.getFrom() + move.getTo());
            
            // Send capture notification if piece was captured
            if (capturedPiece != null) {
                sendCaptureNotification(socket, capturedPiece, move);
            }
            
            // Analyze the move
            if (chessEngineService != null) {
                try {
                    String fen = getCurrentFEN(); // You'll need to implement this
                    ChessEngineService.MoveAnalysis analysis = chessEngineService.analyzeMove(fen, move.getFrom() + move.getTo());
                    
                    // Send move analysis to the player who made the move
                    String analysisMessage = objectMapper.writeValueAsString(Map.of(
                        "type", Messages.MOVE_ANALYSIS,
                        "payload", Map.of(
                            "move", move.getFrom() + move.getTo(),
                            "classification", analysis.getClassification(),
                            "bestMove", analysis.getBestMove(),
                            "scoreDiff", analysis.getScoreAfter() - analysis.getScoreBefore(),
                            "evaluation", analysis.getScoreAfter()
                        )
                    ));
                    
                    socket.sendMessage(new TextMessage(analysisMessage));
                } catch (Exception e) {
                    System.err.println("Error analyzing move: " + e.getMessage());
                }
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

    private void sendCaptureNotification(WebSocketSession capturer, String capturedPiece, Move move) {
        try {
            String capturerEmail = getPlayerEmailFromSession(capturer);
            String pieceType = getPieceDisplayName(capturedPiece);
            String color = capturedPiece.charAt(0) == 'w' ? "White" : "Black";
            
            String captureMessage = objectMapper.writeValueAsString(Map.of(
                "type", "piece_captured",
                "payload", Map.of(
                    "capturer", capturerEmail,
                    "piece", pieceType,
                    "color", color,
                    "move", move.getFrom() + move.getTo(),
                    "message", capturerEmail + " captured " + color + " " + pieceType + "!"
                )
            ));
            
            // Send to both players
            if (player1 != null && player1.isOpen()) {
                player1.sendMessage(new TextMessage(captureMessage));
            }
            if (player2 != null && player2.isOpen()) {
                player2.sendMessage(new TextMessage(captureMessage));
            }
            
        } catch (Exception e) {
            System.err.println("Error sending capture notification: " + e.getMessage());
        }
    }
    
    private String getPieceDisplayName(String piece) {
        char type = piece.charAt(1);
        switch (type) {
            case 'p': return "Pawn";
            case 'r': return "Rook";
            case 'n': return "Knight";
            case 'b': return "Bishop";
            case 'q': return "Queen";
            case 'k': return "King";
            default: return "Piece";
        }
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
            
            // Send game analysis after game ends
            sendGameAnalysis();

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
            
            // Send game analysis after game ends
            sendGameAnalysis();

        } catch (Exception e) {
            System.err.println("Error sending game over: " + e.getMessage());
        }
    }
    
    public void sendChatMessage(WebSocketSession sender, ChatMessageDto chatMessage) {
        try {
            chatHistory.add(chatMessage);
            
            System.out.println("Sending chat message to both players: " + chatMessage.getMessage());
            
            String chatMessageJson = objectMapper.writeValueAsString(Map.of(
                "type", Messages.CHAT_MESSAGE,
                "payload", Map.of(
                    "from", chatMessage.getFrom(),
                    "message", chatMessage.getMessage(),
                    "gameId", chatMessage.getGameId(),
                    "timestamp", chatMessage.getTimestamp().toString()
                )
            ));
            
            // Send to both players
            if (player1 != null && player1.isOpen()) {
                player1.sendMessage(new TextMessage(chatMessageJson));
                System.out.println("Chat sent to player1");
            }
            if (player2 != null && player2.isOpen()) {
                player2.sendMessage(new TextMessage(chatMessageJson));
                System.out.println("Chat sent to player2");
            }
            
        } catch (Exception e) {
            System.err.println("Error sending chat message: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public void sendHint(WebSocketSession requester) {
        System.out.println("Sending hint to requester");
        if (chessEngineService == null) {
            // Send fallback hint
            try {
                String fallbackMessage = objectMapper.writeValueAsString(Map.of(
                    "type", Messages.HINT_RESPONSE,
                    "payload", Map.of(
                        "bestMove", "e2e4",
                        "hint", "Chess engine not available. Try developing your pieces towards the center!"
                    )
                ));
                requester.sendMessage(new TextMessage(fallbackMessage));
            } catch (Exception e) {
                System.err.println("Error sending fallback hint: " + e.getMessage());
            }
            return;
        }
        
        try {
            String fen = getCurrentFEN(); // You'll need to implement this
            System.out.println("Current FEN: " + fen);
            String bestMove = chessEngineService.getBestMove(fen, 10);
            System.out.println("Best move from engine: " + bestMove);
            
            if (bestMove != null) {
                String hintText = generateHintText(bestMove);
                String hintMessage = objectMapper.writeValueAsString(Map.of(
                    "type", Messages.HINT_RESPONSE,
                    "payload", Map.of(
                        "bestMove", bestMove,
                        "hint", hintText
                    )
                ));
                
                System.out.println("Sending hint message: " + hintMessage);
                requester.sendMessage(new TextMessage(hintMessage));
            } else {
                System.out.println("No best move found");
                // Send fallback
                String fallbackMessage = objectMapper.writeValueAsString(Map.of(
                    "type", Messages.HINT_RESPONSE,
                    "payload", Map.of(
                        "bestMove", "e2e4",
                        "hint", "Consider controlling the center or developing your pieces."
                    )
                ));
                requester.sendMessage(new TextMessage(fallbackMessage));
            }
        } catch (Exception e) {
            System.err.println("Error sending hint: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private String generateHintText(String move) {
        if (move.length() < 4) return "Consider this move: " + move;
        
        String from = move.substring(0, 2);
        String to = move.substring(2, 4);
        
        // Get piece at from position
        String[][] board = chessEngine.getBoard();
        int[] fromPos = algebraicToPosition(from);
        String piece = null;
        if (fromPos != null) {
            piece = board[fromPos[0]][fromPos[1]];
        }
        
        String pieceType = piece != null ? getPieceDisplayName(piece) : "piece";
        
        return String.format("Move your %s from %s to %s. This is the strongest move in this position.", 
                           pieceType.toLowerCase(), from, to);
    }
    
    private void sendGameAnalysis() {
        if (chessEngineService == null || moveHistory.isEmpty()) return;
        
        try {
            ChessEngineService.GameAnalysis analysis = chessEngineService.analyzeGame(moveHistory, null);
            
            String analysisMessage = objectMapper.writeValueAsString(Map.of(
                "type", Messages.GAME_ANALYSIS,
                "payload", Map.of(
                    "accuracy", analysis.getAccuracy(),
                    "blunders", analysis.getBlunders(),
                    "mistakes", analysis.getMistakes(),
                    "inaccuracies", analysis.getInaccuracies(),
                    "excellent", analysis.getExcellent(),
                    "good", analysis.getGood(),
                    "moves", analysis.getMoves(),
                    "totalMoves", moveHistory.size(),
                    "gameLength", moveHistory.size() / 2
                )
            ));
            
            player1.sendMessage(new TextMessage(analysisMessage));
            player2.sendMessage(new TextMessage(analysisMessage));
            
        } catch (Exception e) {
            System.err.println("Error sending game analysis: " + e.getMessage());
        }
    }
    
    private String getCurrentFEN() {
        StringBuilder fen = new StringBuilder();
        
        // Board position
        String[][] board = chessEngine.getBoard();
        for (int rank = 0; rank < 8; rank++) {
            int emptyCount = 0;
            for (int file = 0; file < 8; file++) {
                String piece = board[rank][file];
                if (piece == null) {
                    emptyCount++;
                } else {
                    if (emptyCount > 0) {
                        fen.append(emptyCount);
                        emptyCount = 0;
                    }
                    // Convert piece notation
                    char pieceChar = piece.charAt(1);
                    if (piece.charAt(0) == 'w') {
                        pieceChar = Character.toUpperCase(pieceChar);
                    }
                    fen.append(pieceChar);
                }
            }
            if (emptyCount > 0) {
                fen.append(emptyCount);
            }
            if (rank < 7) {
                fen.append('/');
            }
        }
        
        // Active color
        fen.append(' ').append(chessEngine.getCurrentPlayer());
        
        // Castling availability (simplified)
        fen.append(" KQkq");
        
        // En passant target square (simplified)
        fen.append(" -");
        
        // Halfmove clock and fullmove number (simplified)
        fen.append(" 0 ").append((moveCount / 2) + 1);
        
        return fen.toString();
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