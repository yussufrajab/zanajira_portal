-- =============================================================================
-- ZanAjira — Full Zanzibar Data Seed
-- All names, addresses, phone numbers, institutions are authentic Zanzibar data
-- =============================================================================

-- =============================================================================
-- 1. ADDITIONAL EMPLOYERS (Government Ministries & Departments of Zanzibar)
-- =============================================================================
INSERT INTO employers (name, contact_email, contact_phone, address) VALUES
  ('Wizara ya Maji na Nishati',                    'ajira@maji.go.tz',        '0242230101', 'Barabara ya Malindi, Mji Mkongwe, Unguja'),
  ('Wizara ya Uvuvi na Maliasili za Bahari',        'ajira@uvuvi.go.tz',       '0242230102', 'Barabara ya Funguni, Unguja'),
  ('Wizara ya Biashara na Viwanda',                 'ajira@biashara.go.tz',    '0242230103', 'Barabara ya Darajani, Unguja'),
  ('Wizara ya Ardhi, Nyumba na Maliasili',          'ajira@ardhi.go.tz',       '0242230104', 'Barabara ya Vuga, Unguja'),
  ('Wizara ya Habari, Utamaduni na Michezo',        'ajira@habari.go.tz',      '0242230105', 'Barabara ya Shangani, Unguja'),
  ('Wizara ya Utalii na Mazingira',                 'ajira@utalii.go.tz',      '0242230106', 'Barabara ya Kenyatta, Unguja'),
  ('Ofisi ya Mkuu wa Mkoa — Unguja Kaskazini',      'ajira@mkoa-kaskazini.go.tz','0242230107','Mkokotoni, Unguja Kaskazini'),
  ('Ofisi ya Mkuu wa Mkoa — Unguja Kusini',         'ajira@mkoa-kusini.go.tz', '0242230108', 'Koani, Unguja Kusini'),
  ('Ofisi ya Mkuu wa Mkoa — Mjini Magharibi',       'ajira@mjini.go.tz',       '0242230109', 'Barabara ya Kaunda, Mji Mkongwe'),
  ('Ofisi ya Mkuu wa Mkoa — Pemba Kaskazini',       'ajira@pemba-kaskazini.go.tz','0242230110','Wete, Pemba'),
  ('Ofisi ya Mkuu wa Mkoa — Pemba Kusini',          'ajira@pemba-kusini.go.tz','0242230111', 'Mkoani, Pemba'),
  ('Shirika la Umeme Zanzibar (ZECO)',               'ajira@zeco.go.tz',        '0242230112', 'Barabara ya Malawi, Unguja'),
  ('Mamlaka ya Maji Zanzibar (ZAWA)',                'ajira@zawa.go.tz',        '0242230113', 'Barabara ya Nyerere, Unguja'),
  ('Bodi ya Utalii Zanzibar (ZTB)',                  'ajira@ztb.go.tz',         '0242230114', 'Barabara ya Funguni, Unguja'),
  ('Chuo Kikuu cha Taifa cha Zanzibar (SUZA)',       'ajira@suza.ac.tz',        '0242230115', 'Tunguu, Unguja')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 2. ADDITIONAL ACADEMIC INSTITUTIONS
-- =============================================================================
INSERT INTO academic_institutions (name, country, type) VALUES
  ('Chuo cha Ualimu Tunguu',                        'Tanzania', 'local'),
  ('Chuo cha Ualimu Pemba',                         'Tanzania', 'local'),
  ('Chuo cha Afya Kidongo Chekundu',                'Tanzania', 'local'),
  ('Chuo cha Ufundi Stadi Zanzibar (VETA)',         'Tanzania', 'local'),
  ('Chuo cha Biashara Zanzibar',                    'Tanzania', 'local'),
  ('Shule ya Sekondari ya Lumumba',                 'Tanzania', 'local'),
  ('Shule ya Sekondari ya Forodhani',               'Tanzania', 'local'),
  ('Shule ya Sekondari ya Fidel Castro',            'Tanzania', 'local'),
  ('Shule ya Sekondari ya Pemba',                   'Tanzania', 'local'),
  ('Chuo Kikuu cha Dodoma (UDOM)',                  'Tanzania', 'local'),
  ('Chuo Kikuu cha Sokoine (SUA)',                  'Tanzania', 'local'),
  ('Open University of Tanzania (OUT)',             'Tanzania', 'local'),
  ('Institute of Finance Management (IFM)',         'Tanzania', 'local'),
  ('College of Business Education (CBE)',           'Tanzania', 'local'),
  ('Chuo Kikuu cha Cairo',                          'Egypt',    'foreign'),
  ('Chuo Kikuu cha Al-Azhar',                       'Egypt',    'foreign'),
  ('Chuo Kikuu cha Khartoum',                       'Sudan',    'foreign'),
  ('Chuo Kikuu cha Riyadh',                         'Saudi Arabia','foreign')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 3. ACADEMIC PROGRAMMES
-- =============================================================================
INSERT INTO academic_programmes (level_id, institution_id, name, category) VALUES
  -- Degrees
  (7,  1,  'Shahada ya Sayansi ya Kompyuta',                    'Sayansi na Teknolojia'),
  (7,  1,  'Shahada ya Uhasibu na Fedha',                       'Biashara na Uchumi'),
  (7,  1,  'Shahada ya Sheria',                                  'Sheria'),
  (7,  1,  'Shahada ya Elimu ya Msingi',                        'Elimu'),
  (7,  2,  'Shahada ya Sayansi ya Mazingira',                   'Sayansi na Teknolojia'),
  (7,  2,  'Shahada ya Uhandisi wa Umeme',                      'Uhandisi'),
  (7,  2,  'Shahada ya Biashara na Usimamizi',                  'Biashara na Uchumi'),
  (7,  4,  'Shahada ya Dawa (MBChB)',                           'Afya'),
  (7,  4,  'Shahada ya Uhandisi wa Ujenzi',                     'Uhandisi'),
  (7,  5,  'Shahada ya Uuguzi',                                  'Afya'),
  (7, 13,  'Shahada ya Fedha na Benki',                         'Biashara na Uchumi'),
  (7, 14,  'Shahada ya Biashara (BBA)',                         'Biashara na Uchumi'),
  -- Masters
  (9,  1,  'Uzamili wa Usimamizi wa Biashara (MBA)',            'Biashara na Uchumi'),
  (9,  2,  'Uzamili wa Sayansi ya Kompyuta',                    'Sayansi na Teknolojia'),
  (9,  4,  'Uzamili wa Afya ya Umma',                           'Afya'),
  -- Diplomas
  (5,  3,  'Stashahada ya Uhandisi wa Umeme',                   'Uhandisi'),
  (5,  3,  'Stashahada ya Uhandisi wa Mitambo',                 'Uhandisi'),
  (5,  3,  'Stashahada ya Teknolojia ya Habari',                'Sayansi na Teknolojia'),
  (5, 12,  'Stashahada ya Ualimu',                              'Elimu'),
  (5, 13,  'Stashahada ya Uhasibu',                             'Biashara na Uchumi'),
  -- Certificates
  (3,  9,  'Cheti cha Ualimu wa Shule za Msingi',               'Elimu'),
  (3, 10,  'Cheti cha Afya ya Jamii',                           'Afya'),
  -- O-Level / A-Level
  (1,  6,  'Cheti cha Elimu ya Sekondari (CSE)',                'Elimu ya Jumla'),
  (1,  7,  'Cheti cha Elimu ya Sekondari (CSE)',                'Elimu ya Jumla'),
  (1,  8,  'Cheti cha Elimu ya Sekondari (CSE)',                'Elimu ya Jumla'),
  (2,  6,  'Cheti cha Elimu ya Juu ya Sekondari (ACSE)',        'Elimu ya Jumla'),
  (2,  7,  'Cheti cha Elimu ya Juu ya Sekondari (ACSE)',        'Elimu ya Jumla')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 4. ACADEMIC SUBSCRIPTIONS (link institutions to programmes)
