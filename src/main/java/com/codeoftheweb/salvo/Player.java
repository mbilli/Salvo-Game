package com.codeoftheweb.salvo;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.util.stream.Collectors.toList;

@Entity
public class Player {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
  @GenericGenerator(name = "native", strategy = "native")
  private long id;
  private String firstName;
  private String lastName;
  private String userName;

  @OneToMany(mappedBy = "player", fetch = FetchType.EAGER)
  private Set<GamePlayer> gamePlayers;

  public Player() {
  }

  public Player(String first, String last, String userName) {
    this.firstName = first;
    this.lastName = last;
    this.userName = userName;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getUserName() {
    return this.userName;
  }

  public long getId() {
    return this.id;
  }

  public void setUserName(String userName) {
    this.userName = userName;
  }

  public List<Game> getGames() {
    return gamePlayers.stream().map(GamePlayer::getGame).collect(toList());
  }

  public String toString() {
    return firstName + " " + lastName;
  }

  // Player DTO
  public Map<String, Object> makeDTO() {
    Map<String, Object> dto = new LinkedHashMap<String, Object>();
    dto.put("playerId", this.id);
    dto.put("email", this.getUserName());
    return dto;
  }
}
