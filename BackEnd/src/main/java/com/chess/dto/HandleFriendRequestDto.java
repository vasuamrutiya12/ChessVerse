package com.chess.dto;

public class HandleFriendRequestDto {
    private String userEmail;
    private String friendEmail;
    private String action;

    // Constructors
    public HandleFriendRequestDto() {}

    public HandleFriendRequestDto(String userEmail, String friendEmail, String action) {
        this.userEmail = userEmail;
        this.friendEmail = friendEmail;
        this.action = action;
    }

    // Getters and Setters
    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getFriendEmail() {
        return friendEmail;
    }

    public void setFriendEmail(String friendEmail) {
        this.friendEmail = friendEmail;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }
}