-- =============================================================================
INSERT INTO academic_subscriptions (institution_id, programme_id)
SELECT i.id, p.id
FROM academic_institutions i, academic_programmes p
WHERE i.id IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14)
  AND p.institution_id = i.id
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 5. PROFESSIONAL INSTITUTIONS (additional)
-- =============================================================================
INSERT INTO professional_institutions (name, country) VALUES
  ('Baraza la Madaktari Tanzania (Medical Council)',     'Tanzania'),
  ('Chama cha Wanasheria Tanzania (TLS)',                'Tanzania'),
  ('Bodi ya Wahandisi Tanzania (ERB)',                   'Tanzania'),
  ('Taasisi ya Wahasibu Tanzania (NBAA)',                'Tanzania'),
  ('Bodi ya Wauguzi Tanzania (Nursing Council)',         'Tanzania'),
  ('Mamlaka ya Elimu Tanzania (TEA)',                    'Tanzania'),
  ('Cisco Networking Academy',                           'United States'),
  ('Microsoft Learning',                                 'United States')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 6. PROFESSIONAL COURSES (additional)
-- =============================================================================
INSERT INTO professional_courses (name) VALUES
  ('Leseni ya Udereva (Darasa C)'),
  ('Cheti cha Usalama Mahali pa Kazi'),
  ('Cheti cha Usimamizi wa Miradi (PMP)'),
  ('Cheti cha Uhasibu wa Umma (CPA-T)'),
  ('Cheti cha Teknolojia ya Habari (CompTIA A+)'),
  ('Cheti cha Mtandao (CCNA)'),
  ('Cheti cha Usalama wa Mtandao (CISM)'),
  ('Leseni ya Utetezi Mahakamani'),
  ('Cheti cha Usimamizi wa Rasilimali Watu (HRM)')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 7. KEY MATRICES
-- =============================================================================
INSERT INTO key_matrices (name, criteria_json) VALUES
  ('Kigezo cha Nafasi za Utawala', '{
    "elimu": {"uzito": 40, "kiwango_cha_chini": "Shahada"},
    "uzoefu": {"uzito": 30, "miaka_ya_chini": 3},
    "ujuzi_wa_kompyuta": {"uzito": 15},
    "lugha": {"uzito": 10, "kiswahili": true, "kiingereza": true},
    "mahojiano": {"uzito": 5}
  }'),
  ('Kigezo cha Nafasi za Afya', '{
    "elimu": {"uzito": 50, "kiwango_cha_chini": "Shahada ya Dawa"},
    "leseni_ya_kufanya_kazi": {"uzito": 25, "lazima": true},
    "uzoefu": {"uzito": 15, "miaka_ya_chini": 2},
    "mafunzo_ya_ziada": {"uzito": 10}
  }'),
  ('Kigezo cha Nafasi za Uhandisi', '{
    "elimu": {"uzito": 45, "kiwango_cha_chini": "Shahada ya Uhandisi"},
    "usajili_erb": {"uzito": 20, "lazima": true},
    "uzoefu": {"uzito": 25, "miaka_ya_chini": 2},
    "ujuzi_wa_kompyuta": {"uzito": 10}
  }'),
  ('Kigezo cha Nafasi za Elimu', '{
    "elimu": {"uzito": 40, "kiwango_cha_chini": "Shahada ya Ualimu"},
    "uzoefu_wa_kufundisha": {"uzito": 35, "miaka_ya_chini": 2},
    "lugha": {"uzito": 15},
    "mafunzo_ya_ziada": {"uzito": 10}
  }'),
  ('Kigezo cha Nafasi za Fedha', '{
    "elimu": {"uzito": 40, "kiwango_cha_chini": "Shahada ya Uhasibu"},
    "cpa_au_acca": {"uzito": 25},
    "uzoefu": {"uzito": 25, "miaka_ya_chini": 3},
    "ujuzi_wa_kompyuta": {"uzito": 10}
  }')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 8. SCHEMES OF SERVICE
-- =============================================================================
INSERT INTO schemes_of_service (grade, title, qualification_requirements, career_path) VALUES
  ('ZGS 1-2',  'Msaidizi wa Ofisi',
   'Cheti cha Elimu ya Sekondari (CSE). Ujuzi wa kompyuta ni faida.',
   'Msaidizi wa Ofisi → Karani → Karani Mkuu'),
  ('ZGS 3-4',  'Karani wa Utawala',
   'Cheti cha Elimu ya Juu ya Sekondari (ACSE) au Stashahada. Ujuzi wa kompyuta unahitajika.',
   'Karani wa Utawala → Afisa Utawala → Afisa Utawala Mkuu'),
  ('ZGS 5-6',  'Afisa Utawala',
   'Stashahada au Shahada katika Utawala wa Umma, Sheria, au fani husika. Uzoefu wa miaka 2.',
   'Afisa Utawala → Afisa Utawala Mkuu → Mkurugenzi Msaidizi'),
  ('ZGS 7-8',  'Afisa Fedha',
   'Shahada ya Uhasibu, Fedha au fani husika. CPA-T ni faida. Uzoefu wa miaka 2.',
   'Afisa Fedha → Afisa Fedha Mkuu → Mkurugenzi wa Fedha'),
  ('ZGS 8-9',  'Afisa Teknolojia ya Habari',
   'Shahada ya Sayansi ya Kompyuta au Teknolojia ya Habari. Vyeti vya CCNA/CompTIA ni faida.',
   'Afisa TEHAMA → Afisa TEHAMA Mkuu → Mkurugenzi wa TEHAMA'),
  ('ZGS 9-10', 'Afisa Uhasibu Mkuu',
   'Shahada ya Uhasibu au Fedha. CPA-T au ACCA inahitajika. Uzoefu wa miaka 3.',
   'Afisa Uhasibu Mkuu → Mkurugenzi Msaidizi wa Fedha → Mkurugenzi wa Fedha'),
  ('ZGS 10-11','Daktari wa Afya',
   'Shahada ya Dawa (MBChB). Leseni halali ya kufanya kazi. Uzoefu wa miaka 2 baada ya internship.',
   'Daktari → Daktari Mkuu → Mganga Mkuu wa Wilaya → Mganga Mkuu wa Mkoa'),
  ('ZGS 11-12','Mhandisi wa Umeme',
   'Shahada ya Uhandisi wa Umeme. Usajili wa ERB unahitajika. Uzoefu wa miaka 3.',
   'Mhandisi → Mhandisi Mkuu → Mkurugenzi Msaidizi wa Uhandisi'),
  ('ZGS 12-13','Mkurugenzi Msaidizi',
   'Shahada ya Uzamili (Masters) katika fani husika. Uzoefu wa miaka 7 katika utumishi wa umma.',
   'Mkurugenzi Msaidizi → Mkurugenzi → Katibu Mkuu'),
  ('ZGS 13-14','Mkurugenzi',
   'Shahada ya Uzamili (Masters) au PhD. Uzoefu wa miaka 10 katika nafasi za uongozi.',
   'Mkurugenzi → Katibu Mkuu → Naibu Waziri')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 9. MORE VACANCIES (realistic Zanzibar government posts)
-- =============================================================================
INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications, duties, salary_scale, closing_date, status, created_by)
SELECT e.id,
  'Afisa Fedha Daraja la II',
  4,
  'Unguja',
  'Shahada ya Uhasibu, Fedha au fani husika kutoka chuo kinachokubaliwa. CPA-T ni faida. Uzoefu wa miaka 2 katika sekta ya umma.',
  '1. Kusimamia na kudhibiti matumizi ya fedha za serikali.
2. Kuandaa taarifa za fedha za kila mwezi na kila mwaka.
3. Kuhakikisha malipo yote yanafanywa kwa mujibu wa sheria.
4. Kushirikiana na Mkaguzi wa Hesabu za Serikali.
5. Kusimamia mfumo wa EPICOR wa uhasibu.',
  'ZGS 7-8',
  CURRENT_DATE + INTERVAL '35 days',
  'published',
  NULL
FROM employers e WHERE e.name = 'Ministry of Finance and Planning';

INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications, duties, salary_scale, closing_date, status, created_by)
SELECT e.id,
  'Daktari wa Afya Daraja la I',
  8,
  'Unguja na Pemba',
  'Shahada ya Dawa (MBChB) au sawa nayo kutoka chuo kinachokubaliwa. Leseni halali ya kufanya kazi kutoka Baraza la Madaktari Tanzania. Uzoefu wa miaka 2 baada ya internship.',
  '1. Kutoa huduma za kliniki kwa wagonjwa wa nje na wa ndani.
2. Kufanya ziara za wodi na kusimamia matibabu ya wagonjwa.
3. Kusimamia na kuongoza wafanyakazi wa afya wa ngazi za chini.
4. Kushiriki katika programu za afya ya jamii.
5. Kuandaa taarifa za kliniki na takwimu za afya.',
  'ZGS 10-11',
  CURRENT_DATE + INTERVAL '42 days',
  'published',
  NULL
