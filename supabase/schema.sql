-- ============================================
-- LLM Brand Monitor - Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- API Settings Table
-- Stores encrypted API keys for each user
-- ============================================
CREATE TABLE IF NOT EXISTS api_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    openai_key_encrypted TEXT,
    gemini_key_encrypted TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_api_settings_user_id ON api_settings(user_id);

-- ============================================
-- Projects Table
-- Stores brand monitoring projects
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    prompts TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);

-- ============================================
-- Executions Table
-- Tracks each scheduled execution run
-- ============================================
CREATE TABLE IF NOT EXISTS executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for executions
CREATE INDEX IF NOT EXISTS idx_executions_project_id ON executions(project_id);
CREATE INDEX IF NOT EXISTS idx_executions_executed_at ON executions(executed_at);
CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);

-- ============================================
-- Responses Table
-- Stores raw LLM responses
-- ============================================
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    prompt_index INTEGER NOT NULL,
    prompt_text TEXT NOT NULL,
    llm_provider VARCHAR(20) NOT NULL CHECK (llm_provider IN ('openai', 'gemini')),
    llm_model VARCHAR(100) NOT NULL,
    response_text TEXT NOT NULL,
    response_time_ms INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for responses
CREATE INDEX IF NOT EXISTS idx_responses_execution_id ON responses(execution_id);
CREATE INDEX IF NOT EXISTS idx_responses_project_id ON responses(project_id);
CREATE INDEX IF NOT EXISTS idx_responses_llm_provider ON responses(llm_provider);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at);

-- ============================================
-- Analysis Results Table
-- Stores analyzed metrics from responses
-- ============================================
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    brand_mentioned BOOLEAN NOT NULL DEFAULT FALSE,
    mention_count INTEGER NOT NULL DEFAULT 0,
    sentiment_score DECIMAL(5,4) NOT NULL DEFAULT 0 CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    sentiment_label VARCHAR(20) NOT NULL DEFAULT 'neutral' CHECK (sentiment_label IN ('positive', 'neutral', 'negative')),
    prominence_score DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (prominence_score >= 0 AND prominence_score <= 100),
    warmth_score DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (warmth_score >= 0 AND warmth_score <= 100),
    analysis_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analysis_results
CREATE INDEX IF NOT EXISTS idx_analysis_results_response_id ON analysis_results(response_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_project_id ON analysis_results(project_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_execution_id ON analysis_results(execution_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_brand_mentioned ON analysis_results(brand_mentioned);
CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at ON analysis_results(created_at);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for api_settings
DROP TRIGGER IF EXISTS update_api_settings_updated_at ON api_settings;
CREATE TRIGGER update_api_settings_updated_at
    BEFORE UPDATE ON api_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Policies for api_settings (users can only see their own)
CREATE POLICY "Users can view own api_settings" ON api_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own api_settings" ON api_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own api_settings" ON api_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for projects
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for executions (based on project ownership)
CREATE POLICY "Users can view own executions" ON executions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = executions.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Policies for responses
CREATE POLICY "Users can view own responses" ON responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = responses.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Policies for analysis_results
CREATE POLICY "Users can view own analysis_results" ON analysis_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = analysis_results.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Service role bypass for cron jobs (service role bypasses RLS by default)
-- No additional policies needed

-- ============================================
-- Views for Dashboard
-- ============================================

-- Weekly aggregated metrics view
CREATE OR REPLACE VIEW weekly_metrics AS
SELECT
    ar.project_id,
    r.llm_provider,
    DATE_TRUNC('week', ar.created_at) AS week_start,
    COUNT(*) AS total_responses,
    SUM(CASE WHEN ar.brand_mentioned THEN 1 ELSE 0 END) AS brand_mentions,
    ROUND(AVG(CASE WHEN ar.brand_mentioned THEN 1.0 ELSE 0.0 END) * 100, 2) AS appearance_rate,
    ROUND(AVG(ar.sentiment_score)::numeric, 4) AS avg_sentiment,
    ROUND(AVG(ar.prominence_score)::numeric, 2) AS avg_prominence,
    ROUND(AVG(ar.warmth_score)::numeric, 2) AS avg_warmth,
    SUM(ar.mention_count) AS total_mention_count
FROM analysis_results ar
JOIN responses r ON r.id = ar.response_id
GROUP BY ar.project_id, r.llm_provider, DATE_TRUNC('week', ar.created_at)
ORDER BY week_start DESC;

-- Latest execution status per project
CREATE OR REPLACE VIEW latest_executions AS
SELECT DISTINCT ON (project_id)
    id,
    project_id,
    executed_at,
    status,
    error_message
FROM executions
ORDER BY project_id, executed_at DESC;
