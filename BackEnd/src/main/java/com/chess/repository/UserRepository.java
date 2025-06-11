package com.chess.repository;

import com.chess.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    
    @Query(value = "{ 'email': { $ne: ?0 } }", fields = "{ 'email': 1, '_id': 0 }")
    List<User> findAllEmailsExcept(String email);
}