package com.twelveaxes.model;

import java.util.List;

/**
 * Entrada de data/glossary.json (e do overlay i18n/en/glossary.json).
 *
 * @param match trechos do texto da pergunta que acionam o termo; vazio quando o idioma não usa o termo
 */
public record GlossaryEntry(
        String id,
        String term,
        String definition,
        List<String> match
) {
    public GlossaryEntry {
        match = match == null ? List.of() : List.copyOf(match);
    }
}
