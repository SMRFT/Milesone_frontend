/**
 * Robust parser for Python repr strings (OrderedDict, lists, tuples, etc.)
 * The backend sometimes returns data as Python repr strings instead of JSON.
 * This parser handles all known formats:
 *   - Proper JSON objects/arrays
 *   - JSON strings (stringified JSON)
 *   - Python OrderedDict string representations
 *   - Python list string representations like "['a', 'b']"
 */

function parsePythonRepr(input) {
  if (typeof input !== 'string') return input;
  input = input.trim();
  if (!input) return input;

  // Try JSON first (fastest path)
  try { return JSON.parse(input); } catch (e) { /* continue */ }

  let pos = 0;

  function peek() { return pos < input.length ? input[pos] : ''; }
  function advance() { return input[pos++]; }

  function skipWhitespace() {
    while (pos < input.length && ' \t\n\r'.includes(input[pos])) pos++;
  }

  function startsWith(str) {
    return input.startsWith(str, pos);
  }

  function parseValue() {
    skipWhitespace();
    if (pos >= input.length) return null;

    if (startsWith('OrderedDict(')) return parseOrderedDict();
    if (peek() === '[') return parseList();
    if (peek() === '(') return parseTuple();
    if (peek() === "'") return parseSingleQuotedString();
    if (peek() === '"') return parseDoubleQuotedString();
    if (startsWith('True')) { pos += 4; return true; }
    if (startsWith('False')) { pos += 5; return false; }
    if (startsWith('None')) { pos += 4; return null; }
    if (peek() === '-' || (peek() >= '0' && peek() <= '9')) return parseNumber();

    // Unknown token — read until a delimiter
    let start = pos;
    while (pos < input.length && !',])'.includes(input[pos])) pos++;
    return input.slice(start, pos).trim();
  }

  function parseOrderedDict() {
    pos += 'OrderedDict('.length;
    skipWhitespace();

    if (peek() !== '[') throw new Error('Expected [ after OrderedDict(');
    pos++; // skip [
    skipWhitespace();

    const result = {};

    while (pos < input.length && peek() !== ']') {
      skipWhitespace();
      if (peek() === ',') { pos++; skipWhitespace(); continue; }
      if (peek() !== '(') break;

      pos++; // skip (
      skipWhitespace();

      const key = parseValue();
      skipWhitespace();
      if (peek() === ',') pos++;
      skipWhitespace();

      const value = parseValue();
      skipWhitespace();

      if (peek() === ')') pos++;
      skipWhitespace();
      if (peek() === ',') pos++;

      result[key] = value;
    }

    if (peek() === ']') pos++; // skip ]
    skipWhitespace();
    if (peek() === ')') pos++; // skip )

    return result;
  }

  function parseList() {
    pos++; // skip [
    skipWhitespace();
    const result = [];

    while (pos < input.length && peek() !== ']') {
      skipWhitespace();
      if (peek() === ',') { pos++; skipWhitespace(); continue; }
      if (peek() === ']') break;
      result.push(parseValue());
      skipWhitespace();
      if (peek() === ',') pos++;
    }

    if (peek() === ']') pos++;
    return result;
  }

  function parseTuple() {
    pos++; // skip (
    skipWhitespace();
    const result = [];

    while (pos < input.length && peek() !== ')') {
      skipWhitespace();
      if (peek() === ',') { pos++; skipWhitespace(); continue; }
      if (peek() === ')') break;
      result.push(parseValue());
      skipWhitespace();
      if (peek() === ',') pos++;
    }

    if (peek() === ')') pos++;
    return result;
  }

  function parseSingleQuotedString() {
    pos++; // skip opening '
    let result = '';
    while (pos < input.length && peek() !== "'") {
      if (peek() === '\\') { pos++; result += input[pos] || ''; }
      else { result += input[pos]; }
      pos++;
    }
    if (peek() === "'") pos++; // skip closing '
    return result;
  }

  function parseDoubleQuotedString() {
    pos++; // skip opening "
    let result = '';
    while (pos < input.length && peek() !== '"') {
      if (peek() === '\\') { pos++; result += input[pos] || ''; }
      else { result += input[pos]; }
      pos++;
    }
    if (peek() === '"') pos++; // skip closing "
    return result;
  }

  function parseNumber() {
    let start = pos;
    if (peek() === '-') pos++;
    while (pos < input.length && ((peek() >= '0' && peek() <= '9') || peek() === '.')) pos++;
    const numStr = input.slice(start, pos);
    const num = Number(numStr);
    return isNaN(num) ? numStr : num;
  }

  try {
    const result = parseValue();
    return result;
  } catch (e) {
    console.warn('parsePythonRepr failed, returning raw string:', e.message);
    return input;
  }
}

/**
 * Parse a field value: handles JSON strings, Python repr strings, or already-parsed objects.
 */
export function parseField(val) {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object') return val; // already parsed
  if (typeof val === 'string') return parsePythonRepr(val);
  return val;
}

/**
 * Normalize presenting_complaints to always be an array of strings.
 */
export function normalizeComplaints(val) {
  const parsed = parseField(val);
  if (Array.isArray(parsed)) return parsed.length > 0 ? parsed : [''];
  if (typeof parsed === 'string') {
    return parsed.trim() ? [parsed] : [''];
  }
  return [''];
}

/**
 * Normalize all JSON fields in a patient record.
 */
export function normalizePatient(p) {
  return {
    ...p,
    identification_data: parseField(p.identification_data) || {},
    demographic_data: parseField(p.demographic_data) || {},
    presenting_complaints: normalizeComplaints(p.presenting_complaints),
    history_of_present_illness: parseField(p.history_of_present_illness) || {},
    family_history: parseField(p.family_history) || {},
    personal_history: parseField(p.personal_history) || {},
    natalandneanatal_history: parseField(p.natalandneanatal_history) || {},
    postnatal_history: parseField(p.postnatal_history) || {},
    developmental_history: parseField(p.developmental_history) || {},
    scholastic_history: parseField(p.scholastic_history) || {},
    play_history: parseField(p.play_history) || {},
    general_history: parseField(p.general_history) || {},
  };
}
