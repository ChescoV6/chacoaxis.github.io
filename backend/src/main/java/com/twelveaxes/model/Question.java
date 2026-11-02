package com.twelveaxes.model;

import java.util.List;

/**
 * @param terms termos do glossário encontrados no texto, em ordem de aparição (nunca nulo)
 * @param help  explicação do que significa concordar e discordar; null quando ainda não foi escrita
 */
public record Question(
        String id,
        String axisId,
        String text,
        Pole agreePole,
        double weight,
        List<QuestionTerm> terms,
        QuestionHelp help
) {
    public Question {
        terms = terms == null ? List.of() : List.copyOf(terms);
    }

    public Question withText(String newText) {
        return new Question(id, axisId, newText, agreePole, weight, terms, help);
    }

    public Question withTerms(List<QuestionTerm> newTerms) {
        return new Question(id, axisId, text, agreePole, weight, newTerms, help);
    }

    public Question withHelp(QuestionHelp newHelp) {
        return new Question(id, axisId, text, agreePole, weight, terms, newHelp);
    }
}
