-- Add gate_citations column to papers table
ALTER TABLE papers ADD COLUMN IF NOT EXISTS gate_citations boolean DEFAULT false;
