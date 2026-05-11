-- ZanAjira Reference Data Seeds
-- Run after migrations: ./manage.sh db:seed

-- Sample employers (government institutions)
INSERT INTO employers (name, contact_email, contact_phone, address) VALUES
  ('Ministry of Finance and Planning',          'hr@finance.go.tz',    '+255242231001', 'Zanzibar Town'),
  ('Ministry of Health',                        'hr@health.go.tz',     '+255242231002', 'Zanzibar Town'),
  ('Ministry of Education',                     'hr@education.go.tz',  '+255242231003', 'Zanzibar Town'),
  ('Ministry of Agriculture',                   'hr@agriculture.go.tz','+255242231004', 'Zanzibar Town'),
  ('Ministry of Infrastructure',                'hr@infra.go.tz',      '+255242231005', 'Zanzibar Town'),
  ('Civil Service Commission',                  'hr@csc.go.tz',        '+255242231006', 'Zanzibar Town'),
  ('Zanzibar Revenue Board',                    'hr@zrb.go.tz',        '+255242231007', 'Zanzibar Town'),
  ('Zanzibar Utilities Regulatory Authority',   'hr@zura.go.tz',       '+255242231008', 'Zanzibar Town')
ON CONFLICT (name) DO NOTHING;

-- Sample academic institutions
INSERT INTO academic_institutions (name, country, type) VALUES
  ('University of Zanzibar',                    'Tanzania', 'local'),
  ('State University of Zanzibar (SUZA)',        'Tanzania', 'local'),
  ('Karume Institute of Science and Technology','Tanzania', 'local'),
  ('University of Dar es Salaam',               'Tanzania', 'local'),
  ('Muhimbili University of Health Sciences',   'Tanzania', 'local'),
  ('Ardhi University',                          'Tanzania', 'local'),
  ('University of Nairobi',                     'Kenya',    'foreign'),
  ('Makerere University',                       'Uganda',   'foreign')
ON CONFLICT (name) DO NOTHING;

-- Sample professional courses
INSERT INTO professional_courses (name) VALUES
  ('CPA (Certified Public Accountant)'),
  ('ACCA (Association of Chartered Certified Accountants)'),
  ('ERB (Engineers Registration Board)'),
  ('CCNA (Cisco Certified Network Associate)'),
  ('CISA (Certified Information Systems Auditor)'),
  ('CISM (Certified Information Security Manager)'),
  ('Medical Practising Licence'),
  ('Driving Licence (Class C)'),
  ('Advocate Practising Licence')
ON CONFLICT (name) DO NOTHING;

-- Sample professional institutions
INSERT INTO professional_institutions (name, country) VALUES
  ('National Board of Accountants and Auditors (NBAA)', 'Tanzania'),
  ('Engineers Registration Board (ERB)',                 'Tanzania'),
  ('Medical Council of Tanganyika',                      'Tanzania'),
  ('Tanganyika Law Society',                             'Tanzania'),
  ('Tanzania Institute of Bankers',                      'Tanzania')
ON CONFLICT (name) DO NOTHING;

-- Sample vacancies (for testing)
INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications, duties, salary_scale, closing_date, status, created_by)
SELECT
  e.id,
  'Senior Accountant',
  2,
  'Zanzibar Town',
  'Degree in Accounting or Finance. CPA qualification preferred. Minimum 3 years experience.',
  'Prepare financial statements. Manage accounts payable/receivable. Coordinate audits.',
  'ZGS 9-10',
  CURRENT_DATE + INTERVAL '30 days',
  'published',
  NULL
FROM employers e WHERE e.name = 'Ministry of Finance and Planning'
ON CONFLICT DO NOTHING;

INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications, duties, salary_scale, closing_date, status, created_by)
SELECT
  e.id,
  'Medical Officer',
  5,
  'Unguja and Pemba',
  'Degree in Medicine (MBChB or equivalent). Valid Medical Practising Licence. Minimum 2 years post-internship experience.',
  'Provide clinical services. Conduct ward rounds. Supervise junior staff.',
  'ZGS 11-12',
  CURRENT_DATE + INTERVAL '45 days',
  'published',
  NULL
FROM employers e WHERE e.name = 'Ministry of Health'
ON CONFLICT DO NOTHING;

INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications, duties, salary_scale, closing_date, status, created_by)
SELECT
  e.id,
  'ICT Officer',
  3,
  'Zanzibar Town',
  'Degree in Computer Science, Information Technology, or related field. CCNA or equivalent certification preferred.',
  'Maintain ICT infrastructure. Provide technical support. Develop and maintain systems.',
  'ZGS 8-9',
  CURRENT_DATE + INTERVAL '21 days',
  'published',
  NULL
FROM employers e WHERE e.name = 'Civil Service Commission'
ON CONFLICT DO NOTHING;
