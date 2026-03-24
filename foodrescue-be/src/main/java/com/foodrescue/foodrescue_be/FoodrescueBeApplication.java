package com.foodrescue.foodrescue_be;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FoodrescueBeApplication {

	public static void main(String[] args) {
		SpringApplication.run(FoodrescueBeApplication.class, args);
	}

}
