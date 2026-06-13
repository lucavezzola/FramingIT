function mapPostgresError(err) {
  if (!err || !err.code) return { status: 500, message: 'Database error', code: 'DB_UNKNOWN' };

  switch (err.code) {
    case '23514': // check_violation
      return { status: 400, message: 'Constraint check failed', code: 'CHECK_VIOLATION' };
    case '23503': // foreign_key_violation
      return { status: 400, message: 'Foreign key violation', code: 'FK_VIOLATION' };
    case '23505': // unique_violation
      return { status: 409, message: 'Unique constraint violated', code: 'UNIQUE_VIOLATION' };
    default:
      return { status: 500, message: 'Database error', code: err.code };
  }
}

function mapSqliteError(err) {
  if (!err) return { status: 500, message: 'Database error', code: 'DB_UNKNOWN' };
  if (err.code === 'SQLITE_CONSTRAINT') {
    const msg = err.message || '';
    if (msg.includes('FOREIGN KEY')) return { status: 400, message: 'Referenced resource not found', code: 'FK_VIOLATION' };
    if (msg.includes('CHECK')) return { status: 400, message: 'Constraint check failed', code: 'CHECK_VIOLATION' };
    return { status: 409, message: 'Constraint violation', code: 'CONSTRAINT' };
  }
  return { status: 500, message: 'Database error', code: err.code || 'SQLITE_ERROR' };
}

function mapDbErrorToApi(err) {
  // detect Postgres vs SQLite by presence of err.code patterns
  if (err && typeof err.code === 'string' && err.code.startsWith('23')) {
    return mapPostgresError(err);
  }
  if (err && typeof err.code === 'string' && err.code.startsWith('SQLITE')) {
    return mapSqliteError(err);
  }
  // fallback
  return { status: 500, message: 'Database error', code: err && err.code ? err.code : 'DB_UNKNOWN' };
}

module.exports = { mapDbErrorToApi };
