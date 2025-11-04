"""
SQLite caching system for cost optimization
Stores scraped content and AI analysis results to avoid redundant API calls
"""
import sqlite3
import json
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, Any
from src.config import settings


class CacheManager:
    """
    Manages SQLite cache for scraped content and AI analysis results
    """

    def __init__(self, db_path: Optional[str] = None):
        """
        Initialize cache manager

        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path or settings.cache_db_path

        # Ensure cache directory exists
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)

        # Initialize database
        self._init_db()

    def _init_db(self):
        """Create database tables if they don't exist"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Table for scraped content
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scraped_content (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url TEXT UNIQUE NOT NULL,
                    url_hash TEXT UNIQUE NOT NULL,
                    content TEXT NOT NULL,
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    access_count INTEGER DEFAULT 1
                )
            """)

            # Table for AI analysis results
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ai_analysis (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url_hash TEXT UNIQUE NOT NULL,
                    content_hash TEXT NOT NULL,
                    model TEXT NOT NULL,
                    analysis_result TEXT NOT NULL,
                    token_usage INTEGER,
                    cost REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    access_count INTEGER DEFAULT 1,
                    FOREIGN KEY (url_hash) REFERENCES scraped_content(url_hash)
                )
            """)

            # Table for cache statistics
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS cache_stats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    stat_date DATE UNIQUE NOT NULL,
                    cache_hits INTEGER DEFAULT 0,
                    cache_misses INTEGER DEFAULT 0,
                    api_calls_saved INTEGER DEFAULT 0,
                    cost_saved REAL DEFAULT 0.0
                )
            """)

            # Create indexes for better performance
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_url_hash
                ON scraped_content(url_hash)
            """)

            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_content_hash
                ON ai_analysis(content_hash)
            """)

            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_created_at
                ON scraped_content(created_at)
            """)

            conn.commit()

    def _hash_url(self, url: str) -> str:
        """Generate hash for URL"""
        return hashlib.sha256(url.encode()).hexdigest()

    def _hash_content(self, content: str) -> str:
        """Generate hash for content"""
        return hashlib.sha256(content.encode()).hexdigest()

    def get_cached_content(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached content for URL

        Args:
            url: URL to lookup

        Returns:
            Cached data or None if not found/expired
        """
        url_hash = self._hash_url(url)

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Check if cached and not expired
            expiry_date = datetime.now() - timedelta(days=settings.cache_expiry_days)

            cursor.execute("""
                SELECT content, metadata, created_at
                FROM scraped_content
                WHERE url_hash = ? AND created_at > ?
            """, (url_hash, expiry_date))

            result = cursor.fetchone()

            if result:
                # Update access statistics
                cursor.execute("""
                    UPDATE scraped_content
                    SET accessed_at = CURRENT_TIMESTAMP,
                        access_count = access_count + 1
                    WHERE url_hash = ?
                """, (url_hash,))
                conn.commit()

                # Record cache hit
                self._record_stat("cache_hits", 1)

                return {
                    "content": result[0],
                    "metadata": json.loads(result[1]) if result[1] else None,
                    "cached_at": result[2]
                }

            # Record cache miss
            self._record_stat("cache_misses", 1)
            return None

    def set_cached_content(self, url: str, content: str, metadata: Optional[Dict] = None):
        """
        Store content in cache

        Args:
            url: URL to cache
            content: Content to cache
            metadata: Optional metadata dictionary
        """
        url_hash = self._hash_url(url)
        metadata_json = json.dumps(metadata) if metadata else None

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            cursor.execute("""
                INSERT OR REPLACE INTO scraped_content
                (url, url_hash, content, metadata, created_at, accessed_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """, (url, url_hash, content, metadata_json))

            conn.commit()

    def get_cached_analysis(self, url: str, model: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached AI analysis for URL

        Args:
            url: URL to lookup
            model: AI model used

        Returns:
            Cached analysis or None if not found
        """
        url_hash = self._hash_url(url)

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            expiry_date = datetime.now() - timedelta(days=settings.cache_expiry_days)

            cursor.execute("""
                SELECT analysis_result, token_usage, cost, created_at
                FROM ai_analysis
                WHERE url_hash = ? AND model = ? AND created_at > ?
            """, (url_hash, model, expiry_date))

            result = cursor.fetchone()

            if result:
                # Update access statistics
                cursor.execute("""
                    UPDATE ai_analysis
                    SET accessed_at = CURRENT_TIMESTAMP,
                        access_count = access_count + 1
                    WHERE url_hash = ? AND model = ?
                """, (url_hash, model))
                conn.commit()

                # Record API call saved
                self._record_stat("api_calls_saved", 1)
                if result[2]:  # cost
                    self._record_stat("cost_saved", result[2])

                return {
                    "analysis": json.loads(result[0]),
                    "token_usage": result[1],
                    "cost": result[2],
                    "cached_at": result[3]
                }

            return None

    def set_cached_analysis(
        self,
        url: str,
        content: str,
        model: str,
        analysis_result: Dict,
        token_usage: Optional[int] = None,
        cost: Optional[float] = None
    ):
        """
        Store AI analysis in cache

        Args:
            url: URL analyzed
            content: Content that was analyzed
            model: AI model used
            analysis_result: Analysis result dictionary
            token_usage: Number of tokens used
            cost: Cost of API call
        """
        url_hash = self._hash_url(url)
        content_hash = self._hash_content(content)
        analysis_json = json.dumps(analysis_result)

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            cursor.execute("""
                INSERT OR REPLACE INTO ai_analysis
                (url_hash, content_hash, model, analysis_result, token_usage, cost, created_at, accessed_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """, (url_hash, content_hash, model, analysis_json, token_usage, cost))

            conn.commit()

    def _record_stat(self, stat_name: str, value: float):
        """Record cache statistics"""
        today = datetime.now().date()

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Insert or update today's stats
            cursor.execute(f"""
                INSERT INTO cache_stats (stat_date, {stat_name})
                VALUES (?, ?)
                ON CONFLICT(stat_date) DO UPDATE SET
                    {stat_name} = {stat_name} + ?
            """, (today, value, value))

            conn.commit()

    def get_stats(self, days: int = 30) -> Dict[str, Any]:
        """
        Get cache statistics

        Args:
            days: Number of days to look back

        Returns:
            Dictionary of statistics
        """
        start_date = datetime.now().date() - timedelta(days=days)

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Overall stats
            cursor.execute("""
                SELECT
                    COUNT(*) as total_cached_pages,
                    SUM(access_count) as total_accesses
                FROM scraped_content
                WHERE created_at > ?
            """, (start_date,))

            content_stats = cursor.fetchone()

            cursor.execute("""
                SELECT
                    COUNT(*) as total_analyses,
                    SUM(access_count) as total_analysis_accesses,
                    SUM(token_usage) as total_tokens,
                    SUM(cost) as total_cost
                FROM ai_analysis
                WHERE created_at > ?
            """, (start_date,))

            analysis_stats = cursor.fetchone()

            # Cache performance stats
            cursor.execute("""
                SELECT
                    SUM(cache_hits) as total_hits,
                    SUM(cache_misses) as total_misses,
                    SUM(api_calls_saved) as api_calls_saved,
                    SUM(cost_saved) as cost_saved
                FROM cache_stats
                WHERE stat_date > ?
            """, (start_date,))

            perf_stats = cursor.fetchone()

            return {
                "cached_pages": content_stats[0] or 0,
                "total_accesses": content_stats[1] or 0,
                "cached_analyses": analysis_stats[0] or 0,
                "total_analysis_accesses": analysis_stats[1] or 0,
                "total_tokens_used": analysis_stats[2] or 0,
                "total_cost": analysis_stats[3] or 0.0,
                "cache_hits": perf_stats[0] or 0,
                "cache_misses": perf_stats[1] or 0,
                "api_calls_saved": perf_stats[2] or 0,
                "cost_saved": perf_stats[3] or 0.0,
                "cache_hit_rate": (
                    (perf_stats[0] / (perf_stats[0] + perf_stats[1]) * 100)
                    if (perf_stats[0] and perf_stats[1])
                    else 0.0
                )
            }

    def clear_expired(self):
        """Clear expired cache entries"""
        expiry_date = datetime.now() - timedelta(days=settings.cache_expiry_days)

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            cursor.execute("""
                DELETE FROM scraped_content
                WHERE created_at < ?
            """, (expiry_date,))

            cursor.execute("""
                DELETE FROM ai_analysis
                WHERE created_at < ?
            """, (expiry_date,))

            conn.commit()

    def clear_all(self):
        """Clear all cache entries"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            cursor.execute("DELETE FROM scraped_content")
            cursor.execute("DELETE FROM ai_analysis")
            cursor.execute("DELETE FROM cache_stats")

            conn.commit()


# Global cache instance
cache_manager = CacheManager()
