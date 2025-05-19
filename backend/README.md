<p align="center">
  <a href="https://spring.io/projects/spring-boot" target="blank"><img src="https://avatars.githubusercontent.com/u/317776?s=200&v=4" width="200" alt="Spring Boot Logo" /></a>
</p>

# AiRing Backend

Spring Boot 기반으로 구축된 백엔드 애플리케이션입니다.

## 기술 스택

-   Java 17
-   Spring Boot 3.4.5
-   PostgreSQL 16
-   Docker

## 개발 환경 설정

### 1. 필수 요구사항

-   JDK 17
-   Docker
-   Docker Compose

### 2. 데이터베이스 설정

PostgreSQL은 Docker를 통해 실행됩니다.

```bash
# PostgreSQL 컨테이너 실행
docker-compose up -d

# 컨테이너 중지
docker-compose down

# 컨테이너 및 볼륨 삭제 (데이터 초기화)
docker-compose down -v
```

### 3. 데이터베이스 접속

```bash
# PostgreSQL 컨테이너 접속
docker exec -it airing-postgres psql -U postgres -d airing
```

### 4. 애플리케이션 실행

```bash
# 개발 서버 실행
./gradlew bootRun

# 빌드
./gradlew build

# 테스트
./gradlew test
```
