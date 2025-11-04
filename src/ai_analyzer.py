"""
AI-powered content analysis using OpenAI GPT-4o-mini
Extracts metadata, topics, keywords, and content quality scores
"""
import json
from typing import Dict, List, Optional
from openai import OpenAI
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.console import Console
from src.config import settings
from src.cache import cache_manager

console = Console()


class AIAnalyzer:
    """
    AI-powered content analyzer using OpenAI GPT-4o-mini
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize AI analyzer

        Args:
            api_key: OpenAI API key
            model: Model to use (default: gpt-4o-mini)
        """
        self.api_key = api_key or settings.openai_api_key
        self.model = model or settings.openai_model
        self.client = OpenAI(api_key=self.api_key)

        # Track usage and costs
        self.total_tokens = 0
        self.total_cost = 0.0

        # Pricing for GPT-4o-mini (per 1M tokens)
        self.input_cost_per_million = 0.15
        self.output_cost_per_million = 0.60

    def _calculate_cost(self, prompt_tokens: int, completion_tokens: int) -> float:
        """
        Calculate API call cost

        Args:
            prompt_tokens: Number of input tokens
            completion_tokens: Number of output tokens

        Returns:
            Cost in USD
        """
        input_cost = (prompt_tokens / 1_000_000) * self.input_cost_per_million
        output_cost = (completion_tokens / 1_000_000) * self.output_cost_per_million
        return input_cost + output_cost

    def _create_analysis_prompt(self, page_data: Dict) -> str:
        """
        Create analysis prompt from page data

        Args:
            page_data: Dictionary containing page metadata

        Returns:
            Formatted prompt string
        """
        return f"""Analyze the following web page content and provide structured metadata.

URL: {page_data['url']}
Title: {page_data['title']}
Meta Description: {page_data['meta_description']}
Word Count: {page_data['word_count']}

Content:
{page_data['text_content'][:3000]}

Please provide a JSON response with the following fields:
- summary: A concise 2-3 sentence summary of the page content
- primary_topic: The main topic/category (e.g., Technology, Business, Health, etc.)
- keywords: An array of 5-7 relevant keywords
- target_audience: Brief description of the intended audience
- quality_score: A score from 1-10 rating content quality (depth, clarity, usefulness)
- content_type: Type of content (e.g., Blog Post, Product Page, Landing Page, Documentation, etc.)
- seo_score: SEO quality score from 1-10 (based on title, meta, keywords, structure)
- sentiment: Overall sentiment (Positive, Neutral, Negative)

Respond ONLY with valid JSON, no additional text."""

    def analyze_page(self, page_data: Dict, use_cache: bool = True) -> Optional[Dict]:
        """
        Analyze a single page with AI

        Args:
            page_data: Dictionary containing page metadata
            use_cache: Whether to use cache

        Returns:
            Analysis results dictionary
        """
        url = page_data['url']

        # Check cache first
        if use_cache:
            cached = cache_manager.get_cached_analysis(url, self.model)
            if cached:
                console.print(f"[dim]✓ {url} (cached)[/dim]")
                return cached['analysis']

        try:
            # Create prompt
            prompt = self._create_analysis_prompt(page_data)

            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert content analyst. Provide accurate, structured analysis of web content in JSON format."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=500
            )

            # Parse response
            result = json.loads(response.choices[0].message.content)

            # Calculate cost
            usage = response.usage
            cost = self._calculate_cost(usage.prompt_tokens, usage.completion_tokens)

            self.total_tokens += usage.total_tokens
            self.total_cost += cost

            # Cache result
            if use_cache:
                cache_manager.set_cached_analysis(
                    url=url,
                    content=page_data['text_content'],
                    model=self.model,
                    analysis_result=result,
                    token_usage=usage.total_tokens,
                    cost=cost
                )

            console.print(f"[green]✓ {url} (analyzed - ${cost:.4f})[/green]")

            return result

        except json.JSONDecodeError as e:
            console.print(f"[red]✗ {url} - JSON parse error: {e}[/red]")
            return None

        except Exception as e:
            console.print(f"[red]✗ {url} - Analysis error: {e}[/red]")
            return None

    def analyze_batch(
        self,
        pages_data: List[Dict],
        use_cache: bool = True,
        show_progress: bool = True
    ) -> List[Dict]:
        """
        Analyze multiple pages with progress tracking

        Args:
            pages_data: List of page metadata dictionaries
            use_cache: Whether to use cache
            show_progress: Whether to show progress bar

        Returns:
            List of enriched page data with AI analysis
        """
        console.print(f"\n[bold cyan]🤖 Analyzing {len(pages_data)} pages with AI[/bold cyan]")
        console.print(f"[dim]Model: {self.model} | Cache: {'enabled' if use_cache else 'disabled'}[/dim]\n")

        results = []

        if show_progress:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TaskProgressColumn(),
                console=console,
            ) as progress:

                task = progress.add_task(
                    "[cyan]Analyzing content...",
                    total=len(pages_data)
                )

                for page_data in pages_data:
                    # Analyze page
                    analysis = self.analyze_page(page_data, use_cache)

                    # Merge analysis with page data
                    enriched_data = {**page_data}
                    if analysis:
                        enriched_data.update({
                            "ai_summary": analysis.get("summary", ""),
                            "ai_topic": analysis.get("primary_topic", ""),
                            "ai_keywords": analysis.get("keywords", []),
                            "ai_audience": analysis.get("target_audience", ""),
                            "ai_quality_score": analysis.get("quality_score", 0),
                            "ai_content_type": analysis.get("content_type", ""),
                            "ai_seo_score": analysis.get("seo_score", 0),
                            "ai_sentiment": analysis.get("sentiment", "Neutral"),
                        })

                    results.append(enriched_data)

                    # Update progress
                    progress.update(
                        task,
                        advance=1,
                        description=f"[cyan]Analyzing... (${self.total_cost:.4f} spent)"
                    )

        else:
            for page_data in pages_data:
                analysis = self.analyze_page(page_data, use_cache)
                enriched_data = {**page_data}
                if analysis:
                    enriched_data.update({
                        "ai_summary": analysis.get("summary", ""),
                        "ai_topic": analysis.get("primary_topic", ""),
                        "ai_keywords": analysis.get("keywords", []),
                        "ai_audience": analysis.get("target_audience", ""),
                        "ai_quality_score": analysis.get("quality_score", 0),
                        "ai_content_type": analysis.get("content_type", ""),
                        "ai_seo_score": analysis.get("seo_score", 0),
                        "ai_sentiment": analysis.get("sentiment", "Neutral"),
                    })
                results.append(enriched_data)

        # Print summary
        self._print_summary(len(pages_data))

        return results

    def _print_summary(self, total_pages: int):
        """Print analysis summary"""
        from rich.table import Table

        table = Table(title="AI Analysis Summary", show_header=True)
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")

        table.add_row("Pages Analyzed", str(total_pages))
        table.add_row("Total Tokens Used", f"{self.total_tokens:,}")
        table.add_row("Total Cost", f"${self.total_cost:.4f}")
        table.add_row("Avg Cost per Page", f"${self.total_cost / max(total_pages, 1):.4f}")

        console.print("\n")
        console.print(table)
        console.print("\n")

    def get_usage_stats(self) -> Dict:
        """
        Get usage statistics

        Returns:
            Dictionary of usage stats
        """
        return {
            "total_tokens": self.total_tokens,
            "total_cost": self.total_cost,
            "model": self.model,
        }


# Convenience function
def analyze_pages(pages_data: List[Dict], use_cache: bool = True) -> List[Dict]:
    """
    Analyze pages with AI

    Args:
        pages_data: List of page metadata
        use_cache: Whether to use cache

    Returns:
        List of enriched page data
    """
    analyzer = AIAnalyzer()
    return analyzer.analyze_batch(pages_data, use_cache)