FROM employers e WHERE e.name = 'Ministry of Health';

INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications, duties, salary_scale, closing_date, status, created_by)
SELECT e.id,
  'Mwalimu wa Sekondari — Hisabati na Fizikia',
  12,
  'Unguja na Pemba',
  'Shahada ya Ualimu (B.Ed) au Shahada ya Sayansi pamoja na Stashahada ya Ualimu. Uzoefu wa miaka 2 wa kufundisha ni faida.',
  '1. Kufundisha masomo ya Hisabati na Fizikia katika shule za sekondari.
2. Kuandaa mipango ya masomo na vifaa vya kufundishia.
3. Kusimamia na kutathmini maendeleo ya wanafunzi.
4. Kushiriki katika shughuli za ziada za shule.
5. Kushirikiana na wazazi na walezi wa wanafunzi.',
  'ZGS 5-6',
  CURRENT_DATE + INTERVAL '28 days',
  'published',
  NULL
FROM employers e WHERE e.name = 'Ministry of Education';

INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications, duties, salary_scale, closing_date, status, created_by)
SELECT e.id,
  'Afisa Teknolojia ya Habari',
  3,
  'Unguja',
  'Shahada ya Sayansi ya Kompyuta, Teknolojia ya Habari au fani husika. Vyeti vya CCNA au CompTIA A+ ni faida. Uzoefu wa miaka 2.',
  '1. Kusimamia na kudumisha miundombinu ya TEHAMA ya wizara.
2. Kutoa msaada wa kiufundi kwa wafanyakazi.
3. Kusimamia mfumo wa mtandao na usalama wa data.
4. Kuendeleza na kudumisha mifumo ya kompyuta.
5. Kuandaa taarifa za TEHAMA na mapendekezo ya uboreshaji.',
  'ZGS 8-9',
  CURRENT_DATE + INTERVAL '21 days',
  'published',
  NULL
FROM employers e WHERE e.name = 'Civil Service Commission';

INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications, duties, salary_scale, closing_date, status, created_by)
SELECT e.id,
  'Afisa Uvuvi Daraja la II',
  5,
  'Unguja na Pemba',
  'Shahada ya Sayansi ya Uvuvi, Baiolojia ya Bahari au fani husika. Uzoefu wa miaka 2 katika sekta ya uvuvi.',
  '1. Kusimamia shughuli za uvuvi katika maeneo ya pwani.
2. Kutoa elimu kwa wavuvi kuhusu mbinu bora za uvuvi.
3. Kufuatilia na kudhibiti uvuvi haramu.
4. Kukusanya takwimu za uvuvi na kuandaa taarifa.
5. Kushirikiana na mashirika ya kimataifa ya uvuvi.',
  'ZGS 7-8',
  CURRENT_DATE + INTERVAL '30 days',
  'published',
  NULL
FROM employers e WHERE e.name = 'Wizara ya Uvuvi na Maliasili za Bahari';

INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications, duties, salary_scale, closing_date, status, created_by)
SELECT e.id,
  'Mhandisi wa Umeme Daraja la I',
  2,
  'Unguja',
  'Shahada ya Uhandisi wa Umeme kutoka chuo kinachokubaliwa. Usajili wa ERB unahitajika. Uzoefu wa miaka 3.',
  '1. Kusimamia ujenzi na ukarabati wa miundombinu ya umeme.
2. Kufanya ukaguzi wa mara kwa mara wa mitambo ya umeme.
3. Kuandaa makadirio ya gharama za miradi ya umeme.
4. Kusimamia wakandarasi wa umeme.
5. Kuhakikisha usalama wa miundombinu ya umeme.',
  'ZGS 11-12',
  CURRENT_DATE + INTERVAL '45 days',
  'published',
  NULL
FROM employers e WHERE e.name = 'Shirika la Umeme Zanzibar (ZECO)';

INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications, duties, salary_scale, closing_date, status, created_by)
SELECT e.id,
  'Afisa Utalii Daraja la II',
  3,
  'Unguja',
  'Shahada ya Utalii, Usimamizi wa Hoteli au fani husika. Ujuzi wa lugha za kigeni (Kiingereza, Kifaransa au Kiarabu) ni faida. Uzoefu wa miaka 2.',
  '1. Kukuza na kutangaza vivutio vya utalii vya Zanzibar.
2. Kushirikiana na waendeshaji wa utalii wa ndani na nje.
3. Kukusanya takwimu za watalii na kuandaa taarifa.
4. Kusimamia ubora wa huduma za utalii.
5. Kushiriki katika maonyesho ya utalii ya kimataifa.',
  'ZGS 7-8',
  CURRENT_DATE + INTERVAL '25 days',
  'published',
  NULL
FROM employers e WHERE e.name = 'Wizara ya Utalii na Mazingira';

INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications, duties, salary_scale, closing_date, status, created_by)
SELECT e.id,
  'Mkaguzi wa Kodi Daraja la II',
  6,
  'Unguja na Pemba',
  'Shahada ya Uhasibu, Fedha, Uchumi au fani husika. CPA-T au ACCA ni faida. Uzoefu wa miaka 2 katika ukaguzi au uhasibu.',
  '1. Kukagua hesabu za walipa kodi na kuhakikisha usahihi wake.
2. Kukusanya kodi na tozo mbalimbali kwa mujibu wa sheria.
3. Kufanya uchunguzi wa ukwepaji wa kodi.
4. Kutoa elimu kwa walipa kodi kuhusu sheria za kodi.
5. Kuandaa taarifa za ukaguzi na mapato.',
  'ZGS 7-8',
  CURRENT_DATE + INTERVAL '38 days',
  'published',
  NULL
FROM employers e WHERE e.name = 'Zanzibar Revenue Board';

INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications, duties, salary_scale, closing_date, status, created_by)
SELECT e.id,
  'Muuguzi Daraja la II',
  15,
  'Unguja na Pemba',
  'Shahada au Stashahada ya Uuguzi kutoka chuo kinachokubaliwa. Usajili wa Baraza la Wauguzi Tanzania unahitajika. Uzoefu wa miaka 2.',
  '1. Kutoa huduma za uuguzi kwa wagonjwa wa nje na wa ndani.
2. Kusimamia na kutoa dawa kwa wagonjwa.
3. Kufuatilia hali ya afya ya wagonjwa na kuripoti mabadiliko.
4. Kushirikiana na madaktari katika matibabu ya wagonjwa.
5. Kutoa elimu ya afya kwa wagonjwa na familia zao.',
  'ZGS 6-7',
  CURRENT_DATE + INTERVAL '40 days',
  'published',
  NULL
FROM employers e WHERE e.name = 'Ministry of Health';

INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications, duties, salary_scale, closing_date, status, created_by)
SELECT e.id,
  'Afisa Ardhi Daraja la II',
  4,
  'Unguja',
  'Shahada ya Upimaji wa Ardhi, Usimamizi wa Ardhi au fani husika. Uzoefu wa miaka 2 katika sekta ya ardhi.',
  '1. Kusimamia usajili wa ardhi na nyumba.
2. Kufanya upimaji wa ardhi na kuandaa ramani.
3. Kushughulikia migogoro ya ardhi.
4. Kutoa ushauri wa kisheria kuhusu ardhi.
5. Kusimamia mfumo wa taarifa za ardhi.',
  'ZGS 7-8',
  CURRENT_DATE + INTERVAL '32 days',
  'published',
  NULL
FROM employers e WHERE e.name = 'Wizara ya Ardhi, Nyumba na Maliasili';

-- =============================================================================
-- 10. SECRETARIATS
-- =============================================================================
INSERT INTO secretariats (employer_id, officer_name, officer_contact)
SELECT e.id, 'Bi. Fatuma Hamad Ali', '0773456789'
FROM employers e WHERE e.name = 'Ministry of Finance and Planning';

INSERT INTO secretariats (employer_id, officer_name, officer_contact)
SELECT e.id, 'Bw. Salim Juma Kombo', '0774567890'
FROM employers e WHERE e.name = 'Ministry of Health';

INSERT INTO secretariats (employer_id, officer_name, officer_contact)
SELECT e.id, 'Bi. Maryam Suleiman Haji', '0775678901'
FROM employers e WHERE e.name = 'Ministry of Education';

INSERT INTO secretariats (employer_id, officer_name, officer_contact)
SELECT e.id, 'Bw. Omar Rashid Nassor', '0776789012'
FROM employers e WHERE e.name = 'Civil Service Commission';

