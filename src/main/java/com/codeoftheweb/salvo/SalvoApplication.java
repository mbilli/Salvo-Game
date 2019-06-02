package com.codeoftheweb.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;

@SpringBootApplication
public class SalvoApplication {

  public static void main(String[] args) {
    SpringApplication.run(SalvoApplication.class, args);
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
  }

  @Bean
  public CommandLineRunner initData(PlayerRepository playerRepository, GameRepository gameRepository,
                                    GamePlayerRepository gpRepository, ShipRepository shipRepository,
                                    SalvoRepository salvoRepository, ScoreRepository scoreRepository) {
    return (args) -> {
      // save a couple of Players
      Player jBauer = playerRepository.save(new Player("Jack", "Bauer", "j.bauer@ctu.gov", passwordEncoder().encode("24")));
      Player cObrian = playerRepository.save(new Player("Chloe", "O'Brian", "c.obrian@ctu.gov", passwordEncoder().encode("42")));
      Player kBauer = playerRepository.save(new Player("Kim", "Bauer", "kim_bauer@gmail.com", passwordEncoder().encode("kb")));
      Player tAlmeida = playerRepository.save(new Player("Tony", "Almeida", "t.almeida@ctu.gov", passwordEncoder().encode("mole")));

      // save a couple of Games
      Game game1 = gameRepository.save(new Game());
      Game game2 = gameRepository.save(new Game(LocalDateTime.now().plusHours(1)));
      Game game3 = gameRepository.save(new Game(LocalDateTime.now().plusHours(2)));
      Game game4 = gameRepository.save(new Game(LocalDateTime.now().plusHours(3)));
      Game game5 = gameRepository.save(new Game(LocalDateTime.now().plusHours(4)));
      Game game6 = gameRepository.save(new Game(LocalDateTime.now().plusHours(5)));
      Game game7 = gameRepository.save(new Game(LocalDateTime.now().plusHours(6)));
      Game game8 = gameRepository.save(new Game(LocalDateTime.now().plusHours(7)));

      // Bind players to Games
      GamePlayer gameplayer1 = new GamePlayer(jBauer, game1);
      GamePlayer gameplayer2 = new GamePlayer(cObrian, game1);
      GamePlayer gameplayer3 = new GamePlayer(jBauer, game2);
      GamePlayer gameplayer4 = new GamePlayer(cObrian, game2);
      GamePlayer gameplayer5 = new GamePlayer(cObrian, game3);
      GamePlayer gameplayer6 = new GamePlayer(tAlmeida, game3);
      GamePlayer gameplayer7 = new GamePlayer(cObrian, game4);
      GamePlayer gameplayer8 = new GamePlayer(jBauer, game4);
      GamePlayer gameplayer9 = new GamePlayer(tAlmeida, game5);
      GamePlayer gameplayer10 = new GamePlayer(jBauer, game5);
      GamePlayer gameplayer11 = new GamePlayer(kBauer, game6);
      GamePlayer gameplayer12 = new GamePlayer(tAlmeida, game7);
      GamePlayer gameplayer13 = new GamePlayer(kBauer, game8);
      GamePlayer gameplayer14 = new GamePlayer(tAlmeida, game8);

      // Create some Ships
      Ship ship1 = new Ship("Destroyer", Arrays.asList("H2", "H3", "H4"));
      Ship ship2 = new Ship("Submarine", Arrays.asList("E1", "F1", "G1"));
      Ship ship3 = new Ship("Patrol Boat", Arrays.asList("B4", "B5"));
      Ship ship4 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
      Ship ship5 = new Ship("Patrol Boat", Arrays.asList("F1", "F2"));
      Ship ship6 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
      Ship ship7 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
      Ship ship8 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
      Ship ship9 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));
      Ship ship10 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
      Ship ship11 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
      Ship ship12 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
      Ship ship13 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));
      Ship ship14 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
      Ship ship15 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
      Ship ship16 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
      Ship ship17 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));
      Ship ship18 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D52"));
      Ship ship19 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
      Ship ship20 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
      Ship ship21 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));
      Ship ship22 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
      Ship ship23 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
      Ship ship24 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
      Ship ship25 = new Ship("Patrol Boat", Arrays.asList("C62", "C7"));
      Ship ship26 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
      Ship ship27 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));

      // Add ships to Gameplayers
      gameplayer1.addShip(ship1);
      gameplayer1.addShip(ship2);
      gameplayer1.addShip(ship3);
      gameplayer2.addShip(ship4);
      gameplayer2.addShip(ship5);
      gameplayer3.addShip(ship6);
      gameplayer3.addShip(ship7);
      gameplayer4.addShip(ship8);
      gameplayer4.addShip(ship9);
      gameplayer5.addShip(ship10);
      gameplayer5.addShip(ship11);
      gameplayer6.addShip(ship12);
      gameplayer6.addShip(ship13);
      gameplayer7.addShip(ship14);
      gameplayer7.addShip(ship15);
      gameplayer8.addShip(ship16);
      gameplayer8.addShip(ship17);
      gameplayer9.addShip(ship18);
      gameplayer9.addShip(ship19);
      gameplayer10.addShip(ship20);
      gameplayer10.addShip(ship21);
      gameplayer11.addShip(ship22);
      gameplayer11.addShip(ship23);
      gameplayer12.addShip(ship24);
      gameplayer12.addShip(ship25);
      gameplayer13.addShip(ship26);
      gameplayer13.addShip(ship27);

      // create Salvoes
      Salvo salvo1 = new Salvo(1, Arrays.asList("B5", "C5", "F1"));
      Salvo salvo2 = new Salvo(1, Arrays.asList("B4", "C5", "B6"));
      Salvo salvo3 = new Salvo(2, Arrays.asList("F2", "D5"));
      Salvo salvo4 = new Salvo(2, Arrays.asList("E1", "H3", "A2"));
      Salvo salvo5 = new Salvo(1, Arrays.asList("A2", "A4", "G6"));
      Salvo salvo6 = new Salvo(1, Arrays.asList("B5", "D5", "C7"));
      Salvo salvo7 = new Salvo(2, Arrays.asList("A3", "H6"));
      Salvo salvo8 = new Salvo(2, Arrays.asList("C5", "C6"));
      Salvo salvo9 = new Salvo(1, Arrays.asList("G6", "H6", "A4"));
      Salvo salvo10 = new Salvo(1, Arrays.asList("H1", "H2", "H3"));
      Salvo salvo11 = new Salvo(2, Arrays.asList("A2", "A3", "D8"));
      Salvo salvo12 = new Salvo(2, Arrays.asList("E1", "F2", "G3"));
      Salvo salvo13 = new Salvo(1, Arrays.asList("A3", "A4", "F7"));
      Salvo salvo14 = new Salvo(1, Arrays.asList("B5", "C6", "H1"));
      Salvo salvo15 = new Salvo(2, Arrays.asList("A2", "G6", "H6"));
      Salvo salvo16 = new Salvo(2, Arrays.asList("C5", "C7", "D5"));
      Salvo salvo17 = new Salvo(1, Arrays.asList("A1", "A2", "A3"));
      Salvo salvo18 = new Salvo(1, Arrays.asList("B5", "B6", "C7"));
      Salvo salvo19 = new Salvo(2, Arrays.asList("G6", "G7", "G8"));
      Salvo salvo20 = new Salvo(2, Arrays.asList("C6", "D6", "E6"));
      Salvo salvo21 = new Salvo(1, Arrays.asList("H1", "H8"));

      // Add salvoes to Gameplayers
      gameplayer1.addSalvo(salvo1);
      gameplayer2.addSalvo(salvo2);
      gameplayer1.addSalvo(salvo3);
      gameplayer2.addSalvo(salvo4);
      gameplayer3.addSalvo(salvo5);
      gameplayer4.addSalvo(salvo6);
      gameplayer3.addSalvo(salvo7);
      gameplayer4.addSalvo(salvo8);
      gameplayer5.addSalvo(salvo9);
      gameplayer6.addSalvo(salvo10);
      gameplayer5.addSalvo(salvo11);
      gameplayer6.addSalvo(salvo12);
      gameplayer7.addSalvo(salvo13);
      gameplayer8.addSalvo(salvo14);
      gameplayer7.addSalvo(salvo15);
      gameplayer8.addSalvo(salvo16);
      gameplayer9.addSalvo(salvo17);
      gameplayer10.addSalvo(salvo18);
      gameplayer9.addSalvo(salvo19);
      gameplayer10.addSalvo(salvo20);
      gameplayer10.addSalvo(salvo21);

      // Save gameplayer
      gpRepository.save(gameplayer1);
      gpRepository.save(gameplayer2);
      gpRepository.save(gameplayer3);
      gpRepository.save(gameplayer4);
      gpRepository.save(gameplayer5);
      gpRepository.save(gameplayer6);
      gpRepository.save(gameplayer7);
      gpRepository.save(gameplayer8);
      gpRepository.save(gameplayer9);
      gpRepository.save(gameplayer10);
      gpRepository.save(gameplayer11);
      gpRepository.save(gameplayer12);
      gpRepository.save(gameplayer13);
      gpRepository.save(gameplayer14);

      // Save Scores
      Score score1 = scoreRepository.save(new Score(jBauer, game1, 1));
      Score score2 = scoreRepository.save(new Score(cObrian, game1, 0));
      Score score3 = scoreRepository.save(new Score(jBauer, game2, 0.5));
      Score score4 = scoreRepository.save(new Score(cObrian, game2, 0.5));
      Score score5 = scoreRepository.save(new Score(cObrian, game3, 1.0));
      Score score6 = scoreRepository.save(new Score(tAlmeida, game3, 0));
      Score score7 = scoreRepository.save(new Score(cObrian, game4, 0.5));
      Score score8 = scoreRepository.save(new Score(jBauer, game4, 0.5));
    };
  }
}

