// Set environment to testing
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
let testInvoice;
beforeEach(async () => {
	const result = await db.query(
		`INSERT INTO companies (code, name, description) VALUES ('rku', 'Roku', 'Hosts TV streaming channels') RETURNING  code, name, description`
	);
	const invoice = await db.query(
		`INSERT INTO invoices (comp_Code, amt, paid, paid_date)
        VALUES ('rku', 100, false, null) RETURNING comp_code, id, amt, paid, paid_date`
	);

	testCompany = result.rows[0];
	testInvoice = invoice.rows[0];
});

// Empty out companies table and invoices table
afterEach(async () => {
	await db.query(`DELETE FROM companies`);
	await db.query(`DELETE FROM invoices`);
});

// End db connection
afterAll(async () => {
	await db.end();
});

describe('GET /invoices', () => {
	test('Get a list with one invoice', async () => {
		const res = await request(app).get('/invoices');
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			invoices: [
				{
					id: expect.any(Number),
					comp_code: 'rku',
					amt: 100,
					paid: false,
					add_date: expect.any(String),
					paid_date: null
				}
			]
		});
	});
});

describe('GET /invoices/:id', () => {
	test('Gets a single invoice', async () => {
		const res = await request(app).get(`/invoices/${testInvoice.id}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			invoice: {
				id: expect.any(Number),
				comp_code: 'rku',
				amt: 100,
				paid: false,
				add_date: expect.any(String),
				paid_date: null
			}
		});
	});
	test('Responds with 404 for invalid id', async () => {
		const res = await request(app).get(`/invoices/99999999`);
		expect(res.statusCode).toBe(404);
	});
});

describe('POST /invoice', () => {
	test('Creates a new invoice', async () => {
		const res = await request(app).post('/invoices').send({ comp_code: 'rku', amt: 250 });
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({
			invoice: {
				id: expect.any(Number),
				comp_code: 'rku',
				amt: 250,
				paid: false,
				add_date: expect.any(String),
				paid_date: null
			}
		});
	});
});

describe('PUT /invoices/:id', () => {
	test('Updates a single invoice', async () => {
		const res = await request(app).put(`/invoices/${testInvoice.id}`).send({ amt: 150, paid: false });
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			invoice: {
				id: expect.any(Number),
				comp_code: 'rku',
				amt: 150,
				paid: false,
				add_date: expect.any(String),
				paid_date: null
			}
		});
	});
	test('Responds with 404 for invalid id', async () => {
		const res = await request(app).put(`/invoices/87654689`).send({ amt: 150, paid: false });
		expect(res.statusCode).toBe(404);
	});
});

describe('DELETE /invoices/:id', () => {
	test('Deletes a single invoice', async () => {
		const res = await request(app).delete(`/invoices/${testInvoice.id}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ msg: 'DELETED!' });
	});
});
