package com.chess.game;

import com.chess.model.User;
import com.chess.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GameManager {
    
    private final List<Game> games = new ArrayList<>();
    private WebSocketSession pendingUser = null;
    private final List<WebSocketSessionWithUser> users = new ArrayList<>();
    private final Map<String, Game> friendGames = new ConcurrentHashMap<>();
    
    @Autowired
    private UserRepository userRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void addUser(WebSocketSession session, String userEmail) {
        // If user has an email, remove any existing socket connections for this user
        if (userEmail != null) {
            // Remove old socket from users array
            users.removeIf(user -> userEmail.equals(user.getUserEmail()));
            
            // If the old socket was pending, clear it
            if (pendingUser != null) {
                WebSocketSessionWithUser pendingUserWithEmail = findUserBySession(pendingUser);
                if (pendingUserWithEmail != null && userEmail.equals(pendingUserWithEmail.getUserEmail())) {
                    pendingUser = null;
                }
            }
        }
        
        WebSocketSessionWithUser userSession = new WebSocketSessionWithUser(session, userEmail);
        users.add(userSession);
    }

    public void removeUser(WebSocketSession session) {
        // Check if the session being removed is the pendingUser
        if (pendingUser == session) {
            pendingUser = null;
        }
        
        users.removeIf(user -> user.getSession().equals(session));
        Game game = findGameBySession(session);
        if (game != null) {
            removeGame(game);
        }
    }

    public void handleMessage(WebSocketSession session, String data) {
        try {
            JsonNode message = objectMapper.readTree(data);
            String type = message.get("type").asText();
            
            switch (type) {
                case Messages.INIT_GAME:
                    if (pendingUser != null) {
                        Game game = new Game(pendingUser, session);
                        games.add(game);
                        pendingUser = null;
                    } else {
                        pendingUser = session;
                    }
                    break;

                case Messages.SEND_GAME_REQUEST:
                    handleSendGameRequest(message);
                    break;

                case Messages.ACCEPT_GAME_REQUEST:
                    handleAcceptGameRequest(message);
                    break;

                case Messages.MOVE:
                    Game gameToMove = findGameBySession(session);
                    if (gameToMove != null) {
                        JsonNode movePayload = message.get("payload").get("move");
                        Move move = new Move(
                            movePayload.get("from").asText(),
                            movePayload.get("to").asText(),
                            movePayload.has("promotion") ? movePayload.get("promotion").asText() : null
                        );
                        gameToMove.makeMove(session, move);
                    }
                    break;

                case Messages.GAME_OVER:
                    Game gameToEnd = findGameBySession(session);
                    if (gameToEnd != null) {
                        removeGame(gameToEnd);
                    }
                    break;
            }
        } catch (Exception e) {
            System.err.println("Error handling message: " + e.getMessage());
        }
    }

    private void handleSendGameRequest(JsonNode message) {
        try {
            JsonNode payload = message.get("payload");
            String to = payload.get("to").asText();
            String from = payload.get("from").asText();
            String gameId = payload.get("gameId").asText();

            // Store game request in database
            User toUser = userRepository.findByEmail(to).orElse(null);
            if (toUser != null) {
                toUser.getGameRequests().add(new User.GameRequest(from, gameId));
                userRepository.save(toUser);
            }

            // Send real-time notification
            WebSocketSessionWithUser recipientSession = findUserByEmail(to);
            if (recipientSession != null) {
                String responseMessage = objectMapper.writeValueAsString(Map.of(
                    "type", Messages.SEND_GAME_REQUEST,
                    "payload", Map.of("from", from, "gameId", gameId)
                ));
                recipientSession.getSession().sendMessage(new TextMessage(responseMessage));
            }
        } catch (Exception e) {
            System.err.println("Error handling game request: " + e.getMessage());
        }
    }

    private void handleAcceptGameRequest(JsonNode message) {
        try {
            JsonNode payload = message.get("payload");
            String gameId = payload.get("gameId").asText();
            String from = payload.get("from").asText();
            String to = payload.get("to").asText();

            // Find both players' sessions
            WebSocketSessionWithUser player1Session = findUserByEmail(to);
            WebSocketSessionWithUser player2Session = findUserByEmail(from);

            if (player1Session == null || player2Session == null) {
                System.err.println("One or both players not found");
                return;
            }

            // Create new game instance
            Game friendGame = new Game(player1Session.getSession(), player2Session.getSession(), gameId);
            friendGames.put(gameId, friendGame);

            // Update user's game_requests in database
            User user = userRepository.findByEmail(to).orElse(null);
            if (user != null) {
                user.getGameRequests().removeIf(req -> 
                    req.getFrom().equals(from) && req.getGameId().equals(gameId));
                userRepository.save(user);
            }

        } catch (Exception e) {
            System.err.println("Error handling game acceptance: " + e.getMessage());
        }
    }

    private Game findGameBySession(WebSocketSession session) {
        for (Game game : games) {
            if (game.getPlayer1().equals(session) || game.getPlayer2().equals(session)) {
                return game;
            }
        }
        
        for (Game game : friendGames.values()) {
            if (game.getPlayer1().equals(session) || game.getPlayer2().equals(session)) {
                return game;
            }
        }
        
        return null;
    }

    private void removeGame(Game game) {
        games.remove(game);
        friendGames.values().removeIf(g -> g.equals(game));
    }

    private WebSocketSessionWithUser findUserBySession(WebSocketSession session) {
        return users.stream()
                .filter(user -> user.getSession().equals(session))
                .findFirst()
                .orElse(null);
    }

    private WebSocketSessionWithUser findUserByEmail(String email) {
        return users.stream()
                .filter(user -> email.equals(user.getUserEmail()))
                .findFirst()
                .orElse(null);
    }

    // Inner class to hold session with user email
    private static class WebSocketSessionWithUser {
        private final WebSocketSession session;
        private final String userEmail;

        public WebSocketSessionWithUser(WebSocketSession session, String userEmail) {
            this.session = session;
            this.userEmail = userEmail;
        }

        public WebSocketSession getSession() {
            return session;
        }

        public String getUserEmail() {
            return userEmail;
        }
    }
}