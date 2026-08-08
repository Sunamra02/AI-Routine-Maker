package com.fsp.arm;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fsp.arm.dto.User;

@RestController
public class Controller {
	@GetMapping("/")
	public String handleGet() {
		return "Hello World my name is Sunamra";
	}

	@PostMapping("/")
	public String handlePost(@RequestBody User user){
		return "Okay";
	}
}
