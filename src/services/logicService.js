const TRUSTED_DOMAINS = [
  'bbc.com',
  'reuters.com',
  'apnews.com',
  'afp.com',
  'eltiempo.com',
  'elespectador.com',
  'cnn.com',
  'nytimes.com',
  'washingtonpost.com',
  'theguardian.com',
  'dw.com',
  'france24.com'
];

const KNOWN_MEDIA_WORDS = [
  'reuters',
  'associated press',
  'ap news',
  'afp',
  'bbc',
  'cnn',
  'dw',
  'france 24',
  'el tiempo',
  'el espectador',
  'la silla vacia',
  'new york times',
  'the guardian',
  'washington post'
];

const ALARMIST_TERMS = [
  'urgente',
  'impactante',
  'no lo vas a creer',
  'comparte antes',
  'antes de que lo borren',
  'secreto',
  'oculto',
  'conspiracion',
  'conspiración',
  'escandalo',
  'escándalo',
  'ultima hora',
  'última hora',
  'prohibido',
  'nos estan mintiendo',
  'nos están mintiendo',
  'la verdad que no quieren que sepas'
];

const SUSPICIOUS_TERMS = [
  'milagro',
  'cura definitiva',
  'gana dinero rapido',
  'gana dinero rápido',
  'hazte rico',
  'click aqui',
  'click aquí',
  '100% real',
  'sin pruebas',
  'reenviar',
  'cadena',
  'viral'
];

const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly'];

function normalizeText(value = '') {
  return String(value).toLowerCase().trim();
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch (error) {
    return '';
  }
}

function containsAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function hasAuthor(text) {
  const patterns = [
    /\bpor\s+[a-záéíóúñ]+\s+[a-záéíóúñ]+/i,
    /\bautor[:\s]+[a-záéíóúñ]+\s+[a-záéíóúñ]+/i,
    /\bredacci[oó]n\s+[a-záéíóúñ]+/i,
    /\bby\s+[a-z]+\s+[a-z]+/i
  ];

  return patterns.some((pattern) => pattern.test(text));
}

function hasExternalVerification(text) {
  const linkMatches = text.match(/https?:\/\/[^\s]+/gi) || [];
  const mediaMentions = KNOWN_MEDIA_WORDS.filter((word) => text.includes(word)).length;

  return linkMatches.length >= 2 || mediaMentions >= 1 || text.includes('verificado por') || text.includes('confirmado por');
}

function hasReliableSource(text, url) {
  const domain = extractDomain(url);
  const trustedDomain = TRUSTED_DOMAINS.some((trusted) => domain === trusted || domain.endsWith(`.${trusted}`));
  const sourceText = text.includes('fuente:') || text.includes('segun ') || text.includes('según ') || text.includes('citado por');
  const knownMedia = containsAny(text, KNOWN_MEDIA_WORDS);

  return trustedDomain || sourceText || knownMedia;
}

function hasAlarmistLanguage(text) {
  const exclamationCount = (text.match(/!/g) || []).length;
  const uppercaseWords = (String(text).match(/\b[A-ZÁÉÍÓÚÑ]{4,}\b/g) || []).length;
  const alarmistTerm = containsAny(normalizeText(text), ALARMIST_TERMS);

  return alarmistTerm || exclamationCount >= 3 || uppercaseWords >= 5;
}

function hasSuspiciousSignals(text, url, image) {
  const normalized = normalizeText(text);
  const domain = extractDomain(url);
  const isShortened = SHORTENERS.includes(domain);
  const suspiciousDomain = Boolean(domain) && (
    domain.endsWith('.xyz') ||
    domain.endsWith('.click') ||
    domain.includes('noticia-urgente') ||
    domain.includes('verdad-oculta')
  );
  const excessiveParams = Boolean(url) && url.length > 140 && url.includes('?');
  const suspiciousText = containsAny(normalized, SUSPICIOUS_TERMS);
  const weakContent = normalized.length > 0 && normalized.length < 80;
  const suspiciousImageName = image && image.originalName
    ? containsAny(normalizeText(image.originalName), ['viral', 'urgente', 'fake', 'impactante'])
    : false;

  return isShortened || suspiciousDomain || excessiveParams || suspiciousText || weakContent || suspiciousImageName;
}

