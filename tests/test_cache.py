"""Tests for caching system"""
import pytest
from src.cache import CacheManager


def test_cache_initialization(tmp_path):
    """Test cache manager initialization"""
    db_path = tmp_path / "test_cache.db"
    cache = CacheManager(str(db_path))

    assert db_path.exists()


def test_cache_content_storage(tmp_path):
    """Test content caching"""
    db_path = tmp_path / "test_cache.db"
    cache = CacheManager(str(db_path))

    # Store content
    cache.set_cached_content(
        url="https://example.com",
        content="Test content",
        metadata={"title": "Test Page"}
    )

    # Retrieve content
    cached = cache.get_cached_content("https://example.com")

    assert cached is not None
    assert cached["content"] == "Test content"
    assert cached["metadata"]["title"] == "Test Page"


def test_cache_analysis_storage(tmp_path):
    """Test AI analysis caching"""
    db_path = tmp_path / "test_cache.db"
    cache = CacheManager(str(db_path))

    # Store analysis
    cache.set_cached_analysis(
        url="https://example.com",
        content="Test content",
        model="gpt-4o-mini",
        analysis_result={"summary": "Test summary"},
        token_usage=100,
        cost=0.01
    )

    # Retrieve analysis
    cached = cache.get_cached_analysis("https://example.com", "gpt-4o-mini")

    assert cached is not None
    assert cached["analysis"]["summary"] == "Test summary"
    assert cached["token_usage"] == 100


def test_cache_stats(tmp_path):
    """Test cache statistics"""
    db_path = tmp_path / "test_cache.db"
    cache = CacheManager(str(db_path))

    # Add some data
    cache.set_cached_content("https://example.com", "Content")

    # Get stats
    stats = cache.get_stats(days=30)

    assert stats["cached_pages"] >= 1
