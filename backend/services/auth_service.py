import os
import secrets
import bcrypt
import psycopg2
import jwt
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from typing import Optional
from contextlib import contextmanager
from urllib.parse import urlparse

# Supabase JWT secret - use the JWT secret from your Supabase project
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

def get_user_from_supabase_token(token: str) -> Optional[dict]:
    """Decode Supabase JWT token and extract user info."""
    try:
        # First try to decode without verification (for development/testing)
        # In production, you should verify with SUPABASE_JWT_SECRET
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        email = decoded.get("email")
        if not email:
            return None
            
        return {
            "id": decoded.get("sub"),
            "email": email,
            "is_verified": True,
            "created_at": datetime.now().isoformat()
        }
    except jwt.exceptions.DecodeError as e:
        print(f"JWT decode error: {e}")
        return None
    except Exception as e:
        print(f"Token verification error: {e}")
        return None

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback to SQLite for local development if no DATABASE_URL
USE_POSTGRES = DATABASE_URL is not None and DATABASE_URL.startswith("postgresql")

if not USE_POSTGRES:
    import sqlite3
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'infinitetutor.db')
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)

@contextmanager
def get_db():
    """Get database connection."""
    if USE_POSTGRES:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        try:
            yield conn
        finally:
            conn.close()
    else:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

def get_placeholder():
    """Return the correct placeholder for the database type."""
    return "%s" if USE_POSTGRES else "?"

