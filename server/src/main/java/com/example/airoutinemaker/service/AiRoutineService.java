package com.example.airoutinemaker.service;

import com.example.airoutinemaker.dto.*;
// import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AiRoutineService {

    private static final Logger logger = LoggerFactory.getLogger(AiRoutineService.class);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AiRoutineService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Call Groq AI API to suggest 3 routine options based on student preferences.
     */
    public AiRoutineSuggestResponse suggestRoutines(AiRoutineSuggestRequest request) {
        validateApiKey();

        String systemPrompt = """
                You are an expert student daily-routine planner AI.
                Based on the student's inputs, suggest exactly 3 realistic, distinct daily routine options.
                Return ONLY raw JSON with no Markdown formatting, code fences, or explanation text.
                JSON structure MUST be:
                {
                  "options": [
                    {
                      "id": "option_1",
                      "title": "Short Title",
                      "description": "Clear 1-2 sentence description of routine strategy.",
                      "focusStyle": "Morning Focused / Balanced / Intensive Revision"
                    }
                  ]
                }
                """;

        String userPrompt = String.format(
                "Student Goal: %s\nAvailable Hours: %d\nWake-up Time: %s\nSleep Time: %s\nDifficulty/Pace: %s",
                request.getGoal(),
                request.getAvailableHours() != null ? request.getAvailableHours() : 6,
                request.getWakeUpTime() != null ? request.getWakeUpTime().toString() : "07:00",
                request.getSleepTime() != null ? request.getSleepTime().toString() : "23:00",
                request.getDifficulty() != null ? request.getDifficulty() : "Intermediate");

        String jsonResponse = callGroqApi(systemPrompt, userPrompt);
        return parseRoutineSuggestions(jsonResponse);
    }

    /**
     * Call Groq AI API to suggest detailed task breakdown for chosen routine
     * option.
     */
    public AiTaskSuggestResponse suggestTasks(AiTaskSuggestRequest request) {
        validateApiKey();

        String systemPrompt = """
                You are an expert student daily-routine planner AI.
                Generate a realistic, achievable, non-overlapping task schedule for the student's routine.
                Keep all tasks strictly between wake-up time and sleep time.
                Return ONLY raw JSON with no Markdown formatting, code fences, or explanation text.
                JSON structure MUST be:
                {
                  "tasks": [
                    {
                      "time": "HH:mm",
                      "activity": "Clear activity description",
                      "duration": 45
                    }
                  ]
                }
                Constraints:
                - Use valid 24-hour HH:mm time formats.
                - Duration must be positive integer minutes (10 to 120).
                - Generate 5 to 9 structured daily tasks (exercise, meals, study sessions, breaks, review).
                - No duplicate tasks or overlapping times.
                - Do NOT include dangerous, medical, or extreme advice.
                """;

        String userPrompt = String.format(
                "Goal: %s\nRoutine Style: %s\nRoutine Description: %s\nAvailable Study Hours: %d\nWake Time: %s\nSleep Time: %s\nPace: %s",
                request.getGoal(),
                request.getSelectedRoutineTitle() != null ? request.getSelectedRoutineTitle() : "Balanced Schedule",
                request.getSelectedRoutineDescription() != null ? request.getSelectedRoutineDescription()
                        : "Balanced focus across the day",
                request.getAvailableHours() != null ? request.getAvailableHours() : 6,
                request.getWakeUpTime() != null ? request.getWakeUpTime().toString() : "07:00",
                request.getSleepTime() != null ? request.getSleepTime().toString() : "23:00",
                request.getDifficulty() != null ? request.getDifficulty() : "Intermediate");

        String jsonResponse = callGroqApi(systemPrompt, userPrompt);
        return parseAndValidateTasks(jsonResponse, request.getWakeUpTime(), request.getSleepTime());
    }

    private void validateApiKey() {
        if (groqApiKey == null || groqApiKey.trim().isEmpty() || groqApiKey.startsWith("${")) {
            throw new IllegalStateException("Groq API key is missing or not configured in environment (GROQ_API_KEY).");
        }
    }

    /**
     * Executes POST request to Groq OpenAI-compatible Chat Completions API.
     */
    private String callGroqApi(String systemPrompt, String userPrompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey.trim());

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", groqModel);
            requestBody.put("temperature", 0.6);
            requestBody.put("response_format", Map.of("type", "json_object"));

            List<Map<String, String>> messages = List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt));
            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(groqApiUrl, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Groq API call returned HTTP " + response.getStatusCode());
            }

            // System.out.println("Groq API Response: " + response.getBody()); // Debugging
            // output

            // Extract completion message content from response
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode contentNode = root.path("choices").get(0).path("message").path("content");
            if (contentNode.isMissingNode()) {
                throw new RuntimeException("Unexpected Groq API response structure.");
            }

            return cleanJsonText(contentNode.asText());
        } catch (Exception e) {
            logger.error("Error communicating with Groq API: ", e);
            throw new RuntimeException("AI Service Error: " + e.getMessage(), e);
        }
    }

    /**
     * Remove markdown code block fences if returned by AI.
     */
    private String cleanJsonText(String rawText) {
        if (rawText == null)
            return "{}";
        String clean = rawText.trim();
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        return clean.trim();
    }

    /**
     * Parses and validates AI routine options.
     */
    private AiRoutineSuggestResponse parseRoutineSuggestions(String jsonText) {
        try {
            JsonNode root = objectMapper.readTree(jsonText);
            JsonNode optionsNode = root.path("options");
            List<AiRoutineOptionDTO> options = new ArrayList<>();

            if (optionsNode.isArray()) {
                for (JsonNode node : optionsNode) {
                    String id = node.path("id").asText("option_" + (options.size() + 1));
                    String title = node.path("title").asText("Custom Routine");
                    String description = node.path("description").asText("Personalized study routine.");
                    String focusStyle = node.path("focusStyle").asText("Balanced");

                    options.add(new AiRoutineOptionDTO(id, title, description, focusStyle));
                }
            }

            if (options.isEmpty()) {
                options.add(new AiRoutineOptionDTO("opt_1", "Balanced Routine",
                        "Steady study pace distributed throughout the day.", "Balanced"));
                options.add(new AiRoutineOptionDTO("opt_2", "Intensive Revision Routine",
                        "High focus sessions with targeted review.", "Intensive"));
                options.add(new AiRoutineOptionDTO("opt_3", "Morning Focus Routine",
                        "Heavy study load completed early in the day.", "Morning Focus"));
            }

            return new AiRoutineSuggestResponse(options);
        } catch (Exception e) {
            logger.error("Failed to parse AI routine options JSON", e);
            throw new RuntimeException("Invalid AI routine suggestions response format.", e);
        }
    }

    /**
     * Parses and strictly validates AI task list.
     */
    private AiTaskSuggestResponse parseAndValidateTasks(String jsonText, LocalTime wakeUpTime, LocalTime sleepTime) {
        try {
            JsonNode root = objectMapper.readTree(jsonText);
            JsonNode tasksNode = root.path("tasks");
            List<AiTaskDTO> validTasks = new ArrayList<>();

            LocalTime wake = wakeUpTime != null ? wakeUpTime : LocalTime.of(7, 0);
            // LocalTime sleep = sleepTime != null ? sleepTime : LocalTime.of(23, 0);

            if (tasksNode.isArray()) {
                for (JsonNode node : tasksNode) {
                    String timeStr = node.path("time").asText("");
                    String activity = node.path("activity").asText("Scheduled Task");
                    int duration = node.path("duration").asInt(30);

                    // Validate Time Format
                    LocalTime parsedTime;
                    try {
                        parsedTime = LocalTime.parse(timeStr.trim(), TIME_FORMATTER);
                    } catch (Exception e) {
                        parsedTime = wake;
                    }

                    // Validate Duration
                    if (duration <= 0)
                        duration = 30;
                    if (duration > 180)
                        duration = 120;

                    validTasks.add(new AiTaskDTO(parsedTime.format(TIME_FORMATTER), activity.trim(), duration));

                    // if (validTasks.size() >= 12) break; // Limit to maximum 12 tasks
                }
            }

            if (validTasks.isEmpty()) {
                throw new RuntimeException("No valid tasks found in AI response.");
            }

            return new AiTaskSuggestResponse(validTasks);
        } catch (Exception e) {
            logger.error("Failed to parse AI tasks JSON", e);
            throw new RuntimeException("Invalid AI task suggestions response format.", e);
        }
    }
}
