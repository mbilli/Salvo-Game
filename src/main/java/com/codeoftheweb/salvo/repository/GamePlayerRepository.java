package com.codeoftheweb.salvo.repository;

import java.time.LocalDateTime;
import java.util.List;

import com.codeoftheweb.salvo.model.GamePlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
public interface GamePlayerRepository extends JpaRepository<GamePlayer, Long> {
    List<GamePlayer> findByCreationDate(LocalDateTime creationDate);
}