@Configuration
class WebSecurityConfiguration extends GlobalAuthenticationConfigurerAdapter {

  @Autowired
  PlayerRepository playerRepository;

  @Autowired
  PasswordEncoder passwordEncoder;

  @Override
  public void init(AuthenticationManagerBuilder auth) throws Exception {
    auth.userDetailsService(inputName -> {
      Player player = playerRepository.findByUserName(inputName);
      if (player != null) {
        return new User(player.getUserName(), player.getPassword(),
                AuthorityUtils.createAuthorityList("PLAYER"));
      } else {
        throw new UsernameNotFoundException("Unknown user: " + inputName);
      }
    }).passwordEncoder(passwordEncoder);
  }
}

@Configuration
@EnableWebSecurity
class WebSecurityConfig extends WebSecurityConfigurerAdapter {
  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests()
            .antMatchers("/web/games.html", "/api/games", "/web/scripts/games.js",
                    "/web/styles/style.css", "/api/players", "/web/images/reload.png").permitAll()
            .anyRequest().authenticated();

    http.formLogin()
            .usernameParameter("username")
            .passwordParameter("password")
            .loginPage("/api/login")
            .permitAll();

    http.logout().logoutUrl("/api/logout");

    // turn off checking for CSRF tokens
    http.csrf().disable();

    // if user is not authenticated, just send an authentication failure response
    http.exceptionHandling().authenticationEntryPoint((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

    // if login is successful, just clear the flags asking for authentication
    http.formLogin().successHandler((req, res, auth) -> clearAuthenticationAttributes(req));

    // if login fails, just send an authentication failure response
    http.formLogin().failureHandler((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

    // if logout is successful, just send a success response
    http.logout().logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler());
  }

  private void clearAuthenticationAttributes(HttpServletRequest request) {
    HttpSession session = request.getSession(false);
    if (session != null) {
      session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
    }
  }
}