function buildTruthTable(selectedVariables) {
  const rows = [];

  for (let i = 0; i < 32; i += 1) {
    const row = {
      A: Boolean(i & 16),
      B: Boolean(i & 8),
      C: Boolean(i & 4),
      D: Boolean(i & 2),
      E: Boolean(i & 1)
    };

    row.result = evaluateExpression(row);
    row.selected = row.A === selectedVariables.A &&
      row.B === selectedVariables.B &&
      row.C === selectedVariables.C &&
      row.D === selectedVariables.D &&
      row.E === selectedVariables.E;
    rows.push(row);
  }

  return rows;
}

function evaluateExpression(variables) {
  return (variables.A && variables.B && variables.C) && !(variables.D || variables.E);
}

function calculateScore(variables) {
  let score = 35;

  if (variables.A) score += 25;
  if (variables.B) score += 25;
  if (variables.C) score += 15;
  if (variables.D) score -= 20;
  if (variables.E) score -= 15;

  return Math.max(0, Math.min(100, score));
}

function classify(score) {
  if (score >= 80) return 'Alta confiabilidad';
  if (score >= 50) return 'Informacion dudosa';
  return 'Posible Fake News';
}

function buildReasons(variables, score, logicResult) {
  const reasons = [];
  const positive = [];
  const negative = [];

  if (variables.A) {
    positive.push('Se encontro una fuente confiable o una referencia reconocible.');
  } else {
    negative.push('No se detecto una fuente confiable clara.');
  }

  if (variables.B) {
    positive.push('El contenido muestra senales de verificacion externa o menciona otros medios.');
  } else {
    negative.push('No se encontraron suficientes indicios de verificacion por otros medios.');
  }

  if (variables.C) {
    positive.push('El contenido incluye un autor o una atribucion identificable.');
  } else {
    negative.push('No se identifico un autor responsable del contenido.');
  }

  if (variables.D) {
    negative.push('Se detecto lenguaje alarmista, emocional o excesivamente enfatico.');
  } else {
    positive.push('No se detecto un uso fuerte de lenguaje alarmista.');
  }

  if (variables.E) {
    negative.push('El contenido presenta senales sospechosas en texto, URL o imagen.');
  } else {
    positive.push('No se detectaron senales sospechosas criticas.');
  }

  reasons.push(...positive, ...negative);
  reasons.push(`La expresion logica principal evaluo como ${logicResult ? 'verdadera' : 'falsa'}.`);
  reasons.push(`La puntuacion final fue ${score}/100.`);

  return { reasons, positive, negative };
}

function determineInputType(text, url, file) {
  const hasText = Boolean(text && text.trim());
  const hasUrl = Boolean(url && url.trim());
  const hasImage = Boolean(file);

  if ([hasText, hasUrl, hasImage].filter(Boolean).length > 1) return 'mixed';
  if (hasUrl) return 'url';
  if (hasImage) return 'image';
  return 'text';
}

function analyzeContent({ text = '', url = '', file = null }) {
  const normalizedText = normalizeText(text);
  const image = file
    ? {
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`
      }
    : null;

  const variables = {
    A: hasReliableSource(normalizedText, url),
    B: hasExternalVerification(normalizedText),
    C: hasAuthor(text),
    D: hasAlarmistLanguage(text),
    E: hasSuspiciousSignals(text, url, image)
  };

  const logicResult = evaluateExpression(variables);
  const score = calculateScore(variables);
  const classification = classify(score);
  const { reasons, positive, negative } = buildReasons(variables, score, logicResult);
  const truthTable = buildTruthTable(variables);

  return {
    inputType: determineInputType(text, url, file),
    image,
    variables,
    logicResult,
    score,
    classification,
    reasons,
    signals: { positive, negative },
    truthTable
  };
}

module.exports = {
  analyzeContent,
  evaluateExpression,
  calculateScore,
  classify
};
