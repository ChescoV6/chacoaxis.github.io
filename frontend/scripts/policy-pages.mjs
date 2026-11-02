// Páginas institucionais (/report, /terms, /privacy e /en/...): o que o resultado inclui, termos de uso e privacidade.
// Aparecem no rodapé do site.
// SUPPORT_EMAIL (variável de ambiente do build; padrão: o e-mail do projeto) é o contato publicado nas páginas; vazio, a página
// manda o pedido pela página de contato do projeto no GitHub, que é pública.
import { siteHeader } from './site-header.mjs';
import { IDEOLOGIES_CSS } from './ideologies-index.mjs';
import { catalogHead } from './personalities-index.mjs';

const SUPPORT_EMAIL = (process.env.SUPPORT_EMAIL ?? '12axes.quiz@gmail.com').trim();
const ISSUES_URL = 'https://github.com/RomanCypherpunk/12axes/issues/new';
const UPDATED = { pt: '1 de novembro de 2026', en: 'November 1, 2026' };

export const POLICY_SLUGS = ['report', 'terms', 'privacy'];

const contact = (isEn) =>
  SUPPORT_EMAIL
    ? isEn
      ? `by e-mail at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`
      : `por e-mail em <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`
    : isEn
      ? `through the <a href="${ISSUES_URL}">project contact page on GitHub</a>`
      : `pela <a href="${ISSUES_URL}">página de contato do projeto no GitHub</a>`;

