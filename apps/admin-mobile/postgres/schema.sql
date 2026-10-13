-- ==============================================================================
-- Vidya Learning Platform: Dedicated PostgreSQL Database Schema
-- Academic Year: 2026–2027 | Andhra Pradesh State Board (SCERT AP)
-- Supported Classes: Classes 6, 7, 8, 9, 10
-- Pure PostgreSQL (No Supabase dependencies)
-- ==============================================================================

-- Enable standard pgcrypto or uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ACADEMIC BOARDS & YEARS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS boards (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(128) NOT NULL,
    code VARCHAR(64) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS academic_years (
    id VARCHAR(64) PRIMARY KEY,
    board_id VARCHAR(64) REFERENCES boards(id) ON DELETE CASCADE,
    year_label VARCHAR(64) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. SCHOOL CLASSES (Classes 6 to 10)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(64) PRIMARY KEY,
    board_id VARCHAR(64) REFERENCES boards(id) ON DELETE SET NULL,
    class_number INTEGER NOT NULL CHECK (class_number BETWEEN 1 AND 12),
    name VARCHAR(128) NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    academic_year VARCHAR(64) DEFAULT '2026-2027',
    display_order INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. CURRICULUM SUBJECTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(64) PRIMARY KEY,
    class_id VARCHAR(64) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    icon_name VARCHAR(64) DEFAULT 'BookOpen',
    theme_color VARCHAR(32) DEFAULT '#B95D3F',
    language VARCHAR(64) DEFAULT 'English',
    display_order INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_class_subject_code UNIQUE(class_id, code)
);

-- ------------------------------------------------------------------------------
-- 4. CHAPTERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chapters (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    summary TEXT,
    learning_objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
    estimated_hours NUMERIC(4, 1) DEFAULT 4.0,
    display_order INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_subject_chapter_number UNIQUE(subject_id, chapter_number)
);

-- ------------------------------------------------------------------------------
-- 5. SECTIONS / TOPICS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(64) PRIMARY KEY,
    chapter_id VARCHAR(64) NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    section_number VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. LEARNING & LECTURE MATERIALS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_materials (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    material_type VARCHAR(32) NOT NULL CHECK (material_type IN ('pdf', 'video', 'notes', 'ppt', 'image', 'link', 'quiz')),
    status VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    
    class_id VARCHAR(64) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    chapter_id VARCHAR(64) NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    section_id VARCHAR(64) REFERENCES sections(id) ON DELETE SET NULL,
    
    language VARCHAR(64) DEFAULT 'English',
    display_order INTEGER NOT NULL DEFAULT 1,
    
    file_url TEXT,
    file_name VARCHAR(255),
    file_size_bytes BIGINT,
    mime_type VARCHAR(128),
    external_url TEXT,
    thumbnail_url TEXT,
    content_notes TEXT,
    
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. ADMIN USERS & AUDIT LOGS (Direct PostgreSQL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) DEFAULT 'ADMIN',
    department VARCHAR(128) DEFAULT 'Curriculum & Materials',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    performed_by VARCHAR(255) DEFAULT 'admin@vidya.edu.in',
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 8. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_classes_order ON classes(display_order);
CREATE INDEX IF NOT EXISTS idx_subjects_class ON subjects(class_id, display_order);
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject_id, display_order);
CREATE INDEX IF NOT EXISTS idx_sections_chapter ON sections(chapter_id, display_order);
CREATE INDEX IF NOT EXISTS idx_materials_hierarchy ON learning_materials(class_id, subject_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_materials_status ON learning_materials(status);
CREATE INDEX IF NOT EXISTS idx_materials_type ON learning_materials(material_type);

-- ------------------------------------------------------------------------------
-- 9. CURRICULUM HIERARCHY REPORTING VIEW
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_curriculum_hierarchy AS
SELECT 
    c.id AS class_id,
    c.name AS class_name,
    c.class_number,
    s.id AS subject_id,
    s.name AS subject_name,
    s.code AS subject_code,
    ch.id AS chapter_id,
    ch.chapter_number,
    ch.title AS chapter_title,
    sec.id AS section_id,
    sec.section_number,
    sec.title AS section_title,
    COUNT(lm.id) AS materials_count,
    COUNT(CASE WHEN lm.status = 'published' THEN 1 END) AS published_materials_count
FROM classes c
LEFT JOIN subjects s ON s.class_id = c.id
LEFT JOIN chapters ch ON ch.subject_id = s.id
LEFT JOIN sections sec ON sec.chapter_id = ch.id
LEFT JOIN learning_materials lm ON lm.chapter_id = ch.id
GROUP BY c.id, c.name, c.class_number, s.id, s.name, s.code, ch.id, ch.chapter_number, ch.title, sec.id, sec.section_number, sec.title
ORDER BY c.class_number, s.display_order, ch.chapter_number, sec.display_order;

-- ------------------------------------------------------------------------------
-- 10. SEED INITIAL CURRICULUM (SCERT Andhra Pradesh 2026-2027)
-- ------------------------------------------------------------------------------
INSERT INTO boards (id, name, state, code, description)
VALUES ('ap-scert', 'Board of Secondary Education, Andhra Pradesh (SCERT AP)', 'Andhra Pradesh', 'AP-SCERT', 'Official curriculum for AP State Board schools')
ON CONFLICT (id) DO NOTHING;

INSERT INTO academic_years (id, board_id, year_label, is_active, start_date, end_date)
VALUES ('ay-2026-2027', 'ap-scert', '2026–2027', TRUE, '2026-06-12', '2027-04-24')
ON CONFLICT (id) DO NOTHING;

-- Classes 6 to 10
INSERT INTO classes (id, board_id, class_number, name, display_name, academic_year, display_order)
VALUES 
    ('class-6', 'ap-scert', 6, 'Class 6', 'Class 6 · AP SCERT', '2026-2027', 1),
    ('class-7', 'ap-scert', 7, 'Class 7', 'Class 7 · AP SCERT', '2026-2027', 2),
    ('class-8', 'ap-scert', 8, 'Class 8', 'Class 8 · AP SCERT', '2026-2027', 3),
    ('class-9', 'ap-scert', 9, 'Class 9', 'Class 9 · AP SCERT', '2026-2027', 4),
    ('class-10', 'ap-scert', 10, 'Class 10', 'Class 10 (SSC) · AP SCERT', '2026-2027', 5)
ON CONFLICT (id) DO NOTHING;

-- Class 10 Subjects
INSERT INTO subjects (id, class_id, code, name, description, icon_name, theme_color, language, display_order)
VALUES 
    ('subj-10-math', 'class-10', 'MATH', 'Mathematics', 'Real Numbers, Sets, Polynomials, Quadratic Equations, Trigonometry', 'Calculator', '#B95D3F', 'English / Telugu', 1),
    ('subj-10-ps', 'class-10', 'PS', 'Physical Science', 'Light, Chemical Equations, Electric Current, Periodic Classification', 'Flame', '#B95D3F', 'English / Telugu', 2),
    ('subj-10-bs', 'class-10', 'BS', 'Biological Science', 'Nutrition, Respiration, Transportation, Excretion, Coordination', 'Dna', '#B95D3F', 'English / Telugu', 3),
    ('subj-10-social', 'class-10', 'SOC', 'Social Studies', 'India: Relief Features, Climate, Rivers, The World Between Wars', 'Compass', '#B95D3F', 'English / Telugu', 4),
    ('subj-10-eng', 'class-10', 'ENG', 'English', 'Reading Comprehension, Grammar, Letter Writing, Essays', 'BookOpen', '#B95D3F', 'English', 5),
    ('subj-10-tel', 'class-10', 'TEL', 'Telugu', 'First Language: Matru Bhasha, Sahityam, Vyakaranam', 'Languages', '#B95D3F', 'Telugu', 6),
    ('subj-10-hin', 'class-10', 'HIN', 'Hindi', 'Second Language: Bhasha, Sahitya, Nibandh', 'Languages', '#B95D3F', 'Hindi', 7)
ON CONFLICT (id) DO NOTHING;

-- Initial Class 10 Math Chapters
INSERT INTO chapters (id, subject_id, chapter_number, title, description, summary, learning_objectives, display_order)
VALUES 
    ('chap-10-math-1', 'subj-10-math', 1, 'Real Numbers', 'Euclid division lemma, Fundamental Theorem of Arithmetic, Logarithms', 'Comprehensive coverage of real number properties, rational/irrational proofs and log operations.', ARRAY['Understand Euclid Division Lemma', 'Apply Fundamental Theorem of Arithmetic', 'Solve logarithms problems'], 1),
    ('chap-10-math-2', 'subj-10-math', 2, 'Sets', 'Sets representation, Venn diagrams, operations on sets', 'Sets concepts, union, intersection and disjoint sets with visual Venn representation.', ARRAY['Describe roster and set-builder forms', 'Draw Venn diagrams for set operations'], 2),
    ('chap-10-math-3', 'subj-10-math', 3, 'Polynomials', 'Zeroes of a polynomial, relationship between zeroes and coefficients', 'Linear, quadratic, and cubic polynomials and their algebraic graphs.', ARRAY['Find roots graphically', 'Apply Remainder Theorem'], 3)
ON CONFLICT (id) DO NOTHING;

-- Initial Class 10 Math Sections
INSERT INTO sections (id, chapter_id, section_number, title, description, display_order)
VALUES 
    ('sec-10-math-1-1', 'chap-10-math-1', '1.1', 'Introduction to Real Numbers', 'Historical perspective and number classification', 1),
    ('sec-10-math-1-2', 'chap-10-math-1', '1.2', 'The Fundamental Theorem of Arithmetic', 'Prime factorisation and theorem verification', 2),
    ('sec-10-math-1-3', 'chap-10-math-1', '1.3', 'Revisiting Irrational Numbers', 'Proof by contradiction of sqrt(2) and sqrt(3)', 3),
    ('sec-10-math-1-4', 'chap-10-math-1', '1.4', 'Properties of Logarithms', 'Laws of logarithms and base conversion', 4)
ON CONFLICT (id) DO NOTHING;

-- Default Admin User
INSERT INTO admin_users (id, email, full_name, role, department)
VALUES ('admin-001-vidya', 'admin@vidya.edu.in', 'Dr. Ramesh Sharma', 'ADMIN', 'Academic Director · AP SCERT Division')
ON CONFLICT (id) DO NOTHING;
