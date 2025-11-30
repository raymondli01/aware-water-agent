-- Add material and installation_date columns to edges table
ALTER TABLE edges 
ADD COLUMN IF NOT EXISTS material text DEFAULT 'Copper',
ADD COLUMN IF NOT EXISTS installation_date date DEFAULT '2010-01-01';

-- Seed data for existing pipes to create diverse risk profiles

-- P1: Old Iron Pipe (High Risk)
UPDATE edges SET material = 'Iron', installation_date = '1985-06-15' WHERE name = 'P1';

-- P2: Old Iron Pipe (High Risk)
UPDATE edges SET material = 'Iron', installation_date = '1988-03-22' WHERE name = 'P2';

-- P3: Mid-aged PVC (Medium Risk)
UPDATE edges SET material = 'PVC', installation_date = '2005-09-10' WHERE name = 'P3';

-- P4: Mid-aged PVC (Medium Risk)
UPDATE edges SET material = 'PVC', installation_date = '2008-11-05' WHERE name = 'P4';

-- P5: Mid-aged Copper (Low-Medium Risk)
UPDATE edges SET material = 'Copper', installation_date = '2012-04-18' WHERE name = 'P5';

-- P6: New PE (Low Risk)
UPDATE edges SET material = 'PE', installation_date = '2020-01-20' WHERE name = 'P6';

-- P7: New PE (Low Risk)
UPDATE edges SET material = 'PE', installation_date = '2021-08-30' WHERE name = 'P7';

-- P8: New Copper (Low Risk)
UPDATE edges SET material = 'Copper', installation_date = '2023-05-12' WHERE name = 'P8';
