package com.example.airoutinemaker.repository;

import com.example.airoutinemaker.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * RoutineRepository Interface
 * Extends JpaRepository to provide standard CRUD database operations for Routine entities.
 */
@Repository
public interface RoutineRepository extends JpaRepository<Routine, Long> {
}
