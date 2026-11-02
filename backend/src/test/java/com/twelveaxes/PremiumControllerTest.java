package com.twelveaxes;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.twelveaxes.model.AnswerValue;
import com.twelveaxes.model.ResultRequest;
import com.twelveaxes.model.SubmittedAnswer;
import com.twelveaxes.service.QuizDataService;
import com.twelveaxes.service.ScoringService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** Relatorio Completo: aberto a todos, sem pagamento nem token de acesso. */
@SpringBootTest
@AutoConfigureMockMvc
class PremiumControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private QuizDataService dataService;

    @Autowired
    private ScoringService scoringService;

    private ResultRequest mixed() {
        return TestAnswers.mixed(dataService);
    }

    private ResultRequest neutral() {
        List<SubmittedAnswer> answers = dataService.getQuestions().stream()
                .map(question -> new SubmittedAnswer(question.id(), AnswerValue.NEUTRAL))
                .toList();
        return new ResultRequest(answers);
    }

    // Corpo do relatorio: os 12 valores (obrigatorio) e, opcionalmente, as respostas que os originaram.
    private String body(ResultRequest request, boolean withAnswers) throws Exception {
        String vector = scoringService.score(request, "pt").stream().map(axis -> String.valueOf(axis.leftPercent()))
                .collect(java.util.stream.Collectors.joining(","));
        java.util.Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("v", vector);
        if (withAnswers) {
            body.put("answers", request.answers());
        }
        return objectMapper.writeValueAsString(body);
    }

    private org.springframework.test.web.servlet.ResultActions report(ResultRequest request, String token) throws Exception {
        return reportWith(body(request, true), token);
    }

    private org.springframework.test.web.servlet.ResultActions reportWith(String json, String token) throws Exception {
        var builder = post("/api/premium/report")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json);
        if (token != null) {
            builder = builder.header("X-Entitlement", token);
        }
        return mockMvc.perform(builder);
    }

    @Test
    void returnsTheReportWithoutToken() throws Exception {
        report(mixed(), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.axisAnalysis.length()").value(12))
                .andExpect(jsonPath("$.topCountries.length()").value(10))
                .andExpect(jsonPath("$.idealGovernment.length()").value(9))
                .andExpect(jsonPath("$.disagreements.length()").value(3))
                .andExpect(jsonPath("$.ranking.ideologies").isNotEmpty())
                .andExpect(jsonPath("$.personalitiesByArea").isNotEmpty());
    }

    @Test
    void worksFromTheTwelveValuesAloneWithoutAnswers() throws Exception {
        reportWith(body(mixed(), false), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.axisAnalysis.length()").value(12))
                .andExpect(jsonPath("$.axisAnalysis[0].impacts.length()").value(0))
                .andExpect(jsonPath("$.axisAnalysis[0].text").isNotEmpty());
    }

    @Test
    void withAnswersTheAxisAnalysisCarriesTheImpacts() throws Exception {
        report(mixed(), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.axisAnalysis[0].impacts.length()").isNotEmpty());
    }

    @Test
    void rejectsAnswersThatDoNotProduceTheGivenVector() throws Exception {
        java.util.Map<String, Object> mismatch = new java.util.LinkedHashMap<>();
        mismatch.put("v", scoringService.score(mixed(), "pt").stream().map(axis -> String.valueOf(axis.leftPercent()))
                .collect(java.util.stream.Collectors.joining(",")));
        mismatch.put("answers", neutral().answers());

        reportWith(objectMapper.writeValueAsString(mismatch), null).andExpect(status().isBadRequest());
    }

    @Test
    void rejectsAMalformedVector() throws Exception {
        reportWith("{\"v\":\"1,2,3\"}", null).andExpect(status().isBadRequest());
        reportWith("{\"v\":\"a,b\"}", null).andExpect(status().isBadRequest());
        reportWith("{}", null).andExpect(status().isBadRequest());
    }

    @Test
    void anOldEntitlementHeaderIsIgnored() throws Exception {
        report(mixed(), "isto-nao-e-mais-um-token").andExpect(status().isOk());
    }

    @Test
    void theFreeResultNeverCarriesPaidFields() throws Exception {
        String vector = "65,32.5,50,40,30,60,70,50,45,55,35,80";

        mockMvc.perform(get("/api/results/by-axes").param("v", vector))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.axisAnalysis").doesNotExist())
                .andExpect(jsonPath("$.idealGovernment").doesNotExist())
                .andExpect(jsonPath("$.disagreements").doesNotExist())
                .andExpect(jsonPath("$.ranking").doesNotExist())
                .andExpect(jsonPath("$.personalitiesByArea").doesNotExist());
    }
}
