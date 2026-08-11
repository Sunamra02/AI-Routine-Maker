package com.example.airoutinemaker.repository;

import com.example.airoutinemaker.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

/**
 * RoutineRepository Interface
 * Extends JpaRepository to provide standard CRUD database operations for Routine entities.
 */
public interface RoutineRepository extends JpaRepository<Routine, Long> {
    List<Routine> findByUserId(Long userId);
    List<Routine> findByUserIdOrderByIdDesc(Long userId);
    Optional<Routine> findByIdAndUserId(Long id, Long userId);
    List<Routine> findByUserIdAndRoutineDateOrderByIdDesc(Long userId, LocalDate routineDate);
}
