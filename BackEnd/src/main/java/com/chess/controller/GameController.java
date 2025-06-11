package com.chess.controller;

import com.chess.dto.*;
import com.chess.model.GameRequestEntity;
import com.chess.model.User;
import com.chess.repository.GameRequestRepository;
import com.chess.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/game")
public class GameController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRequestRepository gameRequestRepository;

    @PostMapping("/sendfriendrequest")
    public ResponseEntity<?> sendFriendRequest(@RequestBody FriendRequestDto request) {
        try {
            Optional<User> userToOpt = userRepository.findByEmail(request.getTo());

            if (userToOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }

            User userTo = userToOpt.get();
            if (!userTo.getFriendRequests().contains(request.getFrom())) {
                userTo.getFriendRequests().add(request.getFrom());
                userRepository.save(userTo);
            }

            return ResponseEntity.ok(Map.of("message", "Friend request sent"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Server error"));
        }
    }

    @PostMapping("/handlefriendrequest")
    public ResponseEntity<?> handleFriendRequest(@RequestBody HandleFriendRequestDto request) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(request.getUserEmail());
            Optional<User> friendOpt = userRepository.findByEmail(request.getFriendEmail());

            if (userOpt.isEmpty() || friendOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();
            User friend = friendOpt.get();

            user.getFriendRequests().removeIf(email -> email.equals(request.getFriendEmail()));

            if ("accept".equals(request.getAction())) {
                if (!user.getFriendList().contains(request.getFriendEmail())) {
                    user.getFriendList().add(request.getFriendEmail());
                }
                if (!friend.getFriendList().contains(request.getUserEmail())) {
                    friend.getFriendList().add(request.getUserEmail());
                }
            }

            userRepository.save(user);
            userRepository.save(friend);

            return ResponseEntity.ok(Map.of(
                    "message", "Friend request " + request.getAction() + "ed",
                    "updatedUser", user
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Server error"));
        }
    }

    @PostMapping("/sendgamerequest")
    public ResponseEntity<?> sendGameRequest(@RequestBody GameRequestDto request) {
        try {
            Optional<User> fromUserOpt = userRepository.findByEmail(request.getFrom());
            Optional<User> toUserOpt = userRepository.findByEmail(request.getTo());

            if (fromUserOpt.isEmpty() || toUserOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }

            String gameId = UUID.randomUUID().toString();
            GameRequestEntity gameRequest = new GameRequestEntity(request.getFrom(), request.getTo(), gameId);
            gameRequestRepository.save(gameRequest);

            return ResponseEntity.ok(Map.of(
                    "message", "Game request sent",
                    "gameId", gameRequest.getGameId()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Server error"));
        }
    }

    @PostMapping("/handlegamerequest")
    public ResponseEntity<?> handleGameRequest(@RequestBody HandleGameRequestDto request) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(request.getTo());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();
            user.getGameRequests().removeIf(gameRequest -> 
                    gameRequest.getFrom().equals(request.getFrom()) && 
                    gameRequest.getGameId().equals(request.getGameId()));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Game request " + request.getAction() + "ed",
                    "gameId", request.getGameId()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Server error"));
        }
    }
}