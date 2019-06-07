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

  @RequestMapping(value = "/games", method = RequestMethod.POST)
  public ResponseEntity<Map<String, Object>> createGame(Authentication authentication) {
    ResponseEntity messageResponse;
    if(isGuest(authentication)) {
      messageResponse = new ResponseEntity<>(makeMap("unauthorized", "You must be logged"), HttpStatus.UNAUTHORIZED);
    } else {
      Game game = gameRepository.save(new Game());
      Player player = playerRepository.findByUserName(authentication.getName());
      GamePlayer gameplayer = new GamePlayer(player, game);
      gamePlayerRepository.save(gameplayer);
      messageResponse = new ResponseEntity<>(makeMap("gamePlayerId", gameplayer.getId()), HttpStatus.CREATED);
    }
    return messageResponse;
  }

  @RequestMapping("/game_view/{gamePlayerId}")
  public ResponseEntity<Map<String, Object>> getApiGameView(@PathVariable Long gamePlayerId, Authentication authentication) {
    GamePlayer gamePlayer = gamePlayerRepository.findById(gamePlayerId).orElse(null);
    Player player = playerRepository.findByUserName(authentication.getName());
    ResponseEntity messageResponse;
    if(gamePlayer.getPlayer().getId() == player.getId()) {
      messageResponse = new ResponseEntity<>(gamePlayer.makeDTOGameView(), HttpStatus.OK);
    } else {
      messageResponse = new ResponseEntity<>(makeMap("unauthorized", "This is not your game"), HttpStatus.UNAUTHORIZED);
    }
    return messageResponse;
  }

  @RequestMapping(path = "/players", method = RequestMethod.POST)
  public ResponseEntity<Map<String, Object>> createPlayer(@RequestParam String username, @RequestParam String password) {
    ResponseEntity messageResponse;
    if (username.isEmpty() || password.isEmpty()) {
      messageResponse = new ResponseEntity<>(makeMap("error", "Username and Password is required"), HttpStatus.FORBIDDEN);
    } else {
      Player player = playerRepository.findByUserName(username);
      if (player != null) {
        messageResponse = new ResponseEntity<>(makeMap("error", "Username in use"), HttpStatus.FORBIDDEN);
      } else {
      Player newPlayer = playerRepository.save(new Player(username, passwordencoder.encode(password)));
      messageResponse = new ResponseEntity<>(makeMap("username", newPlayer.getUserName()), HttpStatus.CREATED);
    }
    }
    return messageResponse;
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