// Cada página: título, resumo, e uma lista de seções [título, [parágrafos ou itens]]. Itens começando com "- " viram lista.
const PAGES = {
  pt: {
    report: (c) => ({
      title: 'Relatório Completo',
      lead: 'Tudo o que o resultado do quiz inclui — de graça e sem cadastro.',
      sections: [
        ['O que inclui', [
          '- <strong>Análise dos 12 eixos, um por um:</strong> o que a sua posição em cada eixo significa e o que mais pesou nas suas respostas.',
          '- <strong>Onde você mais discorda:</strong> da ideologia, da personalidade e do país mais próximos, eixo a eixo.',
          '- <strong>Seu governo ideal:</strong> nove cargos ocupados pelas figuras mais compatíveis com você.',
          '- <strong>Sua linha do tempo ideológica:</strong> os perfis mais próximos de cada era, da Antiguidade ao século XXI.',
          '- <strong>Para qual país se mudar:</strong> os 10 países atuais mais próximos dos seus ideais políticos.',
          '- <strong>Personalidades por área:</strong> a mais compatível com você em política, filosofia, economia e nas demais áreas.',
          '- <strong>Ranking completo, planilha e PDF:</strong> sua compatibilidade com todo o catálogo, para exportar para o Excel, e o relatório em PDF.'
        ]],
        ['Preço', ['Nada. O relatório completo faz parte do resultado: sem pagamento, assinatura ou cadastro.']],
        ['Como você recebe', ['O resultado é calculado no próprio navegador e fica no link da página. Você pode voltar a ele quando quiser, no mesmo navegador ou pelo link salvo.']],
        ['Dúvidas', [`Fale conosco ${c}.`]]
      ]
    }),
    terms: (c) => ({
      title: 'Termos de uso',
      lead: 'Regras de uso do 12 Axes.',
      sections: [
        ['O que é o 12 Axes', ['Quiz político independente e gratuito, que posiciona você em 12 eixos e o compara com ideologias, personalidades, países e partidos. É um conteúdo informativo e educativo: os resultados são aproximações e não representam a posição do autor nem aconselhamento de qualquer natureza.']],
        ['O resultado', ['O resultado inclui o relatório completo, os rankings, a exportação em CSV e o PDF, sem custo. Ele é calculado a partir das suas respostas e fica codificado no link da página.']],
        ['Uso do conteúdo', ['Você pode compartilhar seu resultado e usar as imagens geradas para fins pessoais. A reprodução do catálogo, dos textos ou do código deve seguir a licença do projeto.']],
        ['Mudanças', ['Estes termos podem mudar; a versão em vigor é a publicada nesta página, com a data de atualização.']],
        ['Contato', [`Dúvidas ${c}.`]]
      ]
    }),
    privacy: (c) => ({
      title: 'Política de privacidade',
      lead: 'Que dados o 12 Axes trata e para quê.',
      sections: [
        ['Respostas do quiz', ['As respostas são usadas só para calcular o resultado no momento em que você as envia. O 12 Axes não guarda respostas em banco de dados nem associa resultados a pessoas: o resultado fica codificado no endereço (link) da página.']],
        ['Armazenamento no seu navegador', ['O site guarda no seu navegador preferências (como idioma e tema) e o último resultado. Você pode apagar esses dados nas configurações do navegador.']],
        ['Análise de acesso', ['Usamos ferramentas de análise de tráfego, como o Google Analytics, para medir visitas e melhorar o site. Elas podem usar cookies e identificadores.']],
        ['Hospedagem', ['O site e a API usam provedores de infraestrutura (como Vercel, Cloudflare e Render) que processam os acessos para entregar o conteúdo.']],
        ['Seus direitos', [`Você pode pedir informação sobre dados pessoais tratados, correção ou eliminação, conforme a Lei Geral de Proteção de Dados (LGPD). Peça ${c}.`]]
      ]
    })
  },
  en: {
    report: (c) => ({
      title: 'Full Report',
      lead: 'Everything the quiz result includes — free, with no sign-up.',
      sections: [
        ['What is included', [
          '- <strong>Analysis of all 12 axes, one by one:</strong> what your position on each axis means and what weighed most in your answers.',
          '- <strong>Where you disagree most:</strong> with your closest ideology, figure and country, axis by axis.',
          '- <strong>Your ideal government:</strong> nine posts filled by the figures most compatible with you.',
          '- <strong>Your ideological timeline:</strong> the closest profiles of each era, from Antiquity to the 21st century.',
          '- <strong>Which country to move to:</strong> the 10 current countries closest to your political ideals.',
          '- <strong>Figures by field:</strong> the one most compatible with you in politics, philosophy, economics and the other fields.',
          '- <strong>Full ranking, spreadsheet and PDF:</strong> your compatibility with the whole catalog, to export to Excel, and the report as a PDF.'
        ]],
        ['Price', ['Nothing. The full report is part of the result: no payment, subscription or account.']],
        ['How you receive it', ['The result is computed in your browser and encoded in the page link. You can return to it whenever you like, in the same browser or through the saved link.']],
        ['Questions', [`Contact us ${c}.`]]
      ]
    }),
    terms: (c) => ({
      title: 'Terms of use',
      lead: 'Rules for using 12 Axes.',
      sections: [
        ['What 12 Axes is', ['An independent, free political quiz that places you on 12 axes and compares you with ideologies, figures, countries and parties. It is informational and educational content: results are approximations and do not represent the author’s position or advice of any kind.']],
        ['The result', ['The result includes the full report, rankings, CSV export and PDF, at no cost. It is computed from your answers and encoded in the page link.']],
        ['Use of the content', ['You may share your result and use the generated images for personal purposes. Reproducing the catalog, texts or code must follow the project license.']],
        ['Changes', ['These terms may change; the version in force is the one published on this page, with its update date.']],
        ['Contact', [`Questions ${c}.`]]
      ]
    }),
    privacy: (c) => ({
      title: 'Privacy policy',
      lead: 'What data 12 Axes handles and why.',
      sections: [
        ['Quiz answers', ['Answers are used only to compute your result at the moment you submit them. 12 Axes does not store answers in a database or link results to people: the result is encoded in the page address (link).']],
        ['Storage in your browser', ['The site stores preferences (such as language and theme) and your last result in your browser. You can delete them in your browser settings.']],
        ['Analytics', ['We use traffic analytics tools, such as Google Analytics, to measure visits and improve the site. They may use cookies and identifiers.']],
        ['Hosting', ['The site and API use infrastructure providers (such as Vercel, Cloudflare and Render) that process requests to deliver content.']],
        ['Your rights', [`You can ask for information about personal data handled, correction or deletion, under the Brazilian General Data Protection Law (LGPD) and similar laws where you live. Ask ${c}.`]]
      ]
    })
  }
};

