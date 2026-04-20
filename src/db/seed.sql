DELETE FROM profiles;

INSERT INTO profiles (
  id,
  name,
  gender,
  gender_probability,
  sample_size,
  age,
  age_group,
  country_id,
  country_probability,
  created_at
) VALUES
  ('018f3f64-7b7c-7d5f-9f1e-b19f9f0e2a10', 'emmanuel', 'male', 99, 1200, 25, 'adult', 'NG', 84, '2026-04-01T12:00:00.000Z'),
  ('018f3f64-7b7c-7d5f-9f1e-b19f9f0e2a11', 'sarah', 'female', 98, 1100, 28, 'adult', 'NG', 78, '2026-04-02T12:00:00.000Z'),
  ('018f3f64-7b7c-7d5f-9f1e-b19f9f0e2a12', 'john', 'male', 97, 980, 33, 'adult', 'KE', 72, '2026-04-03T12:00:00.000Z'),
  ('018f3f64-7b7c-7d5f-9f1e-b19f9f0e2a13', 'amina', 'female', 96, 1020, 18, 'teenager', 'TZ', 69, '2026-04-04T12:00:00.000Z'),
  ('018f3f64-7b7c-7d5f-9f1e-b19f9f0e2a14', 'musa', 'male', 95, 890, 29, 'adult', 'GH', 74, '2026-04-05T12:00:00.000Z'),
  ('018f3f64-7b7c-7d5f-9f1e-b19f9f0e2a15', 'grace', 'female', 94, 760, 22, 'adult', 'UG', 68, '2026-04-06T12:00:00.000Z'),
  ('018f3f64-7b7c-7d5f-9f1e-b19f9f0e2a16', 'daniel', 'male', 93, 840, 41, 'adult', 'ZA', 65, '2026-04-07T12:00:00.000Z'),
  ('018f3f64-7b7c-7d5f-9f1e-b19f9f0e2a17', 'faith', 'female', 92, 910, 24, 'adult', 'RW', 66, '2026-04-08T12:00:00.000Z'),
  ('018f3f64-7b7c-7d5f-9f1e-b19f9f0e2a18', 'isaac', 'male', 91, 700, 19, 'teenager', 'CM', 60, '2026-04-09T12:00:00.000Z'),
  ('018f3f64-7b7c-7d5f-9f1e-b19f9f0e2a19', 'tobi', 'male', 90, 680, 16, 'teenager', 'NG', 61, '2026-04-10T12:00:00.000Z'),
  ('018f3f64-7b7c-7d5f-9f1e-b19f9f0e2a1a', 'esther', 'female', 89, 640, 30, 'adult', 'KE', 58, '2026-04-11T12:00:00.000Z'),
  ('018f3f64-7b7c-7d5f-9f1e-b19f9f0e2a1b', 'samuel', 'male', 88, 620, 36, 'adult', 'GH', 57, '2026-04-12T12:00:00.000Z');
