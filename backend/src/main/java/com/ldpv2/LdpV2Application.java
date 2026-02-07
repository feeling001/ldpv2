package com.ldpv2;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main entry point for LDPv2 Backend Application
 * 
 * @author LDPv2 Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
public class LdpV2Application {

    public static void main(String[] args) {
        SpringApplication.run(LdpV2Application.class, args);
    }
}
