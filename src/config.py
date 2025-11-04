"""
Configuration management for Website Scraper Pro
"""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # OpenAI Configuration
    openai_api_key: str
    openai_model: str = "gpt-4o-mini"

    # SendGrid Configuration
    sendgrid_api_key: str = ""
    sendgrid_from_email: str = "scraper@yourapp.com"
    sendgrid_from_name: str = "Website Scraper Pro"

    # Scraper Configuration
    default_max_pages: int = 500
    rate_limit_delay: float = 0.5
    request_timeout: int = 30
    user_agent: str = "Mozilla/5.0 (compatible; WebsiteScraperPro/1.0)"

    # Cache Configuration
    cache_expiry_days: int = 30
    cache_db_path: str = "cache/scrape_cache.db"

    # Output Configuration
    output_dir: str = "output"
    default_output_format: str = "xlsx"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    @property
    def cache_path(self) -> Path:
        """Get cache database path"""
        return Path(self.cache_db_path)

    @property
    def output_path(self) -> Path:
        """Get output directory path"""
        return Path(self.output_dir)


# Global settings instance
settings = Settings()