def init_db():
    """Initialize database tables."""
    ph = get_placeholder()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        if USE_POSTGRES:
            # PostgreSQL syntax
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    is_verified INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS verification_codes (
                    email TEXT PRIMARY KEY,
                    code TEXT NOT NULL,
                    expires_at TEXT NOT NULL
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sessions (
                    token TEXT PRIMARY KEY,
                    email TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            ''')
            
            cursor.execute('''
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
                )
            ''')
            
            cursor.execute('''
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
                )
            ''')
        else:
            # SQLite syntax
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    is_verified INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS verification_codes (
                    email TEXT PRIMARY KEY,
                    code TEXT NOT NULL,
                    expires_at TEXT NOT NULL
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sessions (
                    token TEXT PRIMARY KEY,
                    email TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            ''')
            
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
    """Send verification email using Brevo (Sendinblue)."""
    brevo_api_key = os.getenv("BREVO_API_KEY")
    
    if not brevo_api_key:
        print(f"\n{'='*50}")
        print(f"📧 VERIFICATION CODE FOR {email}")
        print(f"   Code: {code}")
        print(f"{'='*50}\n")
        return True
    
    try:
        import sib_api_v3_sdk
        from sib_api_v3_sdk.rest import ApiException
        
        # Configure Brevo API
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = brevo_api_key
        
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
        
        sender = {"name": "InfiniteTutor", "email": "noreply@infinitetutor.app"}
        to = [{"email": email}]
        subject = "Your InfiniteTutor verification code"
        html_content = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #2AB7CA; font-size: 28px; margin: 0;">InfiniteTutor</h1>
            </div>
            <div style="background: #0B0C10; border-radius: 16px; padding: 32px; text-align: center; border: 1px solid #2AB7CA;">
                <p style="color: #94a3b8; margin: 0 0 24px;">Your verification code is:</p>
                <div style="background: #1a1d24; border: 2px solid #2AB7CA; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #FED766;">{code}</span>
                </div>
                <p style="color: #64748b; font-size: 14px; margin: 0;">This code expires in 10 minutes.</p>
            </div>
            <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 24px;">
                If you didn't request this code, you can safely ignore this email.
            </p>
        </div>
        """
        
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=to,
            sender=sender,
            subject=subject,
            html_content=html_content
        )
        
        api_instance.send_transac_email(send_smtp_email)
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
    ph = get_placeholder()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if user already exists and is verified
        cursor.execute(f'SELECT is_verified FROM users WHERE email = {ph}', (email,))
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
        if USE_POSTGRES:
            cursor.execute('''
                INSERT INTO verification_codes (email, code, expires_at)
                VALUES (%s, %s, %s)
                ON CONFLICT (email) DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at
            ''', (email, code, expires_at))
        else:
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
    ph = get_placeholder()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check verification code
        cursor.execute(f'SELECT code, expires_at FROM verification_codes WHERE email = {ph}', (email,))
        stored = cursor.fetchone()
        
        if not stored:
            return False, "No verification pending for this email", None
        
        if datetime.now() > datetime.fromisoformat(stored['expires_at']):
            cursor.execute(f'DELETE FROM verification_codes WHERE email = {ph}', (email,))
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
        if USE_POSTGRES:
            cursor.execute('''
                INSERT INTO users (id, email, password_hash, is_verified, created_at)
                VALUES (%s, %s, %s, 1, %s)
                ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_verified = 1
            ''', (user_id, email, password_hash, datetime.now().isoformat()))
        else:
            cursor.execute('''
                INSERT OR REPLACE INTO users (id, email, password_hash, is_verified, created_at)
                VALUES (?, ?, ?, 1, ?)
            ''', (user_id, email, password_hash, datetime.now().isoformat()))
        
        # Clean up
        cursor.execute(f'DELETE FROM verification_codes WHERE email = {ph}', (email,))
        conn.commit()
        
        if email in pending_registrations:
            del pending_registrations[email]
        
        # Create session
        token = generate_session_token()
        cursor.execute(f'''
            INSERT INTO sessions (token, email, created_at) VALUES ({ph}, {ph}, {ph})
        ''', (token, email, datetime.now().isoformat()))
        conn.commit()
        
        return True, "Email verified successfully", token

def login_user(email: str, password: str) -> tuple[bool, str, Optional[str]]:
    """Log in an existing user with email and password."""
    ph = get_placeholder()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute(f'SELECT id, password_hash, is_verified FROM users WHERE email = {ph}', (email,))
        user = cursor.fetchone()
        
        if not user:
            return False, "No account found with this email", None
        
        if not user['is_verified']:
            return False, "Please verify your email first", None
        
        if not verify_password(password, user['password_hash']):
            return False, "Invalid password", None
        
        # Create session
        token = generate_session_token()
        cursor.execute(f'''
            INSERT INTO sessions (token, email, created_at) VALUES ({ph}, {ph}, {ph})
        ''', (token, email, datetime.now().isoformat()))
        conn.commit()
        
        return True, "Login successful", token

def get_user_by_token(token: str) -> Optional[dict]:
    """Get user data from session token."""
    ph = get_placeholder()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute(f'SELECT email FROM sessions WHERE token = {ph}', (token,))
        session = cursor.fetchone()
        
        if not session:
            return None
        
        cursor.execute(f'SELECT id, email, is_verified, created_at FROM users WHERE email = {ph}', (session['email'],))
        user = cursor.fetchone()
        
        if user:
            return dict(user)
        return None

def logout_user(token: str) -> bool:
    """Remove session token."""
    ph = get_placeholder()
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(f'DELETE FROM sessions WHERE token = {ph}', (token,))
        conn.commit()
        return cursor.rowcount > 0

def save_user_course(email: str, course_data: dict) -> bool:
    """Save or update a course for a user."""
    import json
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        if USE_POSTGRES:
            cursor.execute('''
                INSERT INTO user_courses 
                (user_email, course_id, title, topic, level, progress_percent, chapters_json, last_accessed)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (user_email, course_id) DO UPDATE SET
                    title = EXCLUDED.title,
                    topic = EXCLUDED.topic,
                    level = EXCLUDED.level,
                    progress_percent = EXCLUDED.progress_percent,
                    chapters_json = EXCLUDED.chapters_json,
                    last_accessed = EXCLUDED.last_accessed
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
        else:
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
    ph = get_placeholder()
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(f'''
            SELECT course_id, title, topic, level, progress_percent, chapters_json, last_accessed 
            FROM user_courses WHERE user_email = {ph} 
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
    ph = get_placeholder()
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(f'''
            UPDATE user_courses 
            SET progress_percent = {ph}, last_accessed = {ph}
            WHERE user_email = {ph} AND course_id = {ph}
        ''', (progress_percent, datetime.now().isoformat(), email, course_id))
        conn.commit()
        return cursor.rowcount > 0

def get_cached_lesson(course_id: str, lesson_title: str) -> Optional[dict]:
    """Get a cached lesson if it exists."""
    ph = get_placeholder()
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(f'''
            SELECT lesson_title, content_markdown, mermaid_code, explanation
            FROM lessons 
            WHERE course_id = {ph} AND lesson_title = {ph}
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
        
        if USE_POSTGRES:
            cursor.execute('''
                INSERT INTO lessons 
                (course_id, lesson_title, topic, level, content_markdown, mermaid_code, explanation, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (course_id, lesson_title) DO UPDATE SET
                    content_markdown = EXCLUDED.content_markdown,
                    mermaid_code = EXCLUDED.mermaid_code,
                    explanation = EXCLUDED.explanation
            ''', (course_id, lesson_title, topic, level, content_markdown, mermaid_code, explanation, 
                  datetime.now().isoformat()))
        else:
            cursor.execute('''
                INSERT OR REPLACE INTO lessons 
                (course_id, lesson_title, topic, level, content_markdown, mermaid_code, explanation, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (course_id, lesson_title, topic, level, content_markdown, mermaid_code, explanation, 
                  datetime.now().isoformat()))
        conn.commit()
        return True
