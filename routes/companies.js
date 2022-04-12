const express = require('express');
const slugify = require('slugify');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(`SELECT * FROM companies`);
		return res.json({ companies: results.rows });
	} catch (e) {
		return next(e);
	}
});

router.get('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const results = await db.query('SELECT * FROM companies WHERE code = $1', [ code ]);
		const bills = await db.query('SELECT * FROM invoices WHERE comp_code = $1', [ code ]);
		const ind = await db.query(
			`
			SELECT i.code, i.name FROM industries AS i
			LEFT JOIN company_industries AS ci ON i.code=ci.ind_code
			LEFT JOIN companies AS c ON ci.comp_code=c.code
			WHERE c.code = $1`,
			[ code ]
		);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find company with code of ${code}`, 404);
		}
		const company = results.rows[0];
		company.invoices = bills.rows;
		company.industries = ind.rows;
		return res.send(company);
	} catch (e) {
		return next(e);
	}
});

// Add new company using JSON request
router.post('/', async (req, res, next) => {
	try {
		const { name, description } = req.body;
		const results = await db.query(
			'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description',
			[
				slugify(name, {
					remove: /[*+~.()'"!:@]/g,
					lower: true
				}),
				name,
				description
			]
		);
		return res.status(201).json({ company: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.put('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const { name, description } = req.body;
		const results = await db.query(
			'UPDATE companies SET name=$2, description=$3 WHERE code=$1 RETURNING code, name, description',
			[ code, name, description ]
		);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't update company with code of ${code}`, 404);
		}
		return res.send({ company: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.delete('/:code', async (req, res, next) => {
	try {
		const results = db.query('DELETE FROM companies WHERE code = $1', [ req.params.code ]);
		return res.send({ msg: 'DELETED!' });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
