class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.status = 400;
  }
}

function toAstronomicalYear(y, bce) {
  if (!Number.isInteger(y)) throw new ValidationError('year', 'Year must be an integer');
  if (typeof bce !== 'boolean') throw new ValidationError('bce', 'bce flag required and must be boolean');
  if (bce) {
    if (y <= 0) throw new ValidationError('year', 'BCE year must be positive');
    return -(y - 1);
  } else {
    if (y < 1) throw new ValidationError('year', 'CE year must be >= 1');
    return y;
  }
}

function isLeapYearAstronomical(astroYear) {
  const y = astroYear;
  return (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0));
}

function validateDateParts({ yy, mm, dd, bce, name }) {
  if (yy == null) throw new ValidationError(name, 'year required');
  const y = Number(yy);
  const m = mm == null ? null : Number(mm);
  const d = dd == null ? null : Number(dd);

  if (!Number.isInteger(y)) throw new ValidationError(name, 'year must be integer');
  if (m != null && !Number.isInteger(m)) throw new ValidationError(name, 'month must be integer');
  if (d != null && !Number.isInteger(d)) throw new ValidationError(name, 'day must be integer');

  if (m != null && (m < 1 || m > 12)) throw new ValidationError(name, 'month must be 1..12');
  if (d != null && (d < 1 || d > 31)) throw new ValidationError(name, 'day must be 1..31');
  if (d != null && m == null) throw new ValidationError(name, 'month required when day provided');

  const astro = toAstronomicalYear(y, bce);

  if (d != null) {
    const mdays = [31, (isLeapYearAstronomical(astro) ? 29 : 28), 31,30,31,30,31,31,30,31,30,31];
    if (d > mdays[m - 1]) {
      throw new ValidationError(name, `day ${d} invalid for month ${m} in year ${y}${bce ? ' BCE' : ''}`);
    }
  }

  return { astro, y, m, d };
}

function compareNormalizedDates(a, b) {
  // a and b: { astro, m, d } with m/d possibly null
  const sa = [a.astro, a.m ?? 0, a.d ?? 0];
  const sb = [b.astro, b.m ?? 0, b.d ?? 0];
  for (let i = 0; i < 3; i++) {
    if (sb[i] > sa[i]) return 1;
    if (sb[i] < sa[i]) return -1;
  }
  return 0;
}

module.exports = { ValidationError, validateDateParts, compareNormalizedDates };