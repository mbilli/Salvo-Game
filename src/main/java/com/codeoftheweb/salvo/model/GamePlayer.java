package com.codeoftheweb.salvo.model;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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

  // Methods
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

  // Dado una lista de barcos y salvos, devuelve los barcos hundidos
  public List<Ship> isSink(Set<Ship> ships, Set<Salvo> salvoes){
    List<String> allShots = salvoes.stream().flatMap(salvo -> salvo.getSalvoLocation().stream()).collect(Collectors.toList());
    return ships.stream().filter(ship -> allShots.containsAll(ship.getShipLocation())).collect(Collectors.toList());
  }

  // Devuelve el estado de un gameplayer (ver GamePlayerState enum)
  public GamePlayerState getGamePlayerState() {
    GamePlayerState stateResponse;
    GamePlayer opponentGP = this.getGame().getGamePlayers().stream().filter(gp->gp.getId()!=this.getId()).findFirst()
            .orElse(null);
    if (opponentGP == null) {
      stateResponse = GamePlayerState.WAIT_OPPONENT_JOIN;
    } else if(this.getShips().isEmpty()) {
      stateResponse = GamePlayerState.PLACE_SHIPS;
    } else if(opponentGP.getShips().isEmpty()) {
      stateResponse = GamePlayerState.WAIT_OPPONENT_SHIPS;
    } else {
      int sunkOpponentNumber = isSink(opponentGP.getShips(), this.getSalvoes()).size();
      int sunkPlayerNumber = isSink(this.getShips(), opponentGP.getSalvoes()).size();
      int opponentTurn = opponentGP.getSalvoes().size();
      int playerTurn = this.getSalvoes().size();
      // Si se hundieron todos los barcos enemigos pero no los mios y el turno del oponente es mayor o igual al mio
      // Gano el juego
      if(sunkOpponentNumber >= 5 && sunkPlayerNumber < 5 && opponentTurn >= playerTurn) {
        stateResponse = GamePlayerState.GAME_OVER_WON;
        // Si no se hundieron todos los barcos enemigos pero si los mios y mi turno es mayor o igual al del oponente
        // Pierdo el juego
      } else if(sunkOpponentNumber < 5 && sunkPlayerNumber >= 5 && opponentTurn <= playerTurn) {
        stateResponse = GamePlayerState.GAME_OVER_LOST;
        // Si se hundieron todos los barcos enemigos y los mios
        // Empato el juego
      } else if(sunkOpponentNumber == 5 && sunkPlayerNumber == 5) {
        stateResponse = GamePlayerState.GAME_OVER_TIED;
      } else if (this.getSalvoes().size() <= opponentGP.getSalvoes().size()) {
        stateResponse = GamePlayerState.ENTER_SALVO;
      } else if (this.getSalvoes().size() > opponentGP.getSalvoes().size()) {
        stateResponse = GamePlayerState.WAIT_OPPONENT_SALVO;
      } else {
        stateResponse = GamePlayerState.UNKNOWN;
      }
    }
    return stateResponse;
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
    GamePlayer opponentGP;
    opponentGP = this.getGame().getGamePlayers().stream().filter(gp->gp.getId()!=this.getId()).findFirst().orElse(null);
    if (opponentGP != null){
      dto.put("hits", this.salvoes.stream().map(salvo -> salvo.findHitsOnShips(opponentGP.getShips())));
      dto.put("sinkShips", this.isSink(opponentGP.getShips(), this.getSalvoes()).stream().map(Ship::makeDTO));
    }
    dto.put("gamePlayerSate", this.getGamePlayerState());
    return dto;
  }
}