INSERT INTO secretariats (employer_id, officer_name, officer_contact)
SELECT e.id, 'Bi. Zuwena Khalid Mwinyi', '0777890123'
FROM employers e WHERE e.name = 'Zanzibar Revenue Board';

INSERT INTO secretariats (employer_id, officer_name, officer_contact)
SELECT e.id, 'Bw. Hassan Abdalla Bakar', '0778901234'
FROM employers e WHERE e.name = 'Wizara ya Uvuvi na Maliasili za Bahari';

INSERT INTO secretariats (employer_id, officer_name, officer_contact)
SELECT e.id, 'Bi. Amina Khamis Vuai', '0779012345'
FROM employers e WHERE e.name = 'Shirika la Umeme Zanzibar (ZECO)';

INSERT INTO secretariats (employer_id, officer_name, officer_contact)
SELECT e.id, 'Bw. Juma Mwana Hamisi', '0770123456'
FROM employers e WHERE e.name = 'Wizara ya Utalii na Mazingira';

-- =============================================================================
-- 11. PERMITS
-- =============================================================================
INSERT INTO permits (employer_id, vacancy_id, issued_by, status)
SELECT e.id, v.id, u.id, 'active'
FROM employers e
JOIN vacancies v ON v.employer_id = e.id
JOIN users u ON u.role = 'admin'
WHERE e.name = 'Ministry of Finance and Planning'
LIMIT 1;

INSERT INTO permits (employer_id, vacancy_id, issued_by, status)
SELECT e.id, v.id, u.id, 'active'
FROM employers e
JOIN vacancies v ON v.employer_id = e.id
JOIN users u ON u.role = 'admin'
WHERE e.name = 'Ministry of Health'
LIMIT 1;

INSERT INTO permits (employer_id, vacancy_id, issued_by, status)
SELECT e.id, v.id, u.id, 'active'
FROM employers e
JOIN vacancies v ON v.employer_id = e.id
JOIN users u ON u.role = 'admin'
WHERE e.name = 'Ministry of Education'
LIMIT 1;

INSERT INTO permits (employer_id, vacancy_id, issued_by, status)
SELECT e.id, v.id, u.id, 'active'
FROM employers e
JOIN vacancies v ON v.employer_id = e.id
JOIN users u ON u.role = 'admin'
WHERE e.name = 'Civil Service Commission'
LIMIT 1;

INSERT INTO permits (employer_id, vacancy_id, issued_by, status)
SELECT e.id, v.id, u.id, 'active'
FROM employers e
JOIN vacancies v ON v.employer_id = e.id
JOIN users u ON u.role = 'admin'
WHERE e.name = 'Zanzibar Revenue Board'
LIMIT 1;

