"""
Core web scraper module with intelligent crawling capabilities
"""
import asyncio
import time
from typing import Dict, List, Optional, Set
from urllib.parse import urljoin, urlparse
import httpx
from bs4 import BeautifulSoup
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.console import Console
from src.config import settings

console = Console()


class WebScraper:
    """
    Advanced web scraper with rate limiting, error handling, and progress tracking
    """

    def __init__(
        self,
        base_url: str,
        max_pages: int = None,
        rate_limit_delay: float = None,
        timeout: int = None,
    ):
        """
        Initialize the web scraper

        Args:
            base_url: Starting URL to scrape
            max_pages: Maximum number of pages to scrape
            rate_limit_delay: Delay between requests in seconds
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip("/")
        self.domain = urlparse(base_url).netloc
        self.max_pages = max_pages or settings.default_max_pages
        self.rate_limit_delay = rate_limit_delay or settings.rate_limit_delay
        self.timeout = timeout or settings.request_timeout

        self.visited_urls: Set[str] = set()
        self.to_visit: List[str] = [self.base_url]
        self.results: List[Dict] = []
        self.errors: List[Dict] = []

        # Statistics
        self.stats = {
            "total_pages": 0,
            "successful": 0,
            "failed": 0,
            "skipped": 0,
            "start_time": None,
            "end_time": None,
        }

    def _is_valid_url(self, url: str) -> bool:
        """
        Check if URL should be crawled

        Args:
            url: URL to validate

        Returns:
            True if URL is valid and within domain
        """
        try:
            parsed = urlparse(url)

            # Must be same domain
            if parsed.netloc != self.domain:
                return False

            # Skip common non-content URLs
            skip_extensions = {
                ".pdf",
                ".jpg",
                ".jpeg",
                ".png",
                ".gif",
                ".svg",
                ".css",
                ".js",
                ".ico",
                ".xml",
                ".zip",
                ".tar",
                ".gz",
            }

            if any(parsed.path.lower().endswith(ext) for ext in skip_extensions):
                return False

            # Skip anchor links
            if parsed.fragment:
                return False

            return True

        except Exception:
            return False

    def _extract_links(self, soup: BeautifulSoup, current_url: str) -> List[str]:
        """
        Extract and normalize links from page

        Args:
            soup: BeautifulSoup object
            current_url: Current page URL

        Returns:
            List of normalized URLs
        """
        links = []

        for link in soup.find_all("a", href=True):
            href = link["href"]

            # Convert relative URLs to absolute
            absolute_url = urljoin(current_url, href)

            # Remove query parameters and fragments for deduplication
            parsed = urlparse(absolute_url)
            clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"

            if self._is_valid_url(clean_url) and clean_url not in self.visited_urls:
                links.append(clean_url)

        return list(set(links))  # Remove duplicates

    def _extract_metadata(self, soup: BeautifulSoup, url: str, status_code: int) -> Dict:
        """
        Extract comprehensive metadata from page

        Args:
            soup: BeautifulSoup object
            url: Page URL
            status_code: HTTP status code

        Returns:
            Dictionary of metadata
        """
        # Title
        title_tag = soup.find("title")
        title = title_tag.get_text(strip=True) if title_tag else ""

        # Meta description
        meta_desc_tag = soup.find("meta", attrs={"name": "description"})
        meta_description = (
            meta_desc_tag.get("content", "") if meta_desc_tag else ""
        )

        # H1 tags
        h1_tags = [h1.get_text(strip=True) for h1 in soup.find_all("h1")]

        # Text content (remove scripts and styles)
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()

        text_content = soup.get_text(separator=" ", strip=True)
        word_count = len(text_content.split())

        # Links
        all_links = soup.find_all("a", href=True)
        internal_links = [
            link for link in all_links if self.domain in link.get("href", "")
        ]
        external_links = [
            link for link in all_links if self.domain not in link.get("href", "")
        ]

        # Images
        images = soup.find_all("img")
        image_count = len(images)

        # Meta keywords
        meta_keywords_tag = soup.find("meta", attrs={"name": "keywords"})
        meta_keywords = (
            meta_keywords_tag.get("content", "") if meta_keywords_tag else ""
        )

        return {
            "url": url,
            "title": title,
            "meta_description": meta_description,
            "meta_keywords": meta_keywords,
            "status_code": status_code,
            "word_count": word_count,
            "h1_tags": h1_tags,
            "h1_count": len(h1_tags),
            "internal_links_count": len(internal_links),
            "external_links_count": len(external_links),
            "image_count": image_count,
            "text_content": text_content[:5000],  # First 5000 chars for AI analysis
        }

    async def _fetch_page(self, client: httpx.AsyncClient, url: str) -> Optional[Dict]:
        """
        Fetch and parse a single page

        Args:
            client: HTTP client
            url: URL to fetch

        Returns:
            Metadata dictionary or None on error
        """
        try:
            response = await client.get(
                url,
                headers={"User-Agent": settings.user_agent},
                timeout=self.timeout,
                follow_redirects=True,
            )

            # Parse HTML
            soup = BeautifulSoup(response.text, "lxml")

            # Extract metadata
            metadata = self._extract_metadata(soup, url, response.status_code)

            # Extract links for crawling
            if response.status_code == 200:
                new_links = self._extract_links(soup, url)
                for link in new_links:
                    if (
                        link not in self.visited_urls
                        and link not in self.to_visit
                        and len(self.visited_urls) + len(self.to_visit) < self.max_pages
                    ):
                        self.to_visit.append(link)

            self.stats["successful"] += 1
            return metadata

        except httpx.TimeoutException:
            self.errors.append({"url": url, "error": "Timeout"})
            self.stats["failed"] += 1
            return None

        except httpx.HTTPStatusError as e:
            self.errors.append({"url": url, "error": f"HTTP {e.response.status_code}"})
            self.stats["failed"] += 1
            return None

        except Exception as e:
            self.errors.append({"url": url, "error": str(e)})
            self.stats["failed"] += 1
            return None

    async def scrape(self) -> Dict:
        """
        Main scraping method with progress tracking

        Returns:
            Dictionary containing results and statistics
        """
        self.stats["start_time"] = time.time()

        console.print(
            f"\n[bold cyan]🕷️  Starting scrape of {self.base_url}[/bold cyan]"
        )
        console.print(f"[dim]Max pages: {self.max_pages} | Rate limit: {self.rate_limit_delay}s[/dim]\n")

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            console=console,
        ) as progress:

            task = progress.add_task(
                "[cyan]Crawling pages...", total=self.max_pages
            )

            async with httpx.AsyncClient() as client:
                while self.to_visit and len(self.visited_urls) < self.max_pages:
                    url = self.to_visit.pop(0)

                    if url in self.visited_urls:
                        continue

                    self.visited_urls.add(url)
                    self.stats["total_pages"] += 1

                    # Fetch page
                    metadata = await self._fetch_page(client, url)

                    if metadata:
                        self.results.append(metadata)

                    # Update progress
                    progress.update(
                        task,
                        advance=1,
                        description=f"[cyan]Crawling pages... ({len(self.results)} scraped, {len(self.errors)} errors)",
                    )

                    # Rate limiting
                    await asyncio.sleep(self.rate_limit_delay)

        self.stats["end_time"] = time.time()
        self.stats["duration"] = self.stats["end_time"] - self.stats["start_time"]

        # Print summary
        self._print_summary()

        return {
            "results": self.results,
            "errors": self.errors,
            "stats": self.stats,
        }

    def _print_summary(self):
        """Print scraping summary"""
        from rich.table import Table

        table = Table(title="Scraping Summary", show_header=True)
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")

        table.add_row("Total Pages Visited", str(self.stats["total_pages"]))
        table.add_row("Successfully Scraped", str(self.stats["successful"]))
        table.add_row("Failed", str(self.stats["failed"]))
        table.add_row(
            "Duration", f"{self.stats['duration']:.2f}s"
        )
        table.add_row(
            "Pages/Second", f"{self.stats['successful'] / self.stats['duration']:.2f}"
        )

        console.print("\n")
        console.print(table)
        console.print("\n")


# Convenience function
async def scrape_website(url: str, max_pages: int = 500) -> Dict:
    """
    Scrape a website and return results

    Args:
        url: Starting URL
        max_pages: Maximum pages to scrape

    Returns:
        Scraping results and statistics
    """
    scraper = WebScraper(url, max_pages)
    return await scraper.scrape()
