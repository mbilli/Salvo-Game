package com.codeoftheweb.salvo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.*;
import java.util.stream.Collectors;

@Entity
public class Salvo {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
  @GenericGenerator(name = "native", strategy = "native")
  private long id;
  private int turnNumber;

  @ElementCollection
  @Column(name="salvo_location")
  private List<String> salvoLocation = new ArrayList<>();

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name="game_player_id")
  private GamePlayer gamePlayer;

  // constructors
  public Salvo(){}

  public Salvo(int turnNumber, List<String> salvoLocation) {
    this.turnNumber = turnNumber;
    this.salvoLocation = salvoLocation;
  }

  // Getter and Setter
  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public int getTurnNumber() {
    return turnNumber;
  }

  public void setTurnNumber(int turnNumber) {
    this.turnNumber = turnNumber;
  }

  public List<String> getSalvoLocation() {
    return salvoLocation;
  }

  public void setSalvoLocation(List<String> salvoLocation) {
    this.salvoLocation = salvoLocation;
  }

  @JsonIgnore
  public GamePlayer getGamePlayer() {
    return gamePlayer;
  }

  public void setGamePlayer(GamePlayer gamePlayer) {
    this.gamePlayer = gamePlayer;
  }

  // Methods
  // Dado una lista de barcos, devuelve los salvos que impactaron en los barcos
  public Object findHitsOnShips(Set<Ship> ships){
    List<String> hitsLocation;
    Map<String, Object> mapResponse = new LinkedHashMap<String, Object>();
    hitsLocation = this.getSalvoLocation().stream().flatMap(salvoLocation->ships.stream()
            .flatMap(ship -> ship.getShipLocation().stream().filter(shipLocation->shipLocation.contains(salvoLocation))))
            .collect(Collectors.toList());
    mapResponse.put("turn", this.turnNumber);
    mapResponse.put("hitsLocations", hitsLocation);
    return mapResponse;
  }

  //Salvo dto
  public Map<String, Object> makeDTO() {
    Map<String, Object> dto = new LinkedHashMap<String, Object>();
    dto.put("turn", this.getTurnNumber());
    dto.put("playerId", this.getGamePlayer().getPlayer().getId());
    dto.put("locations", this.getSalvoLocation());
    return dto;
  }
}