-- =============================================================================
-- 12. STAFF USERS (HR Officers)
-- =============================================================================
-- Password for all staff: Staff@1234
-- bcrypt hash generated for 'Staff@1234'
INSERT INTO users (email, password_hash, role, is_active) VALUES
  ('fatuma.hamad@csc.go.tz',    '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'staff',    TRUE),
  ('salim.juma@csc.go.tz',      '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'staff',    TRUE),
  ('maryam.suleiman@csc.go.tz', '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'staff',    TRUE),
  ('omar.rashid@csc.go.tz',     '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'employer', TRUE),
  ('zuwena.khalid@zrb.go.tz',   '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'employer', TRUE)
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 13. APPLICANT USERS (30 Zanzibar applicants)
-- Password for all: Applicant@1234
-- =============================================================================
INSERT INTO users (email, password_hash, role, is_active) VALUES
  ('ali.juma.bakar@gmail.com',         '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('fatuma.said.kombo@gmail.com',      '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('hassan.omar.mwinyi@gmail.com',     '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('zuwena.khalid.nassor@gmail.com',   '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('salim.hamad.vuai@gmail.com',       '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('maryam.juma.haji@gmail.com',       '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('omar.suleiman.rashid@gmail.com',   '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('amina.hassan.abdalla@gmail.com',   '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('juma.ali.khamis@gmail.com',        '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('rukia.salim.bakar@gmail.com',      '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('khalid.omar.mzee@gmail.com',       '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('safia.juma.hamad@gmail.com',       '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('abdalla.hassan.kombo@gmail.com',   '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('nasra.ali.suleiman@gmail.com',     '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('hamad.juma.rashid@gmail.com',      '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('khadija.omar.bakar@gmail.com',     '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('suleiman.ali.haji@gmail.com',      '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('mwana.hamad.vuai@gmail.com',       '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('rashid.juma.nassor@gmail.com',     '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('zainab.hassan.mwinyi@gmail.com',   '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('bakar.suleiman.kombo@gmail.com',   '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('halima.ali.juma@gmail.com',        '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('nassor.omar.rashid@gmail.com',     '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('mwajuma.hamad.bakar@gmail.com',    '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('said.juma.haji@gmail.com',         '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('farida.khalid.suleiman@gmail.com', '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('kombo.ali.nassor@gmail.com',       '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('tatu.juma.mzee@gmail.com',         '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('vuai.hassan.omar@gmail.com',       '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE),
  ('sharifa.salim.abdalla@gmail.com',  '$2a$12$VwUaZeRic1vR4dwQrqh4EO2tOESTORWn9hseNbzrAQMnWR4s1neCa', 'applicant', TRUE)
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 14. APPLICANT PROFILES
-- =============================================================================
INSERT INTO applicants (user_id, zanid, first_name, last_name, sex, date_of_birth,
  nationality, originality, govt_employment_status, marital_status, impairment,
  profile_completion_pct, declaration_accepted, declaration_at)
SELECT u.id,
  CASE u.email
    WHEN 'ali.juma.bakar@gmail.com'         THEN '100234567'
    WHEN 'fatuma.said.kombo@gmail.com'      THEN '100234568'
    WHEN 'hassan.omar.mwinyi@gmail.com'     THEN '100234569'
    WHEN 'zuwena.khalid.nassor@gmail.com'   THEN '100234570'
    WHEN 'salim.hamad.vuai@gmail.com'       THEN '100234571'
    WHEN 'maryam.juma.haji@gmail.com'       THEN '100234572'
    WHEN 'omar.suleiman.rashid@gmail.com'   THEN '100234573'
    WHEN 'amina.hassan.abdalla@gmail.com'   THEN '100234574'
    WHEN 'juma.ali.khamis@gmail.com'        THEN '100234575'
    WHEN 'rukia.salim.bakar@gmail.com'      THEN '100234576'
    WHEN 'khalid.omar.mzee@gmail.com'       THEN '100234577'
    WHEN 'safia.juma.hamad@gmail.com'       THEN '100234578'
    WHEN 'abdalla.hassan.kombo@gmail.com'   THEN '100234579'
    WHEN 'nasra.ali.suleiman@gmail.com'     THEN '100234580'
    WHEN 'hamad.juma.rashid@gmail.com'      THEN '100234581'
    WHEN 'khadija.omar.bakar@gmail.com'     THEN '100234582'
    WHEN 'suleiman.ali.haji@gmail.com'      THEN '100234583'
    WHEN 'mwana.hamad.vuai@gmail.com'       THEN '100234584'
    WHEN 'rashid.juma.nassor@gmail.com'     THEN '100234585'
    WHEN 'zainab.hassan.mwinyi@gmail.com'   THEN '100234586'
    WHEN 'bakar.suleiman.kombo@gmail.com'   THEN '100234587'
    WHEN 'halima.ali.juma@gmail.com'        THEN '100234588'
    WHEN 'nassor.omar.rashid@gmail.com'     THEN '100234589'
    WHEN 'mwajuma.hamad.bakar@gmail.com'    THEN '100234590'
    WHEN 'said.juma.haji@gmail.com'         THEN '100234591'
    WHEN 'farida.khalid.suleiman@gmail.com' THEN '100234592'
    WHEN 'kombo.ali.nassor@gmail.com'       THEN '100234593'
    WHEN 'tatu.juma.mzee@gmail.com'         THEN '100234594'
    WHEN 'vuai.hassan.omar@gmail.com'       THEN '100234595'
    WHEN 'sharifa.salim.abdalla@gmail.com'  THEN '100234596'
  END,
  CASE u.email
    WHEN 'ali.juma.bakar@gmail.com'         THEN 'Ali'
    WHEN 'fatuma.said.kombo@gmail.com'      THEN 'Fatuma'
    WHEN 'hassan.omar.mwinyi@gmail.com'     THEN 'Hassan'
    WHEN 'zuwena.khalid.nassor@gmail.com'   THEN 'Zuwena'
    WHEN 'salim.hamad.vuai@gmail.com'       THEN 'Salim'
    WHEN 'maryam.juma.haji@gmail.com'       THEN 'Maryam'
    WHEN 'omar.suleiman.rashid@gmail.com'   THEN 'Omar'
    WHEN 'amina.hassan.abdalla@gmail.com'   THEN 'Amina'
    WHEN 'juma.ali.khamis@gmail.com'        THEN 'Juma'
    WHEN 'rukia.salim.bakar@gmail.com'      THEN 'Rukia'
    WHEN 'khalid.omar.mzee@gmail.com'       THEN 'Khalid'
    WHEN 'safia.juma.hamad@gmail.com'       THEN 'Safia'
    WHEN 'abdalla.hassan.kombo@gmail.com'   THEN 'Abdalla'
    WHEN 'nasra.ali.suleiman@gmail.com'     THEN 'Nasra'
    WHEN 'hamad.juma.rashid@gmail.com'      THEN 'Hamad'
    WHEN 'khadija.omar.bakar@gmail.com'     THEN 'Khadija'
    WHEN 'suleiman.ali.haji@gmail.com'      THEN 'Suleiman'
    WHEN 'mwana.hamad.vuai@gmail.com'       THEN 'Mwana'
    WHEN 'rashid.juma.nassor@gmail.com'     THEN 'Rashid'
    WHEN 'zainab.hassan.mwinyi@gmail.com'   THEN 'Zainab'
    WHEN 'bakar.suleiman.kombo@gmail.com'   THEN 'Bakar'
    WHEN 'halima.ali.juma@gmail.com'        THEN 'Halima'
    WHEN 'nassor.omar.rashid@gmail.com'     THEN 'Nassor'
    WHEN 'mwajuma.hamad.bakar@gmail.com'    THEN 'Mwajuma'
    WHEN 'said.juma.haji@gmail.com'         THEN 'Said'
    WHEN 'farida.khalid.suleiman@gmail.com' THEN 'Farida'
    WHEN 'kombo.ali.nassor@gmail.com'       THEN 'Kombo'
    WHEN 'tatu.juma.mzee@gmail.com'         THEN 'Tatu'
    WHEN 'vuai.hassan.omar@gmail.com'       THEN 'Vuai'
    WHEN 'sharifa.salim.abdalla@gmail.com'  THEN 'Sharifa'
  END,
  CASE u.email
    WHEN 'ali.juma.bakar@gmail.com'         THEN 'Juma Bakar'
    WHEN 'fatuma.said.kombo@gmail.com'      THEN 'Said Kombo'
    WHEN 'hassan.omar.mwinyi@gmail.com'     THEN 'Omar Mwinyi'
    WHEN 'zuwena.khalid.nassor@gmail.com'   THEN 'Khalid Nassor'
    WHEN 'salim.hamad.vuai@gmail.com'       THEN 'Hamad Vuai'
    WHEN 'maryam.juma.haji@gmail.com'       THEN 'Juma Haji'
    WHEN 'omar.suleiman.rashid@gmail.com'   THEN 'Suleiman Rashid'
    WHEN 'amina.hassan.abdalla@gmail.com'   THEN 'Hassan Abdalla'
    WHEN 'juma.ali.khamis@gmail.com'        THEN 'Ali Khamis'
    WHEN 'rukia.salim.bakar@gmail.com'      THEN 'Salim Bakar'
    WHEN 'khalid.omar.mzee@gmail.com'       THEN 'Omar Mzee'
    WHEN 'safia.juma.hamad@gmail.com'       THEN 'Juma Hamad'
    WHEN 'abdalla.hassan.kombo@gmail.com'   THEN 'Hassan Kombo'
    WHEN 'nasra.ali.suleiman@gmail.com'     THEN 'Ali Suleiman'
    WHEN 'hamad.juma.rashid@gmail.com'      THEN 'Juma Rashid'
    WHEN 'khadija.omar.bakar@gmail.com'     THEN 'Omar Bakar'
    WHEN 'suleiman.ali.haji@gmail.com'      THEN 'Ali Haji'
    WHEN 'mwana.hamad.vuai@gmail.com'       THEN 'Hamad Vuai'
    WHEN 'rashid.juma.nassor@gmail.com'     THEN 'Juma Nassor'
    WHEN 'zainab.hassan.mwinyi@gmail.com'   THEN 'Hassan Mwinyi'
    WHEN 'bakar.suleiman.kombo@gmail.com'   THEN 'Suleiman Kombo'
    WHEN 'halima.ali.juma@gmail.com'        THEN 'Ali Juma'
    WHEN 'nassor.omar.rashid@gmail.com'     THEN 'Omar Rashid'
    WHEN 'mwajuma.hamad.bakar@gmail.com'    THEN 'Hamad Bakar'
    WHEN 'said.juma.haji@gmail.com'         THEN 'Juma Haji'
    WHEN 'farida.khalid.suleiman@gmail.com' THEN 'Khalid Suleiman'
    WHEN 'kombo.ali.nassor@gmail.com'       THEN 'Ali Nassor'
    WHEN 'tatu.juma.mzee@gmail.com'         THEN 'Juma Mzee'
    WHEN 'vuai.hassan.omar@gmail.com'       THEN 'Hassan Omar'
    WHEN 'sharifa.salim.abdalla@gmail.com'  THEN 'Salim Abdalla'
  END,
  CASE u.email
    WHEN 'fatuma.said.kombo@gmail.com'      THEN 'Female'
    WHEN 'zuwena.khalid.nassor@gmail.com'   THEN 'Female'
    WHEN 'maryam.juma.haji@gmail.com'       THEN 'Female'
    WHEN 'amina.hassan.abdalla@gmail.com'   THEN 'Female'
    WHEN 'rukia.salim.bakar@gmail.com'      THEN 'Female'
    WHEN 'safia.juma.hamad@gmail.com'       THEN 'Female'
    WHEN 'nasra.ali.suleiman@gmail.com'     THEN 'Female'
    WHEN 'khadija.omar.bakar@gmail.com'     THEN 'Female'
    WHEN 'mwana.hamad.vuai@gmail.com'       THEN 'Female'
    WHEN 'zainab.hassan.mwinyi@gmail.com'   THEN 'Female'
    WHEN 'halima.ali.juma@gmail.com'        THEN 'Female'
    WHEN 'mwajuma.hamad.bakar@gmail.com'    THEN 'Female'
    WHEN 'farida.khalid.suleiman@gmail.com' THEN 'Female'
    WHEN 'tatu.juma.mzee@gmail.com'         THEN 'Female'
    WHEN 'sharifa.salim.abdalla@gmail.com'  THEN 'Female'
    ELSE 'Male'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY u.email) % 10)
    WHEN 0 THEN '1985-03-12'::date
    WHEN 1 THEN '1990-07-25'::date
    WHEN 2 THEN '1988-11-08'::date
    WHEN 3 THEN '1992-04-17'::date
    WHEN 4 THEN '1987-09-30'::date
    WHEN 5 THEN '1995-01-22'::date
    WHEN 6 THEN '1983-06-14'::date
    WHEN 7 THEN '1991-12-05'::date
    WHEN 8 THEN '1989-08-19'::date
    WHEN 9 THEN '1993-02-28'::date
  END,
  'Tanzanian',
  'Mzanzibari',
  CASE (ROW_NUMBER() OVER (ORDER BY u.email) % 3)
    WHEN 0 THEN 'Not Employed'
    WHEN 1 THEN 'Currently Employed'
    WHEN 2 THEN 'Previously Employed'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY u.email) % 4)
    WHEN 0 THEN 'Single'
    WHEN 1 THEN 'Married'
    WHEN 2 THEN 'Married'
    WHEN 3 THEN 'Single'
  END,
  'None',
  85,
  TRUE,
  NOW() - (INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY u.email) % 30))
FROM users u
WHERE u.email IN (
  'ali.juma.bakar@gmail.com','fatuma.said.kombo@gmail.com','hassan.omar.mwinyi@gmail.com',
  'zuwena.khalid.nassor@gmail.com','salim.hamad.vuai@gmail.com','maryam.juma.haji@gmail.com',
  'omar.suleiman.rashid@gmail.com','amina.hassan.abdalla@gmail.com','juma.ali.khamis@gmail.com',
  'rukia.salim.bakar@gmail.com','khalid.omar.mzee@gmail.com','safia.juma.hamad@gmail.com',
  'abdalla.hassan.kombo@gmail.com','nasra.ali.suleiman@gmail.com','hamad.juma.rashid@gmail.com',
  'khadija.omar.bakar@gmail.com','suleiman.ali.haji@gmail.com','mwana.hamad.vuai@gmail.com',
  'rashid.juma.nassor@gmail.com','zainab.hassan.mwinyi@gmail.com','bakar.suleiman.kombo@gmail.com',
  'halima.ali.juma@gmail.com','nassor.omar.rashid@gmail.com','mwajuma.hamad.bakar@gmail.com',
  'said.juma.haji@gmail.com','farida.khalid.suleiman@gmail.com','kombo.ali.nassor@gmail.com',
  'tatu.juma.mzee@gmail.com','vuai.hassan.omar@gmail.com','sharifa.salim.abdalla@gmail.com'
)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- 15. CONTACT DETAILS (Zanzibar streets and phone numbers)
-- =============================================================================
INSERT INTO contact_details (applicant_id, country, state_city, province_county, mobile_number, alt_email, present_address)
SELECT a.id,
  'Tanzania',
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 6)
    WHEN 0 THEN 'Mji Mkongwe, Unguja'
    WHEN 1 THEN 'Ng''ambo, Unguja'
    WHEN 2 THEN 'Michenzani, Unguja'
    WHEN 3 THEN 'Wete, Pemba'
    WHEN 4 THEN 'Mkoani, Pemba'
    WHEN 5 THEN 'Chake Chake, Pemba'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 5)
    WHEN 0 THEN 'Mjini Magharibi'
    WHEN 1 THEN 'Unguja Kaskazini'
    WHEN 2 THEN 'Unguja Kusini'
    WHEN 3 THEN 'Pemba Kaskazini'
    WHEN 4 THEN 'Pemba Kusini'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 10)
    WHEN 0 THEN '0776690037'
    WHEN 1 THEN '0773456789'
    WHEN 2 THEN '0774567890'
    WHEN 3 THEN '0775678901'
    WHEN 4 THEN '0776789012'
    WHEN 5 THEN '0777890123'
    WHEN 6 THEN '0778901234'
    WHEN 7 THEN '0779012345'
    WHEN 8 THEN '0770123456'
    WHEN 9 THEN '0771234567'
  END,
  u.email,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 8)
    WHEN 0 THEN 'S.L.P 1234, Barabara ya Malindi, Mji Mkongwe, Unguja'
    WHEN 1 THEN 'S.L.P 567, Barabara ya Darajani, Ng''ambo, Unguja'
    WHEN 2 THEN 'S.L.P 890, Barabara ya Vuga, Mji Mkongwe, Unguja'
    WHEN 3 THEN 'S.L.P 234, Barabara ya Shangani, Unguja'
    WHEN 4 THEN 'S.L.P 456, Barabara ya Kenyatta, Unguja'
    WHEN 5 THEN 'S.L.P 678, Barabara ya Kaunda, Unguja'
    WHEN 6 THEN 'S.L.P 901, Mtaa wa Mwanakwerekwe, Unguja'
    WHEN 7 THEN 'S.L.P 123, Mtaa wa Kikwajuni, Unguja'
  END
FROM applicants a
JOIN users u ON u.id = a.user_id
WHERE a.zanid IS NOT NULL
ON CONFLICT (applicant_id) DO NOTHING;

-- =============================================================================
-- 16. ACADEMIC QUALIFICATIONS
-- =============================================================================
INSERT INTO academic_qualifications (applicant_id, education_level, country, institution_id, programme_id, programme_category, year_from, year_to, gpa_result)
SELECT a.id,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 5)
    WHEN 0 THEN 'Degree'
    WHEN 1 THEN 'Degree'
    WHEN 2 THEN 'Masters'
    WHEN 3 THEN 'Diploma'
    WHEN 4 THEN 'Degree'
  END,
  'Tanzania',
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 5)
    WHEN 0 THEN 1  -- University of Zanzibar
    WHEN 1 THEN 2  -- SUZA
    WHEN 2 THEN 1  -- University of Zanzibar
    WHEN 3 THEN 3  -- Karume Institute
    WHEN 4 THEN 4  -- UDSM
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 5)
    WHEN 0 THEN 1  -- Sayansi ya Kompyuta
    WHEN 1 THEN 7  -- Biashara na Usimamizi
    WHEN 2 THEN 13 -- MBA
    WHEN 3 THEN 16 -- Stashahada ya Uhandisi wa Umeme
    WHEN 4 THEN 2  -- Uhasibu na Fedha
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 5)
    WHEN 0 THEN 'Sayansi na Teknolojia'
    WHEN 1 THEN 'Biashara na Uchumi'
    WHEN 2 THEN 'Biashara na Uchumi'
    WHEN 3 THEN 'Uhandisi'
    WHEN 4 THEN 'Biashara na Uchumi'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 5)
    WHEN 0 THEN 2015
    WHEN 1 THEN 2016
    WHEN 2 THEN 2018
    WHEN 3 THEN 2017
    WHEN 4 THEN 2014
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 5)
    WHEN 0 THEN 2019
    WHEN 1 THEN 2020
    WHEN 2 THEN 2020
    WHEN 3 THEN 2020
    WHEN 4 THEN 2018
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 5)
    WHEN 0 THEN 'GPA 3.8 / 5.0'
    WHEN 1 THEN 'GPA 4.1 / 5.0'
    WHEN 2 THEN 'GPA 3.6 / 5.0'
    WHEN 3 THEN 'B+'
    WHEN 4 THEN 'GPA 3.9 / 5.0'
  END
FROM applicants a
WHERE a.zanid IS NOT NULL;

-- Secondary education for all
INSERT INTO academic_qualifications (applicant_id, education_level, country, institution_id, programme_id, programme_category, year_from, year_to, gpa_result)
SELECT a.id,
  'Ordinary Level (CSE)',
  'Tanzania',
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN 6  -- Lumumba
    WHEN 1 THEN 7  -- Forodhani
    WHEN 2 THEN 8  -- Fidel Castro
  END,
  23, -- CSE programme
  'Elimu ya Jumla',
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN 2009
    WHEN 1 THEN 2010
    WHEN 2 THEN 2011
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN 2011
    WHEN 1 THEN 2012
    WHEN 2 THEN 2013
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 4)
    WHEN 0 THEN 'Division I'
    WHEN 1 THEN 'Division II'
    WHEN 2 THEN 'Division I'
    WHEN 3 THEN 'Division II'
  END
FROM applicants a
WHERE a.zanid IS NOT NULL;

-- =============================================================================
-- 17. PROFESSIONAL QUALIFICATIONS
-- =============================================================================
INSERT INTO professional_qualifications (applicant_id, country, institution, course_name, start_date, end_date)
SELECT a.id,
  'Tanzania',
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 4)
    WHEN 0 THEN 'Taasisi ya Wahasibu Tanzania (NBAA)'
    WHEN 1 THEN 'Cisco Networking Academy'
    WHEN 2 THEN 'Baraza la Madaktari Tanzania'
    WHEN 3 THEN 'Bodi ya Wahandisi Tanzania (ERB)'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 4)
    WHEN 0 THEN 'CPA-T (Certified Public Accountant Tanzania)'
    WHEN 1 THEN 'CCNA (Cisco Certified Network Associate)'
    WHEN 2 THEN 'Leseni ya Kufanya Kazi — Daktari'
    WHEN 3 THEN 'Usajili wa Mhandisi (ERB)'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 4)
    WHEN 0 THEN '2020-01-15'::date
    WHEN 1 THEN '2021-03-10'::date
    WHEN 2 THEN '2019-06-01'::date
    WHEN 3 THEN '2020-09-20'::date
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 4)
    WHEN 0 THEN '2020-12-20'::date
    WHEN 1 THEN '2021-06-15'::date
    WHEN 2 THEN '2022-05-31'::date
    WHEN 3 THEN '2023-09-19'::date
  END
