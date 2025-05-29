package com.airing.backend.common.logging;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class LoggingFilter implements Filter {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    // ANSI 색상 상수
    private static final String RESET = "\u001B[0m";
    private static final String RED = "\u001B[31m";
    private static final String GREEN = "\u001B[32m";
    private static final String YELLOW = "\u001B[33m";
    private static final String CYAN = "\u001B[36m";
    private static final String MAGENTA = "\u001B[35m";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (!(request instanceof HttpServletRequest) || !(response instanceof HttpServletResponse)) {
            chain.doFilter(request, response);
            return;
        }
        ContentCachingRequestWrapper req = new ContentCachingRequestWrapper((HttpServletRequest) request);
        ContentCachingResponseWrapper res = new ContentCachingResponseWrapper((HttpServletResponse) response);
        long start = System.currentTimeMillis();
        Exception ex = null;
        try {
            chain.doFilter(req, res);
            logRequest(req);
        } catch (Exception e) {
            ex = e;
            throw e;
        } finally {
            logResponse(res, System.currentTimeMillis() - start, ex);
            res.copyBodyToResponse();
        }
    }

    private void logRequest(ContentCachingRequestWrapper req) {
        try {
            Map<String, Object> logMap = new HashMap<>();
            logMap.put("method", req.getMethod());
            logMap.put("uri", req.getRequestURI());
            logMap.put("queryString", req.getQueryString());
            logMap.put("remoteAddr", req.getRemoteAddr());
            // 요청 헤더
            Map<String, String> reqHeaders = new HashMap<>();
            Enumeration<String> reqHeaderNames = req.getHeaderNames();
            while (reqHeaderNames.hasMoreElements()) {
                String name = reqHeaderNames.nextElement();
                reqHeaders.put(name, req.getHeader(name));
            }
            logMap.put("requestHeaders", reqHeaders);
            // 요청 본문
            String requestBody = getContentString(req.getContentAsByteArray(), req.getCharacterEncoding());
            logMap.put("requestBody", parseJsonOrRaw(requestBody));
            String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(logMap);
            log.info(CYAN + "[REQUEST]" + RESET + " {}", json);
        } catch (Exception e) {
            log.error("[LOGGING ERROR - REQUEST] {}", e.getMessage());
        }
    }

    private void logResponse(ContentCachingResponseWrapper res, long duration, Exception ex) {
        try {
            Map<String, Object> logMap = new HashMap<>();
            logMap.put("status", res.getStatus());
            logMap.put("durationMs", duration);
            // 응답 헤더
            Map<String, String> resHeaders = new HashMap<>();
            for (String name : res.getHeaderNames()) {
                resHeaders.put(name, res.getHeader(name));
            }
            logMap.put("responseHeaders", resHeaders);
            // 응답 본문
            String responseBody = getContentString(res.getContentAsByteArray(), res.getCharacterEncoding());
            logMap.put("responseBody", parseJsonOrRaw(responseBody));
            if (ex != null) {
                logMap.put("exception", ex.getMessage());
                String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(logMap);
                log.error(RED + "[EXCEPTION]" + RESET + " {}", json);
            } else if (res.getStatus() >= 400) {
                String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(logMap);
                log.error(RED + "[RESPONSE]" + RESET + " {}", json);
            } else {
                String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(logMap);
                log.info(GREEN + "[RESPONSE]" + RESET + " {}", json);
            }
        } catch (Exception e) {
            log.error("[LOGGING ERROR - RESPONSE] {}", e.getMessage());
        }
    }

    private String getContentString(byte[] buf, String encoding) {
        if (buf == null || buf.length == 0) return "";
        int maxLength = 4096; // 최대 4KB만 로깅
        int length = Math.min(buf.length, maxLength);
        try {
            String content = new String(buf, 0, length, encoding != null ? encoding : StandardCharsets.UTF_8.name());
            if (buf.length > maxLength) {
                content += "\n[Truncated: body too large]";
            }
            return content;
        } catch (Exception e) {
            return "[unreadable]";
        }
    }

    private Object parseJsonOrRaw(String content) {
        try {
            return objectMapper.readValue(content, Object.class);
        } catch (Exception e) {
            return content;
        }
    }
}
