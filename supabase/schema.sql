-- Supabase Database Schema for Infinite Tutor
-- Run this in Supabase SQL Editor

-- User Courses table
CREATE TABLE IF NOT EXISTS user_courses (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    course_id TEXT NOT NULL,
    title TEXT NOT NULL,
    topic TEXT,
    level TEXT,
    progress_percent INTEGER DEFAULT 0,
    chapters_json TEXT,
    last_accessed TEXT NOT NULL,
    UNIQUE(user_email, course_id)
);

-- Lessons cache table
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    course_id TEXT NOT NULL,
    lesson_title TEXT NOT NULL,
    topic TEXT NOT NULL,
    level TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    mermaid_code TEXT,
    explanation TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(course_id, lesson_title)
);

-- User Notes table
CREATE TABLE IF NOT EXISTS user_notes (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    course_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    content TEXT,
    updated_at TEXT NOT NULL,
    UNIQUE(user_email, course_id, lesson_id)
);

-- User Activity table (for streaks and stats)
CREATE TABLE IF NOT EXISTS user_activity (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    activity_date TEXT NOT NULL,
    minutes_studied INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    daily_goal_minutes INTEGER DEFAULT 30,
    UNIQUE(user_email, activity_date)
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (Edge Functions use service role)
-- These allow Edge Functions to access all data

CREATE POLICY "Service role can access all user_courses" ON user_courses
    FOR ALL USING (true);

CREATE POLICY "Service role can access all lessons" ON lessons
    FOR ALL USING (true);

CREATE POLICY "Service role can access all user_notes" ON user_notes
    FOR ALL USING (true);

CREATE POLICY "Service role can access all user_activity" ON user_activity
    FOR ALL USING (true);
