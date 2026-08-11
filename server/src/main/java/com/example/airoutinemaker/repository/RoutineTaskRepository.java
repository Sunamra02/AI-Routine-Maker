package com.example.airoutinemaker.repository;

import com.example.airoutinemaker.model.RoutineTask;
import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

/**
 * RoutineTaskRepository Interface
 * Extends JpaRepository to provide standard CRUD database operations for RoutineTask entities.
 */
// @Repository
public interface RoutineTaskRepository extends JpaRepository<RoutineTask, Long> {
}
