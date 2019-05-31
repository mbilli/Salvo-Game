package com.codeoftheweb.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import static java.util.stream.Collectors.toList;

@RestController
@RequestMapping("/api")
public class SalvoController {

  @Autowired
  private GameRepository gameRepository;

  @Autowired
  PasswordEncoder passwordencoder;

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

  @RequestMapping(path = "/players", method = RequestMethod.POST)
  public ResponseEntity<Map<String, Object>> createPlayer(@RequestParam String username, @RequestParam String password) {
    if (username.isEmpty()) {
      return new ResponseEntity<>(makeMap("error", "No name"), HttpStatus.FORBIDDEN);
    }
    Player player = playerRepository.findByUserName(username);
    if (player != null) {
      return new ResponseEntity<>(makeMap("error", "Username in use"), HttpStatus.FORBIDDEN);
    }
    Player newPlayer = playerRepository.save(new Player(username, passwordencoder.encode(password)));
    return new ResponseEntity<>(makeMap("username", newPlayer.getUserName()), HttpStatus.CREATED);
  }

  // Crea y devuelve un map con los parámetros indicados
  private Map<String, Object> makeMap(String key, Object value) {
    Map<String, Object> map = new HashMap<>();
    map.put(key, value);
    return map;
  }

  // Indica si el usuario no ingreso al sistema
  private boolean isGuest(Authentication authentication) {
    return authentication == null || authentication instanceof AnonymousAuthenticationToken;
  }
}
