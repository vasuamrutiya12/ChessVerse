package com.chess.controller;

import com.chess.dto.AuthRequest;
import com.chess.dto.AuthResponse;
import com.chess.model.User;

import com.chess.repository.UserRepository;
import com.chess.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/auth/check")
    public ResponseEntity<?> checkAuth(HttpServletRequest request) {
        String token = getTokenFromCookies(request);
        
        if (token == null) {
            return ResponseEntity.status(401).body(Map.of("message", "No token found"));
        }

        try {
            if (!jwtUtil.validateToken(token) || jwtUtil.isTokenExpired(token)) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid token"));
            }

            String email = jwtUtil.getEmailFromToken(token);
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();

            // Get all users except the current user
            List<String> allUsers = userRepository.findAllEmailsExcept(email)
                    .stream()
                    .map(User::getEmail)
                    .collect(Collectors.toList());

            // Filter out users who are already in friend_requests or friend_list
            List<String> availableUsers = allUsers.stream()
                    .filter(userEmail -> !user.getFriendRequests().contains(userEmail) && 
                                       !user.getFriendList().contains(userEmail))
                    .collect(Collectors.toList());

            // Filter out users from friend_requests who are already in friend_list
            List<String> filteredFriendRequests = user.getFriendRequests().stream()
                    .filter(userEmail -> !user.getFriendList().contains(userEmail))
                    .collect(Collectors.toList());

            AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                    user.getEmail(),
                    user.getName(),
                    filteredFriendRequests,
                    user.getFriendList(),
                    user.getGameRequests()
            );

            AuthResponse response = new AuthResponse(true, availableUsers, userInfo);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid token"));
        }
    }

    @PostMapping("/auth/google")
    public ResponseEntity<?> googleAuth(@RequestBody AuthRequest authRequest, HttpServletResponse response) {
        try {
            Optional<User> existingUser = userRepository.findByEmail(authRequest.getEmail());
            User user;

            if (existingUser.isEmpty()) {
                user = new User(authRequest.getName(), authRequest.getEmail());
                userRepository.save(user);
            } else {
                user = existingUser.get();
            }

            String token = jwtUtil.generateToken(authRequest.getEmail());
            
            Cookie cookie = new Cookie("auth_token", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // Set to true in production with HTTPS
            cookie.setMaxAge(2 * 24 * 60 * 60); // 2 days
            cookie.setPath("/");
            response.addCookie(cookie);

            return ResponseEntity.ok(Map.of("success", true));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Server error: " + e.getMessage()));
        }
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        try {
            Cookie cookie = new Cookie("auth_token", null);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // Set to true in production with HTTPS
            cookie.setMaxAge(0); // Delete the cookie
            cookie.setPath("/");
            response.addCookie(cookie);

            return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Logout failed"));
        }
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard(@RequestParam(defaultValue = "10") int topN) {
        List<User> allUsers = userRepository.findAll();
        System.out.print(allUsers);
        allUsers.sort((u1, u2) -> Integer.compare(u2.getElo(), u1.getElo()));
        List<Map<String, Object>> leaderboard = (List<Map<String, Object>>) (List<?>) allUsers.stream().limit(topN).map(user -> Map.of(
            "name", user.getName(),
            "email", user.getEmail(),
            "elo", user.getElo(),
            "wins", user.getWins(),
            "losses", user.getLosses(),
            "draws", user.getDraws(),
            "currentStreak", user.getCurrentStreak()
        )).toList();
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/player-stats/{email}")
    public ResponseEntity<?> getPlayerStats(@PathVariable String email) {
        try {
            // Decode the email parameter to handle URL encoding
            email = URLDecoder.decode(email, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid email format"));
        }
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }
        
        User user = userOpt.get();
        int totalGames = user.getWins() + user.getLosses() + user.getDraws();
        double winRate = totalGames > 0 ? (double) user.getWins() / totalGames : 0.0;
        
        Map<String, Object> stats = Map.of(
            "name", user.getName(),
            "email", user.getEmail(),
            "elo", user.getElo(),
            "wins", user.getWins(),
            "losses", user.getLosses(),
            "draws", user.getDraws(),
            "winRate", winRate,
            "averageMoveTime", user.getAverageMoveTime(),
            "currentStreak", user.getCurrentStreak(),
            "gameHistory", user.getGameHistory()
        );
        
        return ResponseEntity.ok(stats);
    }

    private String getTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("auth_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}