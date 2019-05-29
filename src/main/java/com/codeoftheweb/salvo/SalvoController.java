package com.codeoftheweb.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.util.stream.Collectors.toList;

@RestController
@RequestMapping("/api")
public class SalvoController {

  @Autowired
  private GameRepository gameRepository;

  @Autowired
  private GamePlayerRepository gamePlayerRepository;

  @RequestMapping("/games")
  public List<Map<String, Object>> getApiGames() {
    return gameRepository
            .findAll()
            .stream()
            .map(Game::makeDTO)
            .collect(toList());
  }

  @RequestMapping("/game_view/{gamePlayerId}")
  public Map<String, Object> getApiGameView(@PathVariable Long gamePlayerId) {
    GamePlayer gamePlayer = gamePlayerRepository.findById(gamePlayerId).orElse(null);
    return gamePlayer.makeDTOGameView();
  }
}
