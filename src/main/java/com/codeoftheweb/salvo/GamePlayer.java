package com.codeoftheweb.salvo;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Entity
public class GamePlayer {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
  @GenericGenerator(name = "native", strategy = "native")
  private long id;
  private LocalDateTime creationDate;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "player_id")
  private Player player;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "game_id")
  private Game game;

  @OneToMany(mappedBy = "gamePlayer", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
  private Set<Ship> ships = new HashSet<>();

  @OneToMany(mappedBy = "gamePlayer", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
  private Set<Salvo> salvoes = new HashSet<>();

  // Constructors
  public GamePlayer() {
    this.creationDate = LocalDateTime.now();
  }

  public GamePlayer(Player player, Game game) {
    this.player = player;
    this.game = game;
    this.creationDate = LocalDateTime.now();
  }

  // setters and getters
  public LocalDateTime getCreationDate() {
    return creationDate;
  }

  public void setCreationDate(LocalDateTime creationDate) {
    this.creationDate = creationDate;
  }

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }


  public Player getPlayer() {
    return player;
  }

  public void setPlayer(Player player) {
    this.player = player;
  }

  public Set<Ship> getShips() {
    return ships;
  }

  public void setShips(Set<Ship> ships) {
    this.ships = ships;
  }

  public void setSalvoes(Set<Salvo> salvoes) {
    this.salvoes = salvoes;
  }

  public Set<Salvo> getSalvoes() {
    return salvoes;
  }

  public Game getGame() {
    return game;
  }

  public void setGame(Game game) {
    this.game = game;
  }

  // methods
  public void addShip(Ship ship) {
    ship.setGamePlayer(this);
    ships.add(ship);
  }

  public void addSalvo(Salvo salvo) {
    salvo.setGamePlayer(this);
    salvoes.add(salvo);
  }

  public Score getScore() {
    return this.game.getScores().stream().filter(score -> score.getPlayer() == this.getPlayer())
            .findFirst().orElse(null);
  }

  // GamePlayer DTO for /games
  public Map<String, Object> makeDTO() {
    Map<String, Object> dto = new LinkedHashMap<String, Object>();
    dto.put("gamePlayerId", this.id);
    dto.put("player", this.player.makeDTO());
    if(this.player.getScore(this.getGame()) != null)
      dto.put("score", this.player.getScore(this.getGame()).getScore());
    else
      dto.put("score", this.player.getScore(this.getGame()));
    return dto;
  }

  // GamePlayer DTO for /game_view
  public Map<String, Object> makeDTOGameView() {
    Map<String, Object> dto = new LinkedHashMap<String, Object>();
    dto.put("gameId", this.game.getId());
    dto.put("created", this.game.getCreationDate());
    dto.put("gamePlayers", this.game.getGamePlayers().stream().map(GamePlayer::makeDTO));
    dto.put("ships", this.getShips().stream().map(Ship::makeDTO));
    dto.put("salvoes", this.game.getGamePlayers().stream()
            .flatMap(gamePlayer -> gamePlayer.getSalvoes().stream().map(Salvo::makeDTO)));
    dto.put("nextTurn", this.getSalvoes().size() + 1);
    return dto;
  }
}
