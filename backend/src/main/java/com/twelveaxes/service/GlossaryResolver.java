package com.twelveaxes.service;

import com.twelveaxes.model.GlossaryEntry;
import com.twelveaxes.model.Question;
import com.twelveaxes.model.QuestionTerm;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Procura os termos do glossário no texto de cada pergunta.
 * Cada termo aparece uma vez por pergunta (primeira ocorrência) e, quando dois trechos
 * se sobrepõem, vence o mais longo.
 */
public final class GlossaryResolver {
    private GlossaryResolver() {}

    private record Candidate(Pattern pattern, int length, GlossaryEntry entry) {}

    public static List<Question> attach(List<Question> questions, List<GlossaryEntry> glossary, String source) {
        validate(glossary, source);
        List<Candidate> candidates = glossary.stream()
                .flatMap(entry -> entry.match().stream().map(match -> new Candidate(compile(match), match.length(), entry)))
                .sorted(Comparator.comparingInt(Candidate::length).reversed())
                .toList();
        return questions.stream().map(question -> question.withTerms(find(question.text(), candidates))).toList();
    }

    private static List<QuestionTerm> find(String text, List<Candidate> candidates) {
        List<QuestionTerm> found = new ArrayList<>();
        Set<String> usedEntries = new HashSet<>();
        for (Candidate candidate : candidates) {
            if (usedEntries.contains(candidate.entry().id())) {
                continue;
            }
            Matcher matcher = candidate.pattern().matcher(text);
            while (matcher.find()) {
                if (overlaps(found, matcher.start(), matcher.end())) {
                    continue;
                }
                found.add(new QuestionTerm(matcher.start(), matcher.end(), candidate.entry().term(), candidate.entry().definition()));
                usedEntries.add(candidate.entry().id());
                break;
            }
        }
        found.sort(Comparator.comparingInt(QuestionTerm::start));
        return found;
    }

    private static boolean overlaps(List<QuestionTerm> found, int start, int end) {
        return found.stream().anyMatch(term -> start < term.end() && term.start() < end);
    }

    // Só casa palavra inteira: "IA" não pode sublinhar o meio de "ideia".
    private static Pattern compile(String match) {
        return Pattern.compile(
                "(?<![\\p{L}\\p{N}])" + Pattern.quote(match) + "(?![\\p{L}\\p{N}])",
                Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
        );
    }

    private static void validate(List<GlossaryEntry> glossary, String source) {
        Set<String> ids = new HashSet<>();
        for (GlossaryEntry entry : glossary) {
            if (entry.id() == null || entry.id().isBlank() || !ids.add(entry.id())) {
                throw new IllegalStateException(source + ": id de glossário vazio ou duplicado: " + entry.id());
            }
            if (isBlank(entry.term()) || isBlank(entry.definition())) {
                throw new IllegalStateException(source + ": termo de glossário incompleto: " + entry.id());
            }
            if (entry.match().stream().anyMatch(GlossaryResolver::isBlank)) {
                throw new IllegalStateException(source + ": trecho vazio em " + entry.id());
            }
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
