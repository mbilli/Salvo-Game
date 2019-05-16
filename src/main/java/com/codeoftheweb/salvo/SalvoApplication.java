package com.codeoftheweb.salvo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;

@SpringBootApplication
public class SalvoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SalvoApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(PlayerRepository playerRepository, GameRepository gameRepository, GamePlayerRepository gpRepository, ShipRepository shipRepository) {
		return (args) -> {
			// save a couple of Players
			Player player1 = playerRepository.save(new Player("Jack", "Bauer", "j.bauer@ctu.gov"));
			Player player2 = playerRepository.save(new Player("Chloe", "O'Brian", "c.obrian@ctu.gov"));
			Player player3 = playerRepository.save(new Player("Kim", "Bauer", "kim_bauer@gmail.com"));
			Player player4 = playerRepository.save(new Player("Tony", "Almeida", "t.almeida@ctu.gov"));

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
			GamePlayer gameplayer1 = new GamePlayer(player1, game1);
			GamePlayer gameplayer2 = new GamePlayer(player2, game1);
			GamePlayer gameplayer3 = new GamePlayer(player1, game2);
			GamePlayer gameplayer4 = new GamePlayer(player2, game2);
			GamePlayer gameplayer5 = new GamePlayer(player2, game3);
			GamePlayer gameplayer6 = new GamePlayer(player4, game3);
			GamePlayer gameplayer7 = new GamePlayer(player2, game4);
			GamePlayer gameplayer8 = new GamePlayer(player1, game4);
			GamePlayer gameplayer9 = new GamePlayer(player4, game5);
			GamePlayer gameplayer10 = new GamePlayer(player1, game5);
			GamePlayer gameplayer11 = new GamePlayer(player3, game6);
			GamePlayer gameplayer12 = new GamePlayer(player4, game7);
			GamePlayer gameplayer13 = new GamePlayer(player3, game8);
			GamePlayer gameplayer14 = new GamePlayer(player4, game8);

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
		};
	}
}
