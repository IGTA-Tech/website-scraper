"""Tests for web scraper module"""
import pytest
from src.scraper import WebScraper


@pytest.mark.asyncio
async def test_scraper_initialization():
    """Test scraper initialization"""
    scraper = WebScraper("https://example.com", max_pages=10)

    assert scraper.base_url == "https://example.com"
    assert scraper.max_pages == 10
    assert scraper.domain == "example.com"


@pytest.mark.asyncio
async def test_url_validation():
    """Test URL validation logic"""
    scraper = WebScraper("https://example.com")

    # Valid URL
    assert scraper._is_valid_url("https://example.com/page")

    # Different domain
    assert not scraper._is_valid_url("https://other.com/page")

    # Skip extensions
    assert not scraper._is_valid_url("https://example.com/image.jpg")
    assert not scraper._is_valid_url("https://example.com/file.pdf")


@pytest.mark.asyncio
async def test_basic_scrape():
    """Test basic scraping functionality"""
    scraper = WebScraper("https://example.com", max_pages=1)
    result = await scraper.scrape()

    assert "results" in result
    assert "stats" in result
    assert result["stats"]["total_pages"] >= 1