const LABELS = {
  pt: { report: 'Relatório Completo', terms: 'Termos de uso', privacy: 'Privacidade', updated: 'Atualizado em', skip: 'Pular para o conteúdo', footer: 'Quiz político independente · 12axes.vercel.app · © 2026. Todos os direitos reservados' },
  en: { report: 'Full Report', terms: 'Terms of use', privacy: 'Privacy', updated: 'Updated', skip: 'Skip to content', footer: 'Independent political quiz · 12axes.vercel.app · © 2026. All rights reserved' }
};

function body(paragraphs, escapeHtml) {
  const html = [];
  let items = [];
  const flush = () => {
    if (items.length) {
      html.push(`<ul>${items.join('')}</ul>`);
      items = [];
    }
  };
  for (const text of paragraphs) {
    if (text.startsWith('- ')) {
      items.push(`<li>${text.slice(2)}</li>`);
    } else {
      flush();
      // O texto vem deste arquivo (confiável) e pode ter <a>; só as strings de conteúdo livre passariam por escapeHtml.
      html.push(`<p>${text}</p>`);
    }
  }
  flush();
  return html.join('');
}

/** Páginas institucionais do idioma de L: /report, /terms e /privacy (com o prefixo do idioma). */
export function policyPages(L, { site, gaSnippet, escapeHtml }) {
  const isEn = L.locale === 'en';
  const labels = LABELS[isEn ? 'en' : 'pt'];
  const prefix = L.s.prefix;

  return POLICY_SLUGS.map((slug) => {
    const basePath = `/${slug}`;
    const page = PAGES[isEn ? 'en' : 'pt'][slug](contact(isEn));
    const title = `${page.title} | 12 Axes`;
    const sections = page.sections
      .map(([heading, paragraphs]) => `<section><h2>${escapeHtml(heading)}</h2>${body(paragraphs, escapeHtml)}</section>`)
      .join('');
    const others = POLICY_SLUGS.filter((other) => other !== slug)
      .map((other) => `<a href="${prefix}/${other}">${escapeHtml(labels[other])}</a>`)
      .join(' · ');
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      url: `${site}${prefix}${basePath}`,
      inLanguage: L.s.htmlLang,
      isPartOf: { '@type': 'WebSite', name: '12 Axes', url: site }
    };
    const html = `<!doctype html>
<html lang="${L.s.htmlLang}">
  ${catalogHead(L, { site, basePath, title, description: page.lead, ogType: 'website', ogImage: '/logo.png', css: '/policy.css', jsonLd: [jsonLd], gaSnippet, escapeHtml })}
  <body>
<a class="skip" href="#conteudo">${escapeHtml(labels.skip)}</a>
${siteHeader({ L, basePath })}

<div class="wrap hero">
  <p class="crumbs"><a href="${prefix || '/'}">${escapeHtml(L.s.home)}</a> / ${escapeHtml(page.title)}</p>
  <h1>${escapeHtml(page.title)}</h1>
  <p class="lead">${escapeHtml(page.lead)}</p>
  <p class="updated">${escapeHtml(labels.updated)}: ${isEn ? UPDATED.en : UPDATED.pt}</p>
</div>

<main id="conteudo" class="wrap prose">
  ${sections}
  <p class="others">${others}</p>
</main>
<footer class="foot"><div class="wrap"><a class="logo" href="${prefix || '/'}"><b>12</b><span>axes</span></a><p>${escapeHtml(labels.footer)} · ${others}</p></div></footer>
</body>
</html>`;
    return { basePath, html };
  });
}

export const POLICY_CSS = `${IDEOLOGIES_CSS}
.updated{margin-top:14px;font-size:13px;color:var(--suave)}
.prose{max-width:760px;padding-bottom:72px}
.prose section{margin-top:34px}
.prose h2{font-family:var(--display);font-weight:600;font-size:22px;letter-spacing:-.02em;margin-bottom:8px}
.prose p,.prose li{color:var(--tinta);font-size:16px}
.prose p+p{margin-top:12px}
.prose ul{margin:10px 0 0 22px}
.prose a{color:var(--floresta);text-decoration:underline}
.prose .others{margin-top:44px;font-size:14px;color:var(--suave)}
.foot a{text-decoration:underline}
`;
