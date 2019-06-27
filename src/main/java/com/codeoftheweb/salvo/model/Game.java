package com.codeoftheweb.salvo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.util.stream.Collectors.toList;

@Entity
public class Game {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
  @GenericGenerator(name = "native", strategy = "native")
  private long id;
  private LocalDateTime creationDate;

  @OneToMany(mappedBy = "game", fetch = FetchType.EAGER)
  private Set<GamePlayer> gamePlayers;

  @OneToMany(mappedBy = "game", fetch = FetchType.EAGER)
  private Set<Score> scores;

  public Game() {
    this.creationDate = LocalDateTime.now();
  }

  public Game(LocalDateTime creationDate) {
    this.creationDate = creationDate;
  }

  public LocalDateTime getCreationDate() {
    return creationDate;
  }

  public long getId() {
    return id;
  }

  public Set<GamePlayer> getGamePlayers() {
    return gamePlayers;
  }

  public Set<Score> getScores() {
    return scores;
  }

  public void setScores(Set<Score> scores) {
    this.scores = scores;
  }

  @JsonIgnore
  public List<Player> getPlayers() {
    return gamePlayers.stream().map(GamePlayer::getPlayer).collect(toList());
  }

  // Game DTO
  public Map<String, Object> makeDTO() {
    Map<String, Object> dto = new LinkedHashMap<String, Object>();
    dto.put("gameId", this.id);
    dto.put("created", this.getCreationDate());
    Score oneScore = this.getScores().stream().findFirst().orElse(null);
    LocalDateTime finishedDate = null;
    if (oneScore != null) {
      finishedDate = oneScore.getFinishDate();
    }
    dto.put("finished", finishedDate);
    dto.put("gamePlayers", this.gamePlayers.stream().map(GamePlayer::makeDTO));
    return dto;
  }
}