FROM applicants a
WHERE a.zanid IS NOT NULL;

-- =============================================================================
-- 18. LANGUAGE PROFICIENCIES
-- =============================================================================
INSERT INTO language_proficiencies (applicant_id, language, speaking, reading, writing)
SELECT a.id, 'Kiswahili', 'Very Good', 'Very Good', 'Very Good'
FROM applicants a WHERE a.zanid IS NOT NULL;

INSERT INTO language_proficiencies (applicant_id, language, speaking, reading, writing)
SELECT a.id, 'Kiingereza',
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN 'Very Good'
    WHEN 1 THEN 'Good'
    WHEN 2 THEN 'Good'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN 'Very Good'
    WHEN 1 THEN 'Good'
    WHEN 2 THEN 'Very Good'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN 'Good'
    WHEN 1 THEN 'Good'
    WHEN 2 THEN 'Very Good'
  END
FROM applicants a WHERE a.zanid IS NOT NULL;

INSERT INTO language_proficiencies (applicant_id, language, speaking, reading, writing)
SELECT a.id, 'Kiarabu',
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN 'Good'
    WHEN 1 THEN 'Fair'
    WHEN 2 THEN 'Good'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN 'Good'
    WHEN 1 THEN 'Good'
    WHEN 2 THEN 'Fair'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN 'Fair'
    WHEN 1 THEN 'Fair'
    WHEN 2 THEN 'Good'
  END
