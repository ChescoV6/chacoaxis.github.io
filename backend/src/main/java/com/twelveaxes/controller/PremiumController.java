package com.twelveaxes.controller;

import com.twelveaxes.model.AxisResult;
import com.twelveaxes.model.PremiumReport;
import com.twelveaxes.model.PremiumRequest;
import com.twelveaxes.model.ResultRequest;
import com.twelveaxes.payment.EntitlementToken;
import com.twelveaxes.service.AxisValuesParser;
import com.twelveaxes.service.PremiumReportService;
import com.twelveaxes.service.QuizDataService;
import com.twelveaxes.service.ReligionFilter;
import com.twelveaxes.service.ScoringService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Relatorio Completo: recebe as mesmas respostas do quiz, recalcula o resultado e entrega o relatorio.
 * Sem paywall: aberto a todos, sem pagamento nem token de acesso.
 */
@RestController
public class PremiumController {

    private final PremiumReportService premiumReportService;
    private final ScoringService scoringService;

    public PremiumController(
            PremiumReportService premiumReportService,
            ScoringService scoringService
    ) {
        this.premiumReportService = premiumReportService;
        this.scoringService = scoringService;
    }

    @PostMapping("/api/premium/report")
    public PremiumReport report(
            @Valid @RequestBody PremiumRequest request,
            @RequestParam(defaultValue = QuizDataService.LANG_PT) String lang,
            @RequestParam(required = false) String religion
    ) {
        List<Double> values = AxisValuesParser.parse(request.v());
        List<AxisResult> axes = scoringService.scoreFromLeftPercents(values, lang);

        String normalizedReligion = ReligionFilter.normalize(religion);
        if (request.answers() == null || request.answers().isEmpty()) {
            return premiumReportService.report(axes, lang, normalizedReligion);
        }
        // Com respostas, elas precisam produzir exatamente estes 12 valores: o relatorio de um resultado nao
        // mostra o que pesou nas respostas de outro.
        ResultRequest answers = new ResultRequest(request.answers(), "short", request.archetype());
        List<Double> fromAnswers = scoringService.score(answers, lang).stream().map(AxisResult::leftPercent).toList();
        if (!EntitlementToken.hashOf(fromAnswers).equals(EntitlementToken.hashOf(values))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "As respostas nao correspondem ao resultado informado");
        }
        return premiumReportService.report(answers, lang, normalizedReligion);
    }
}
