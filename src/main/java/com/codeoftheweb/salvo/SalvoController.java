package com.codeoftheweb.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
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
  private PlayerRepository playerRepository;

  @Autowired
  private GamePlayerRepository gamePlayerRepository;

  @RequestMapping("/games")
  public Map<String, Object> getApiGames(Authentication authentication) {
    Map<String, Object> dto = new LinkedHashMap<String, Object>();
    if(isGuest(authentication)) {
      dto.put("player", null);
    } else {
      dto.put("player", playerRepository.findByUserName(authentication.getName()).makeDTO());
    }
    dto.put("games", gameRepository.findAll().stream().map(Game::makeDTO).collect(toList()));
    return dto;
  }

  @RequestMapping("/game_view/{gamePlayerId}")
  public Map<String, Object> getApiGameView(@PathVariable Long gamePlayerId) {
    GamePlayer gamePlayer = gamePlayerRepository.findById(gamePlayerId).orElse(null);
    return gamePlayer.makeDTOGameView();
  }

  private boolean isGuest(Authentication authentication) {
    return authentication == null || authentication instanceof AnonymousAuthenticationToken;
  }
}