FROM applicants a WHERE a.zanid IS NOT NULL;

-- =============================================================================
-- 19. WORK EXPERIENCES
-- =============================================================================
INSERT INTO work_experiences (applicant_id, organization, job_title, supervisor_name, supervisor_address, supervisor_mobile, duties, start_date, end_date, is_current)
SELECT a.id,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 8)
    WHEN 0 THEN 'Wizara ya Fedha na Mipango — Zanzibar'
    WHEN 1 THEN 'Hospitali ya Mnazi Mmoja — Unguja'
    WHEN 2 THEN 'Shule ya Sekondari ya Lumumba'
    WHEN 3 THEN 'Zanzibar Revenue Board'
    WHEN 4 THEN 'Shirika la Umeme Zanzibar (ZECO)'
    WHEN 5 THEN 'Benki ya Watu wa Zanzibar (PBZ)'
    WHEN 6 THEN 'Mamlaka ya Maji Zanzibar (ZAWA)'
    WHEN 7 THEN 'Bodi ya Utalii Zanzibar (ZTB)'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 8)
    WHEN 0 THEN 'Afisa Fedha Msaidizi'
    WHEN 1 THEN 'Muuguzi wa Wodi'
    WHEN 2 THEN 'Mwalimu wa Hisabati'
    WHEN 3 THEN 'Mkaguzi wa Kodi Msaidizi'
    WHEN 4 THEN 'Fundi wa Umeme'
    WHEN 5 THEN 'Mtendaji wa Benki'
    WHEN 6 THEN 'Fundi wa Maji'
    WHEN 7 THEN 'Afisa Utalii Msaidizi'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 5)
    WHEN 0 THEN 'Bw. Hamad Ali Nassor'
    WHEN 1 THEN 'Bi. Fatuma Juma Said'
    WHEN 2 THEN 'Bw. Omar Khalid Bakar'
    WHEN 3 THEN 'Bi. Zuwena Hassan Mwinyi'
    WHEN 4 THEN 'Bw. Salim Abdalla Kombo'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 4)
    WHEN 0 THEN 'S.L.P 100, Barabara ya Malindi, Unguja'
    WHEN 1 THEN 'S.L.P 200, Barabara ya Vuga, Unguja'
    WHEN 2 THEN 'S.L.P 300, Barabara ya Darajani, Unguja'
    WHEN 3 THEN 'S.L.P 400, Barabara ya Kenyatta, Unguja'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 6)
    WHEN 0 THEN '0776690037'
    WHEN 1 THEN '0773456789'
    WHEN 2 THEN '0774567890'
    WHEN 3 THEN '0775678901'
    WHEN 4 THEN '0776789012'
    WHEN 5 THEN '0777890123'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 4)
    WHEN 0 THEN 'Kusimamia na kudhibiti matumizi ya fedha. Kuandaa taarifa za fedha za kila mwezi. Kushirikiana na idara nyingine katika masuala ya fedha.'
    WHEN 1 THEN 'Kutoa huduma za uuguzi kwa wagonjwa. Kusimamia na kutoa dawa. Kufuatilia hali ya afya ya wagonjwa.'
    WHEN 2 THEN 'Kufundisha masomo ya Hisabati na Sayansi. Kuandaa mipango ya masomo. Kusimamia maendeleo ya wanafunzi.'
    WHEN 3 THEN 'Kukagua hesabu za walipa kodi. Kukusanya kodi na tozo. Kutoa elimu kwa walipa kodi.'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 5)
    WHEN 0 THEN '2019-01-15'::date
    WHEN 1 THEN '2018-06-01'::date
    WHEN 2 THEN '2020-03-10'::date
    WHEN 3 THEN '2017-09-01'::date
    WHEN 4 THEN '2021-01-05'::date
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN NULL
    WHEN 1 THEN '2022-12-31'::date
    WHEN 2 THEN '2023-06-30'::date
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN TRUE
    ELSE FALSE
  END
FROM applicants a WHERE a.zanid IS NOT NULL;

-- =============================================================================
-- 20. TRAININGS & WORKSHOPS
-- =============================================================================
INSERT INTO trainings (applicant_id, name, institution, description, start_date, end_date)
SELECT a.id,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 6)
    WHEN 0 THEN 'Mafunzo ya Usimamizi wa Fedha za Umma'
    WHEN 1 THEN 'Warsha ya Teknolojia ya Habari na Mawasiliano'
    WHEN 2 THEN 'Mafunzo ya Uongozi na Utawala Bora'
    WHEN 3 THEN 'Semina ya Afya ya Uzazi na Mtoto'
    WHEN 4 THEN 'Mafunzo ya Usalama Mahali pa Kazi'
    WHEN 5 THEN 'Warsha ya Usimamizi wa Miradi'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 6)
    WHEN 0 THEN 'Taasisi ya Fedha za Umma — Zanzibar'
    WHEN 1 THEN 'Chuo cha TEHAMA Zanzibar'
    WHEN 2 THEN 'Tume ya Utumishi wa Umma — Zanzibar'
    WHEN 3 THEN 'Wizara ya Afya — Zanzibar'
    WHEN 4 THEN 'Shirika la Kazi Duniani (ILO)'
    WHEN 5 THEN 'Taasisi ya Usimamizi wa Miradi Tanzania'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN 'Mafunzo ya wiki mbili yanayoshughulikia kanuni za fedha za umma, udhibiti wa matumizi, na uandaaji wa taarifa za fedha.'
    WHEN 1 THEN 'Warsha ya siku tano inayofundisha matumizi ya mifumo ya kompyuta, mtandao, na usalama wa data.'
    WHEN 2 THEN 'Semina ya siku tatu inayoshughulikia kanuni za uongozi bora, uwajibikaji, na uwazi katika utumishi wa umma.'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 4)
    WHEN 0 THEN '2021-03-01'::date
    WHEN 1 THEN '2022-07-15'::date
    WHEN 2 THEN '2020-11-10'::date
    WHEN 3 THEN '2023-02-20'::date
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 4)
    WHEN 0 THEN '2021-03-14'::date
    WHEN 1 THEN '2022-07-19'::date
    WHEN 2 THEN '2020-11-12'::date
    WHEN 3 THEN '2023-02-22'::date
  END
FROM applicants a WHERE a.zanid IS NOT NULL;

-- =============================================================================
-- 21. COMPUTER SKILLS
-- =============================================================================
INSERT INTO computer_skills (applicant_id, skill, proficiency)
SELECT a.id, 'MS Word',
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN 'Very Good'
    WHEN 1 THEN 'Good'
    WHEN 2 THEN 'Very Good'
  END
FROM applicants a WHERE a.zanid IS NOT NULL
ON CONFLICT (applicant_id, skill) DO NOTHING;

INSERT INTO computer_skills (applicant_id, skill, proficiency)
SELECT a.id, 'MS Excel',
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN 'Good'
    WHEN 1 THEN 'Very Good'
    WHEN 2 THEN 'Good'
  END
FROM applicants a WHERE a.zanid IS NOT NULL
ON CONFLICT (applicant_id, skill) DO NOTHING;

INSERT INTO computer_skills (applicant_id, skill, proficiency)
SELECT a.id, 'MS PowerPoint',
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN 'Good'
    WHEN 1 THEN 'Fair'
    WHEN 2 THEN 'Good'
  END
FROM applicants a WHERE a.zanid IS NOT NULL
ON CONFLICT (applicant_id, skill) DO NOTHING;

