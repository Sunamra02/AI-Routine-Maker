package com.example.airoutinemaker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Application Class for AI Routine Maker Backend.
 * Starts the Spring Boot embedded Tomcat server on port 8080.
 */
@SpringBootApplication
public class AiRoutineMakerApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiRoutineMakerApplication.class, args);
    }
}
