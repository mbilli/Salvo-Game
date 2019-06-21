package com.codeoftheweb.salvo.model;

public enum GamePlayerState {
    WAIT_OPPONENT_JOIN,
    PLACE_SHIPS,
    WAIT_OPPONENT_SHIPS,
    ENTER_SALVO,
    WAIT_OPPONENT_SALVO,
    GAME_OVER_WON,
    GAME_OVER_LOST,
    GAME_OVER_TIED,
    UNKNOWN
}
