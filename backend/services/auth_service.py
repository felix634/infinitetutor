import os
import sqlite3
import secrets
import bcrypt
import resend
from datetime import datetime, timedelta
from typing import Optional, List
from contextlib import contextmanager

DATABASE_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'infinitetutor.db')

# Ensure data directory exists
os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)

@contextmanager
def get_db():
    """Get database connection."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    """Initialize database tables."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                is_verified INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            )
        ''')
        
        # Verification codes table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS verification_codes (
                email TEXT PRIMARY KEY,
                code TEXT NOT NULL,
                expires_at TEXT NOT NULL
            )
        ''')
        
        # Sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        ''')
        
        # User courses table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT NOT NULL,
                course_id TEXT NOT NULL,
                title TEXT NOT NULL,
                topic TEXT,
                level TEXT,
                progress_percent INTEGER DEFAULT 0,
                chapters_json TEXT,
                last_accessed TEXT NOT NULL,
                UNIQUE(user_email, course_id)
            )
        ''')
        
        # Cached lessons table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS lessons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id TEXT NOT NULL,
                lesson_title TEXT NOT NULL,
                topic TEXT NOT NULL,
                level TEXT NOT NULL,
                content_markdown TEXT NOT NULL,
                mermaid_code TEXT,
                explanation TEXT,
                created_at TEXT NOT NULL,
                UNIQUE(course_id, lesson_title)
            )
        ''')
        
        conn.commit()

# Initialize database on import
init_db()

# In-memory cache for pending registrations (email -> password_hash)
pending_registrations = {}

def generate_verification_code() -> str:
    """Generate a 6-digit verification code."""
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

