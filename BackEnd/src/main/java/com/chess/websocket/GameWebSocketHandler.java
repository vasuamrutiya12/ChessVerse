package com.chess.websocket;

import com.chess.game.GameManager;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class GameWebSocketHandler implements WebSocketHandler {

    @Autowired
    private GameManager gameManager;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        try {
            String userEmail = extractUserEmailFromSession(session);
            System.out.println("New WebSocket connection established");
            System.out.println("Session URI: " + session.getUri());
            System.out.println("Extracted user email: " + userEmail);
            
            if (userEmail != null) {
                gameManager.addUser(session, userEmail);
            } else {
                System.out.println("Warning: Connection attempt without email, adding with null email");
                gameManager.addUser(session, null);
            }
        } catch (Exception e) {
            System.err.println("Error handling WebSocket connection: " + e.getMessage());
            e.printStackTrace();
            gameManager.addUser(session, null);
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        if (message instanceof TextMessage) {
            String payload = ((TextMessage) message).getPayload();
            gameManager.handleMessage(session, payload);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.err.println("WebSocket transport error: " + exception.getMessage());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        System.out.println("User disconnected");
        gameManager.removeUser(session);
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    private String extractUserEmailFromSession(WebSocketSession session) {
        try {
            System.out.println("Extracting email from session...");
            URI uri = session.getUri();
            System.out.println("Session URI: " + uri);
            
            if (uri != null && uri.getQuery() != null) {
                String query = uri.getQuery();
                System.out.println("Query string: " + query);
                String[] params = query.split("&");
                for (String param : params) {
                    String[] keyValue = param.split("=");
                    if (keyValue.length == 2 && "email".equals(keyValue[0])) {
                        String email = URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8);
                        System.out.println("Found email parameter: " + email);
                        return email;
                    }
                }
            } else {
                System.out.println("No query string found in URI");
            }
        } catch (Exception e) {
            System.err.println("Error extracting email from session: " + e.getMessage());
            e.printStackTrace();
        }
        System.out.println("No email found in session");
        return null;
    }
}