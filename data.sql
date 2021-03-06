\c biztime

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS company_industries;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE
);

CREATE TABLE company_industries (
  id serial PRIMARY KEY,
  ind_code text NOT NULL REFERENCES industries ON DELETE CASCADE,
  comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('bosch', 'Bosch', 'Manufacturer of car parts');

INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries 
  VALUES  ('tech', 'Technology'),
          ('cpu', 'Computers'),
          ('fin', 'Finance'),
          ('auto', 'Automotive'),
          ('manf', 'Manufacturing');

INSERT INTO company_industries (ind_code, comp_code)
  VALUES  ('tech', 'apple'),
          ('tech', 'ibm'),
          ('cpu', 'apple'),
          ('cpu', 'ibm'),
          ('tech', 'bosch'),
          ('auto', 'bosch'),
          ('manf', 'apple'),
          ('manf', 'ibm'),
          ('manf', 'bosch');