def generate_session_token() -> str:
    """Generate a secure session token."""
    return secrets.token_urlsafe(32)

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def send_verification_email(email: str, code: str) -> bool:
    """Send verification email using Resend."""
    resend_api_key = os.getenv("RESEND_API_KEY")
    
    if not resend_api_key:
        print(f"\n{'='*50}")
        print(f"📧 VERIFICATION CODE FOR {email}")
        print(f"   Code: {code}")
        print(f"{'='*50}\n")
        return True
    
    try:
        resend.api_key = resend_api_key
        from_email = os.getenv("FROM_EMAIL", "onboarding@resend.dev")
        
        params = {
            "from": f"InfiniteTutor <{from_email}>",
            "to": [email],
            "subject": "Your InfiniteTutor verification code",
            "html": f"""
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <h1 style="color: #1e293b; font-size: 24px; margin: 0;">InfiniteTutor</h1>
                </div>
                <div style="background: #f8fafc; border-radius: 16px; padding: 32px; text-align: center;">
                    <p style="color: #64748b; margin: 0 0 24px;">Your verification code is:</p>
                    <div style="background: white; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">{code}</span>
                    </div>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0;">This code expires in 10 minutes.</p>
                </div>
            </div>
            """
        }
        
        resend.Emails.send(params)
        print(f"✅ Verification email sent to {email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        print(f"\n{'='*50}")
        print(f"📧 VERIFICATION CODE FOR {email}")
        print(f"   Code: {code}")
        print(f"{'='*50}\n")
        return True

def register_user(email: str, password: str) -> tuple[bool, str]:
    """Register a new user (step 1: send verification code)."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if user already exists and is verified
        cursor.execute('SELECT is_verified FROM users WHERE email = ?', (email,))
        existing = cursor.fetchone()
        
        if existing and existing['is_verified']:
            return False, "Email already registered. Please log in."
    
    # Store password hash temporarily
    pending_registrations[email] = hash_password(password)
    
    # Generate and store verification code
    code = generate_verification_code()
    expires_at = (datetime.now() + timedelta(minutes=10)).isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO verification_codes (email, code, expires_at)
            VALUES (?, ?, ?)
        ''', (email, code, expires_at))
        conn.commit()
    
    if send_verification_email(email, code):
        return True, "Verification code sent to your email"
    return False, "Failed to send verification email"

def verify_email(email: str, code: str) -> tuple[bool, str, Optional[str]]:
    """Verify email with code and complete registration."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check verification code
        cursor.execute('SELECT code, expires_at FROM verification_codes WHERE email = ?', (email,))
        stored = cursor.fetchone()
        
        if not stored:
            return False, "No verification pending for this email", None
        
        if datetime.now() > datetime.fromisoformat(stored['expires_at']):
            cursor.execute('DELETE FROM verification_codes WHERE email = ?', (email,))
            conn.commit()
            return False, "Verification code expired", None
        
        if stored['code'] != code:
            return False, "Invalid verification code", None
        
        # Get password hash from pending registrations
        password_hash = pending_registrations.get(email)
        if not password_hash:
            return False, "Registration expired. Please start again.", None
        
        # Create or update user
        user_id = secrets.token_urlsafe(16)
        cursor.execute('''
            INSERT OR REPLACE INTO users (id, email, password_hash, is_verified, created_at)
            VALUES (?, ?, ?, 1, ?)
        ''', (user_id, email, password_hash, datetime.now().isoformat()))
        
        # Clean up
        cursor.execute('DELETE FROM verification_codes WHERE email = ?', (email,))
        conn.commit()
        
        if email in pending_registrations:
            del pending_registrations[email]
        
        # Create session
        token = generate_session_token()
        cursor.execute('''
            INSERT INTO sessions (token, email, created_at) VALUES (?, ?, ?)
        ''', (token, email, datetime.now().isoformat()))
        conn.commit()
        
        return True, "Email verified successfully", token

def login_user(email: str, password: str) -> tuple[bool, str, Optional[str]]:
    """Log in an existing user with email and password."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, password_hash, is_verified FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if not user:
            return False, "No account found with this email", None
        
        if not user['is_verified']:
            return False, "Please verify your email first", None
        
        if not verify_password(password, user['password_hash']):
            return False, "Invalid password", None
        
        # Create session
        token = generate_session_token()
        cursor.execute('''
            INSERT INTO sessions (token, email, created_at) VALUES (?, ?, ?)
        ''', (token, email, datetime.now().isoformat()))
        conn.commit()
        
        return True, "Login successful", token

def get_user_by_token(token: str) -> Optional[dict]:
    """Get user data from session token."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute('SELECT email FROM sessions WHERE token = ?', (token,))
        session = cursor.fetchone()
        
        if not session:
            return None
        
        cursor.execute('SELECT id, email, is_verified, created_at FROM users WHERE email = ?', (session['email'],))
        user = cursor.fetchone()
        
        if user:
            return dict(user)
        return None

def logout_user(token: str) -> bool:
    """Remove session token."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM sessions WHERE token = ?', (token,))
        conn.commit()
        return cursor.rowcount > 0

def save_user_course(email: str, course_data: dict) -> bool:
    """Save or update a course for a user."""
    import json
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO user_courses 
            (user_email, course_id, title, topic, level, progress_percent, chapters_json, last_accessed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            email,
            course_data.get('course_id'),
            course_data.get('title'),
            course_data.get('topic', ''),
            course_data.get('level', 'Beginner'),
            course_data.get('progress_percent', 0),
            json.dumps(course_data.get('chapters', [])),
            datetime.now().isoformat()
        ))
        conn.commit()
        return True

def get_user_courses(email: str) -> list:
    """Get all courses for a user."""
    import json
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT course_id, title, topic, level, progress_percent, chapters_json, last_accessed 
            FROM user_courses WHERE user_email = ? 
            ORDER BY last_accessed DESC
        ''', (email,))
        
        courses = []
        for row in cursor.fetchall():
            course = dict(row)
            course['chapters'] = json.loads(course.get('chapters_json', '[]'))
            del course['chapters_json']
            courses.append(course)
        
        return courses

def update_course_progress(email: str, course_id: str, progress_percent: int) -> bool:
    """Update the progress of a specific course."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE user_courses 
            SET progress_percent = ?, last_accessed = ?
            WHERE user_email = ? AND course_id = ?
        ''', (progress_percent, datetime.now().isoformat(), email, course_id))
        conn.commit()
        return cursor.rowcount > 0

def get_cached_lesson(course_id: str, lesson_title: str) -> Optional[dict]:
    """Get a cached lesson if it exists."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT lesson_title, content_markdown, mermaid_code, explanation
            FROM lessons 
            WHERE course_id = ? AND lesson_title = ?
        ''', (course_id, lesson_title))
        
        row = cursor.fetchone()
        if row:
            return {
                "lesson_title": row['lesson_title'],
                "content_markdown": row['content_markdown'],
                "mermaid_code": row['mermaid_code'],
                "explanation": row['explanation']
            }
        return None

def save_cached_lesson(course_id: str, lesson_title: str, topic: str, level: str, 
                       content_markdown: str, mermaid_code: str = "", explanation: str = "") -> bool:
    """Save a generated lesson to cache."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO lessons 
            (course_id, lesson_title, topic, level, content_markdown, mermaid_code, explanation, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (course_id, lesson_title, topic, level, content_markdown, mermaid_code, explanation, 
              datetime.now().isoformat()))
        conn.commit()
        return True
