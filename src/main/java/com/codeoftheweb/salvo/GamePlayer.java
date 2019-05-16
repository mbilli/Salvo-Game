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

  public GamePlayer() {
    this.creationDate = LocalDateTime.now();
  }

  public GamePlayer(Player player, Game game) {
    this.player = player;
    this.game = game;
    this.creationDate = LocalDateTime.now();
  }

  public LocalDateTime getCreationDate() {
    return creationDate;
  }

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public void setCreationDate(LocalDateTime creationDate) {
    this.creationDate = creationDate;
  }

  public Player getPlayer() {
    return player;
  }

  public void setPlayer(Player player) {
    this.player = player;
  }

  public Game getGame() {
    return game;
  }

  public void setGame(Game game) {
    this.game = game;
  }

  // Retorna los Ships
  public Set<Ship> getShips() {
    return ships;
  }

  public void addShip(Ship ship) {
    ship.setGamePlayer(this);
    ships.add(ship);
  }

  // GamePlayer DTO
  public Map<String, Object> makeDTO() {
    Map<String, Object> dto = new LinkedHashMap<String, Object>();
    dto.put("gamePlayerId", this.id);
    dto.put("player", this.player.makeDTO());
    return dto;
  }

  // GamePlayer DTO for game_view
  public Map<String, Object> makeDTOGameView() {
    Map<String, Object> dto = new LinkedHashMap<String, Object>();
    dto.put("gameId", this.game.getId());
    dto.put("created", this.game.getCreationDate());
    dto.put("gamePlayers", this.game.getGamePlayers().stream().map(GamePlayer::makeDTO));
    dto.put("ships", this.getShips().stream().map(Ship::getShipType));
    return dto;
  }
}
