const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(`SELECT * FROM industries`);
		const industries = results.rows;
		for (industry of industries) {
			let code = industry.code;
			const comps = await db.query(
				`SELECT c.code FROM companies AS c LEFT JOIN company_industries AS ci ON c.code = ci.comp_code LEFT JOIN industries AS i ON i.code = ci.ind_code WHERE i.code = $1`,
				[ code ]
			);
			industry.companies = comps.rows;
		}
		return res.send({ industries });
	} catch (e) {
		return next(e);
	}
});

// Add new industry using JSON request
router.post('/', async (req, res, next) => {
	try {
		const { code, name } = req.body;
		const results = await db.query('INSERT INTO industries (code, name) VALUES ($1, $2) RETURNING *', [
			code,
			name
		]);
		return res.status(201).json({ industry: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// Associate a company with an industry using JSON request
router.post('/companies', async (req, res, next) => {
	try {
		const { ind_code, comp_code } = req.body;
		const results = await db.query(
			'INSERT INTO company_industries (ind_code, comp_code) VALUES ($1, $2) RETURNING *',
			[ ind_code, comp_code ]
		);
		return res.status(201).json({ industry: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
