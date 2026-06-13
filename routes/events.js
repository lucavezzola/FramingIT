const express = require('express');
const router = express.Router();

const { ValidationError, validateDateParts, compareNormalizedDates } = require('../validators/dates');

const db = require('../db');

const { mapDbErrorToApi } = require('../utils/dbErrors');

router.post('/events', async (req, res) => {
  try {
    // 1. Parse and normalize input
    const payload = req.body;

    // reads and validates start and end dates (if isPeriod)
    const start = validateDateParts({
      yy: payload.sYY,
      mm: payload.sMM,
      dd: payload.sDD,
      bce: payload.isSBCE,
      name: 'start'
    });

    let end = null;
    if (payload.isPeriod) {
      if (payload.eYY == null) throw new ValidationError('end', 'end year required for periods');
      end = validateDateParts({
        yy: payload.eYY,
        mm: payload.eMM,
        dd: payload.eDD,
        bce: payload.isEBCE,
        name: 'end'
      });

      // 2. Compare start and end (start must be before end)
      if (compareNormalizedDates(start, end) > 0) {
        throw new ValidationError('end', 'end date must be the same or after start date')
      }
    }

    // 3. Start DB transaction
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const insertSql = `
        INSERT INTO Events (TFid, title, desc, imgPath, idPeriod, isSBCE, sYY, sMM, sDD, isEBCE, eYY, eMM. eDD)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        RETURNING Eid
      `;
      const params = [
        payload.TFid,
        payload.title,
        payload.description || null,
        payload.imgPath || null,
        payload.isPeriod ? 1 : 0,
        payload.isSBCE ? 1 : 0,
        payload.sYY,
        payload.sMM || null,
        payload.sDD || null,
        payload.isEBCE ? 1 : 0,
        payload.eYY || null,
        payload.eMM || null,
        payload.eDD || null,
      ];

      const result = await client.query(insertSql, params);

      await client.query('COMMIT');
      res.status(201).json({ id: result.rows[0].eid });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      // 4. Translate DB error to API error
      const apiError = mapDbErrorToApi(dbErr);
      // Log raw DB error to API error
      console.error('DB ERROR RAW', dbErr);
    res.status(apiError.status).json({ error: apiError.message, code: apiError.code});
    } finally {
      client.release();
    }
  } catch (err) {
    // Validation or other synchronous errors
    if (err.name === 'ValidationError') {
      return res.status(err.status || 400).json({ error: err.message, field: err.field});
    }
    console.error('UNEXPECTED ERROR', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;