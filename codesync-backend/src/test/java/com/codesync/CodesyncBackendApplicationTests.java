package com.codesync;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requires live PostgreSQL & Redis instances; verified in CI/ECS environment")
class CodesyncBackendApplicationTests {

    @Test
    void contextLoads() {
    }

}
