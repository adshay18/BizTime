// Set environment to testing
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
beforeEach(async () => {
	const result = await db.query(
		`INSERT INTO companies (code, name, description) VALUES ('rku', 'Roku', 'Hosts TV streaming channels') RETURNING  code, name, description`
	);

	testCompany = result.rows[0];
});

// Empty out companies table
afterEach(async () => {
	await db.query(`DELETE FROM companies`);
});

// End db connection
afterAll(async () => {
	await db.end();
});

describe('GET /companies', () => {
	test('Get a list with one company', async () => {
		const res = await request(app).get('/companies');
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ companies: [ testCompany ] });
	});
});

describe('GET /companies/:code', () => {
	test('Gets a single company', async () => {
		const invoice = await db.query(
			`INSERT INTO invoices (comp_Code, amt, paid, paid_date)
            VALUES ('rku', 100, false, null) RETURNING comp_code, id, amt, paid, paid_date`
		);
		const res = await request(app).get(`/companies/rku`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			code: 'rku',
			description: 'Hosts TV streaming channels',
			industries: [],
			invoices: [
				{
					add_date: expect.any(String),
					amt: 100,
					comp_code: 'rku',
					id: expect.any(Number),
					paid: false,
					paid_date: null
				}
			],
			name: 'Roku'
		});
	});
	test('Responds with 404 for invalid code', async () => {
		const res = await request(app).get(`/companies/tko`);
		expect(res.statusCode).toBe(404);
	});
});

describe('POST /companies', () => {
	test('Creates a single company', async () => {
		const res = await request(app).post('/companies').send({ name: 'Microsoft', description: 'Makes PCs.' });
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({
			company: { code: 'microsoft', name: 'Microsoft', description: 'Makes PCs.' }
		});
	});
});

describe('PUT /companies/:code', () => {
	test('Updates a single company', async () => {
		const res = await request(app)
			.put(`/companies/${testCompany.code}`)
			.send({ name: 'Roku', description: 'The BEST TV streaming service.' });
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			company: { code: 'rku', name: 'Roku', description: 'The BEST TV streaming service.' }
		});
	});
	test('Responds with 404 for invalid id', async () => {
		const res = await request(app)
			.put(`/companies/tko`)
			.send({ name: 'Roku', description: 'The BEST TV streaming service.' });
		expect(res.statusCode).toBe(404);
	});
});

describe('DELETE /companies/:code', () => {
	test('Deletes a single company', async () => {
		const res = await request(app).delete(`/companies/${testCompany.code}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ msg: 'DELETED!' });
	});
});
