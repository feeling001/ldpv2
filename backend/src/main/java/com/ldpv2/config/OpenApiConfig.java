package com.ldpv2.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ldpV2OpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("LDPv2 API")
                        .description("Lifecycle Data Platform v2 - Application Management API")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("LDPv2 Team")
                                .email("team@ldpv2.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://ldpv2.com/license")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
