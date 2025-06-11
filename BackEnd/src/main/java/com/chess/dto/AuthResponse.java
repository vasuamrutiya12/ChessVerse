package com.chess.dto;

import com.chess.model.User;

import java.util.List;

public class AuthResponse {
    private boolean isAuthenticated;
    private List<String> users;
    private UserInfo user;

    // Constructors
    public AuthResponse() {}

    public AuthResponse(boolean isAuthenticated, List<String> users, UserInfo user) {
        this.isAuthenticated = isAuthenticated;
        this.users = users;
        this.user = user;
    }

    // Getters and Setters
    public boolean isAuthenticated() {
        return isAuthenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        isAuthenticated = authenticated;
    }

    public List<String> getUsers() {
        return users;
    }

    public void setUsers(List<String> users) {
        this.users = users;
    }

    public UserInfo getUser() {
        return user;
    }

    public void setUser(UserInfo user) {
        this.user = user;
    }

    // Inner class for UserInfo
    public static class UserInfo {
        private String email;
        private String name;
        private List<String> friend_requests;
        private List<String> friend_list;
        private List<User.GameRequest> game_requests;

        public UserInfo() {}

        public UserInfo(String email, String name, List<String> friend_requests, 
                       List<String> friend_list, List<User.GameRequest> game_requests) {
            this.email = email;
            this.name = name;
            this.friend_requests = friend_requests;
            this.friend_list = friend_list;
            this.game_requests = game_requests;
        }

        // Getters and Setters
        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public List<String> getFriend_requests() {
            return friend_requests;
        }

        public void setFriend_requests(List<String> friend_requests) {
            this.friend_requests = friend_requests;
        }

        public List<String> getFriend_list() {
            return friend_list;
        }

        public void setFriend_list(List<String> friend_list) {
            this.friend_list = friend_list;
        }

        public List<User.GameRequest> getGame_requests() {
            return game_requests;
        }

        public void setGame_requests(List<User.GameRequest> game_requests) {
            this.game_requests = game_requests;
        }
    }
}