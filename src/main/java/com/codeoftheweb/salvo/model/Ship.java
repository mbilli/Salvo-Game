package com.codeoftheweb.salvo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.*;

@Entity
public class Ship {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
  @GenericGenerator(name = "native", strategy = "native")
  private long id;
  private String shipType;

  @ElementCollection
  @Column(name="ship_location")
  private List<String> shipLocation = new ArrayList<>();

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name="game_player_id")
  private GamePlayer gamePlayer;

  // Constructors
  public Ship() {}

  public Ship(String shipType, List<String> shipLocation) {
    this.shipType = shipType;
    this.shipLocation = shipLocation;
  }

  // getters and setters
  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public String getShipType() {
    return shipType;
  }

  public void setShipType(String shipType) {
    this.shipType = shipType;
  }

  @JsonIgnore
  public GamePlayer getGamePlayer() {
    return gamePlayer;
  }

  public void setGamePlayer(GamePlayer gamePlayer) {
    this.gamePlayer = gamePlayer;
  }

  public List<String> getShipLocation() {
    return shipLocation;
  }

  public void setShipLocation(List<String> shipLocation) {
    this.shipLocation = shipLocation;
  }

  // Ship DTO
  public Map<String, Object> makeDTO() {
    Map<String, Object> dto = new LinkedHashMap<String, Object>();
    dto.put("type", this.getShipType());
    dto.put("locations", this.getShipLocation());
    return dto;
  }
}
