package com.twelveaxes.model;

/**
 * Termo do glossário a sublinhar numa pergunta.
 *
 * @param start      início do trecho no texto da pergunta (inclusive)
 * @param end        fim do trecho no texto da pergunta (exclusive)
 * @param term       nome do termo
 * @param definition definição curta exibida no tooltip
 */
public record QuestionTerm(int start, int end, String term, String definition) {
}