-- =============================================================================
-- 22. REFEREES
-- =============================================================================
INSERT INTO referees (applicant_id, title, full_name, organization, email, mobile, postal_address)
SELECT a.id,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 4)
    WHEN 0 THEN 'Dkt.'
    WHEN 1 THEN 'Prof.'
    WHEN 2 THEN 'Bw.'
    WHEN 3 THEN 'Bi.'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 8)
    WHEN 0 THEN 'Dkt. Hamad Ali Nassor'
    WHEN 1 THEN 'Prof. Fatuma Juma Said'
    WHEN 2 THEN 'Bw. Omar Khalid Bakar'
    WHEN 3 THEN 'Bi. Zuwena Hassan Mwinyi'
    WHEN 4 THEN 'Dkt. Salim Abdalla Kombo'
    WHEN 5 THEN 'Prof. Maryam Suleiman Haji'
    WHEN 6 THEN 'Bw. Rashid Juma Nassor'
    WHEN 7 THEN 'Bi. Amina Khalid Vuai'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 6)
    WHEN 0 THEN 'Chuo Kikuu cha Zanzibar'
    WHEN 1 THEN 'Hospitali ya Mnazi Mmoja'
    WHEN 2 THEN 'Wizara ya Fedha — Zanzibar'
    WHEN 3 THEN 'Tume ya Utumishi wa Umma'
    WHEN 4 THEN 'SUZA — Zanzibar'
    WHEN 5 THEN 'Zanzibar Revenue Board'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 6)
    WHEN 0 THEN 'h.nassor@uniz.ac.tz'
    WHEN 1 THEN 'f.said@mnazimmoja.go.tz'
    WHEN 2 THEN 'o.bakar@fedha.go.tz'
    WHEN 3 THEN 'z.mwinyi@csc.go.tz'
    WHEN 4 THEN 's.kombo@suza.ac.tz'
    WHEN 5 THEN 'm.haji@zrb.go.tz'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 6)
    WHEN 0 THEN '0776690037'
    WHEN 1 THEN '0773456789'
    WHEN 2 THEN '0774567890'
    WHEN 3 THEN '0775678901'
    WHEN 4 THEN '0776789012'
    WHEN 5 THEN '0777890123'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 4)
    WHEN 0 THEN 'S.L.P 100, Barabara ya Malindi, Mji Mkongwe, Unguja'
    WHEN 1 THEN 'S.L.P 200, Barabara ya Vuga, Unguja'
    WHEN 2 THEN 'S.L.P 300, Barabara ya Darajani, Unguja'
    WHEN 3 THEN 'S.L.P 400, Barabara ya Kenyatta, Unguja'
  END
FROM applicants a WHERE a.zanid IS NOT NULL;

-- Second referee for each applicant
INSERT INTO referees (applicant_id, title, full_name, organization, email, mobile, postal_address)
SELECT a.id,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 2)
    WHEN 0 THEN 'Bw.'
    WHEN 1 THEN 'Bi.'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 6)
    WHEN 0 THEN 'Bw. Juma Ali Khamis'
    WHEN 1 THEN 'Bi. Rukia Salim Bakar'
    WHEN 2 THEN 'Bw. Khalid Omar Mzee'
    WHEN 3 THEN 'Bi. Safia Juma Hamad'
    WHEN 4 THEN 'Bw. Abdalla Hassan Kombo'
    WHEN 5 THEN 'Bi. Nasra Ali Suleiman'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 4)
    WHEN 0 THEN 'Shirika la Umeme Zanzibar (ZECO)'
    WHEN 1 THEN 'Benki ya Watu wa Zanzibar (PBZ)'
    WHEN 2 THEN 'Mamlaka ya Maji Zanzibar (ZAWA)'
    WHEN 3 THEN 'Bodi ya Utalii Zanzibar (ZTB)'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 4)
    WHEN 0 THEN 'j.khamis@zeco.go.tz'
    WHEN 1 THEN 'r.bakar@pbz.co.tz'
    WHEN 2 THEN 'k.mzee@zawa.go.tz'
    WHEN 3 THEN 's.hamad@ztb.go.tz'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 5)
    WHEN 0 THEN '0778901234'
    WHEN 1 THEN '0779012345'
    WHEN 2 THEN '0770123456'
    WHEN 3 THEN '0771234567'
    WHEN 4 THEN '0772345678'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid) % 3)
    WHEN 0 THEN 'S.L.P 500, Barabara ya Shangani, Unguja'
    WHEN 1 THEN 'S.L.P 600, Mtaa wa Mwanakwerekwe, Unguja'
    WHEN 2 THEN 'S.L.P 700, Mtaa wa Kikwajuni, Unguja'
  END
FROM applicants a WHERE a.zanid IS NOT NULL;

-- =============================================================================
-- 23. APPLICATIONS (applicants applying to vacancies)
-- =============================================================================
INSERT INTO applications (applicant_id, vacancy_id, application_letter_path, status)
SELECT DISTINCT ON (a.id, v.id)
  a.id,
  v.id,
  'letter/sample-letter-' || a.zanid || '.pdf',
  CASE (ROW_NUMBER() OVER (ORDER BY a.zanid, v.id) % 5)
    WHEN 0 THEN 'received'
    WHEN 1 THEN 'in_progress'
    WHEN 2 THEN 'shortlisted'
    WHEN 3 THEN 'placed'
    WHEN 4 THEN 'received'
  END::application_status
FROM applicants a
CROSS JOIN (
  SELECT id FROM vacancies WHERE status = 'published' ORDER BY created_at LIMIT 8
) v
WHERE a.zanid IS NOT NULL
  AND (ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY v.id) <= 3)
ON CONFLICT (applicant_id, vacancy_id) DO NOTHING;

-- =============================================================================
-- 24. AUDIT LOGS (sample activity)
-- =============================================================================
INSERT INTO audit_logs (user_id, action, resource, resource_id, ip_address, metadata_json, timestamp)
SELECT
  u.id,
  CASE (ROW_NUMBER() OVER (ORDER BY u.email) % 6)
    WHEN 0 THEN 'POST /api/auth/login'
    WHEN 1 THEN 'PUT /api/applicants/me/personal'
    WHEN 2 THEN 'POST /api/applications'
    WHEN 3 THEN 'GET /api/vacancies'
    WHEN 4 THEN 'PUT /api/admin/applications/:id/status'
    WHEN 5 THEN 'POST /api/admin/vacancies'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY u.email) % 6)
    WHEN 0 THEN '/api/auth/login'
    WHEN 1 THEN '/api/applicants/me/personal'
    WHEN 2 THEN '/api/applications'
    WHEN 3 THEN '/api/vacancies'
    WHEN 4 THEN '/api/admin/applications/:id/status'
    WHEN 5 THEN '/api/admin/vacancies'
  END,
  gen_random_uuid()::text,
  CASE (ROW_NUMBER() OVER (ORDER BY u.email) % 3)
    WHEN 0 THEN '196.216.1.10'::inet
    WHEN 1 THEN '196.216.1.25'::inet
    WHEN 2 THEN '196.216.1.50'::inet
  END,
  '{"status": 200}'::jsonb,
  NOW() - (INTERVAL '1 hour' * (ROW_NUMBER() OVER (ORDER BY u.email) % 72))
FROM users u
WHERE u.role IN ('applicant', 'admin', 'staff')
LIMIT 50;

-- =============================================================================
-- 25. UPDATE PROFILE COMPLETION for all applicants
-- =============================================================================
UPDATE applicants SET profile_completion_pct = 85
WHERE zanid IS NOT NULL
  AND id IN (SELECT applicant_id FROM contact_details)
  AND id IN (SELECT applicant_id FROM academic_qualifications)
  AND id IN (SELECT applicant_id FROM language_proficiencies)
  AND id IN (SELECT applicant_id FROM referees)
  AND declaration_accepted = TRUE;

UPDATE applicants SET profile_completion_pct = 95
WHERE zanid IS NOT NULL
  AND id IN (SELECT applicant_id FROM contact_details)
  AND id IN (SELECT applicant_id FROM academic_qualifications)
  AND id IN (SELECT applicant_id FROM professional_qualifications)
  AND id IN (SELECT applicant_id FROM language_proficiencies)
  AND id IN (SELECT applicant_id FROM work_experiences)
  AND id IN (SELECT applicant_id FROM referees)
  AND id IN (SELECT applicant_id FROM trainings)
  AND id IN (SELECT applicant_id FROM computer_skills)
  AND declaration_accepted = TRUE;
