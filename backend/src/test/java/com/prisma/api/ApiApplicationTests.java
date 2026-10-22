package com.prisma.api;

import com.prisma.api.support.LocalPostgresTest;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ApiApplicationTests extends LocalPostgresTest {

	@Test
	void contextLoads() {
		assertThat(jdbc.queryForObject("SELECT count(*) FROM flyway_schema_history WHERE success", Integer.class))
				.isGreaterThanOrEqualTo(1);
	}

}
