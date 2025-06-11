package com.chess.repository;

import com.chess.model.GameRequestEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameRequestRepository extends MongoRepository<GameRequestEntity, String> {
}