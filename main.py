#!/usr/bin/env python3
"""
Website Scraper Pro - AI-Powered Web Intelligence Tool
Beautiful CLI interface with Rich library
"""
import asyncio
import sys
from pathlib import Path
from typing import Optional
import typer
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.table import Table
from rich import box

from src.scraper import WebScraper
from src.ai_analyzer import AIAnalyzer
from src.data_processor import DataProcessor
from src.email_sender import EmailSender
from src.cache import cache_manager
from src.config import settings

app = typer.Typer()
console = Console()


def print_banner():
    """Print beautiful ASCII banner"""
    banner = """
╔══════════════════════════════════════════════════════════╗
║                                                           ║
║         🕷️  WEBSITE SCRAPER PRO v1.0                     ║
║              AI-Powered Web Intelligence                  ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
    """
    console.print(banner, style="bold cyan")


def print_welcome():
    """Print welcome message with feature highlights"""
    features = Table(show_header=False, box=box.SIMPLE)
    features.add_column("", style="cyan")
    features.add_column("", style="white")

    features.add_row("✓", "Advanced web crawling with rate limiting")
    features.add_row("✓", "AI-powered content analysis (GPT-4o-mini)")
    features.add_row("✓", "Smart caching for cost optimization")
    features.add_row("✓", "Beautiful Excel/CSV export")
    features.add_row("✓", "Email delivery with SendGrid")

    console.print(features)
    console.print()


def interactive_mode():
    """Interactive mode with prompts"""
    print_banner()
    print_welcome()

    # Get URL
    console.print("[bold cyan]Let's get started![/bold cyan]\n")

    url = Prompt.ask(
        "[cyan]Enter the website URL to scrape[/cyan]",
        default="https://example.com"
    )

    # Get max pages
    max_pages = Prompt.ask(
        "[cyan]Maximum pages to scrape[/cyan]",
        default=str(settings.default_max_pages)
    )
    max_pages = int(max_pages)

    # Options
    console.print("\n[bold cyan]Options:[/bold cyan]")

    use_cache = Confirm.ask(
        "[cyan]Use cache? (faster, cheaper)[/cyan]",
        default=True
    )

    use_ai = Confirm.ask(
        "[cyan]AI analysis? (costs $0.08-0.17 per 500 pages)[/cyan]",
        default=True
    )

    # Get email if user wants it
    send_email = Confirm.ask(
        "[cyan]Send results via email?[/cyan]",
        default=False
    )

    email_address = None
    if send_email:
        email_address = Prompt.ask("[cyan]Enter your email address[/cyan]")

    # Output format
    output_format = Prompt.ask(
        "[cyan]Export format[/cyan]",
        choices=["xlsx", "csv", "both"],
        default="xlsx"
    )

    console.print()

    # Run scrape
    asyncio.run(run_scrape(
        url=url,
        max_pages=max_pages,
        use_cache=use_cache,
        use_ai=use_ai,
        email=email_address,
        output_format=output_format
    ))


async def run_scrape(
    url: str,
    max_pages: int,
    use_cache: bool = True,
    use_ai: bool = True,
    email: Optional[str] = None,
    output_format: str = "xlsx"
):
    """
    Main scraping workflow

    Args:
        url: URL to scrape
        max_pages: Maximum pages to scrape
        use_cache: Whether to use cache
        use_ai: Whether to run AI analysis
        email: Email address to send results
        output_format: Export format (xlsx, csv, both)
    """
    try:
        # Step 1: Scrape website
        console.print("\n[bold cyan]═══ STEP 1: WEB SCRAPING ═══[/bold cyan]\n")

        scraper = WebScraper(url, max_pages)
        scrape_result = await scraper.scrape()

        results = scrape_result["results"]
        stats = scrape_result["stats"]

        if not results:
            console.print("[red]✗ No pages scraped. Check the URL and try again.[/red]")
            return

        # Step 2: AI Analysis (if enabled)
        if use_ai:
            console.print("\n[bold cyan]═══ STEP 2: AI ANALYSIS ═══[/bold cyan]\n")

            analyzer = AIAnalyzer()
            results = analyzer.analyze_batch(results, use_cache=use_cache)

            # Add AI stats to overall stats
            ai_stats = analyzer.get_usage_stats()
            stats["total_tokens"] = ai_stats["total_tokens"]
            stats["total_cost"] = ai_stats["total_cost"]
        else:
            console.print("\n[yellow]⊘ Skipping AI analysis (disabled)[/yellow]\n")
            stats["total_cost"] = 0.0

        # Step 3: Export Data
        console.print("\n[bold cyan]═══ STEP 3: EXPORTING DATA ═══[/bold cyan]\n")

        processor = DataProcessor()

        # Generate summary
        summary = processor.generate_summary(results, stats)

        # Print summary table
        processor.print_summary_table(summary)

        # Export files
        output_files = []

        if output_format in ["xlsx", "both"]:
            excel_file = processor.export_to_excel(results)
            output_files.append(excel_file)

        if output_format in ["csv", "both"]:
            csv_file = processor.export_to_csv(results)
            output_files.append(csv_file)

        # Step 4: Send Email (if requested)
        if email:
            console.print("\n[bold cyan]═══ STEP 4: EMAIL DELIVERY ═══[/bold cyan]\n")

            sender = EmailSender()

            # Use first output file as attachment
            attachment = output_files[0] if output_files else None

            sender.send_results(
                to_email=email,
                summary=summary,
                base_url=url,
                attachment_path=attachment
            )

        # Final success message
        console.print("\n")
        success_panel = Panel(
            f"""[bold green]✓ Scrape Complete![/bold green]

[cyan]Pages Scraped:[/cyan] {stats['successful']}
[cyan]Cost:[/cyan] ${stats.get('total_cost', 0):.4f}
[cyan]Files:[/cyan] {', '.join(f.name for f in output_files)}

[dim]Files saved to: output/[/dim]
            """,
            title="🎉 Success",
            border_style="green"
        )
        console.print(success_panel)

    except KeyboardInterrupt:
        console.print("\n\n[yellow]⚠ Scrape cancelled by user.[/yellow]")
        sys.exit(0)

    except Exception as e:
        console.print(f"\n[red]✗ Error: {e}[/red]")
        import traceback
        console.print(f"[dim]{traceback.format_exc()}[/dim]")
        sys.exit(1)


@app.command()
def scrape(
    url: str = typer.Argument(..., help="Website URL to scrape"),
    max_pages: int = typer.Option(500, "--max-pages", "-n", help="Maximum pages to scrape"),
    email: Optional[str] = typer.Option(None, "--email", "-e", help="Email address for results"),
    no_cache: bool = typer.Option(False, "--no-cache", help="Disable caching"),
    no_ai: bool = typer.Option(False, "--no-ai", help="Disable AI analysis"),
    output: Optional[str] = typer.Option(None, "--output", "-o", help="Custom output filename"),
    format: str = typer.Option("xlsx", "--format", "-f", help="Export format (xlsx, csv, both)"),
):
    """
    Scrape a website and generate AI-powered analysis report

    Example:
        python main.py scrape https://example.com --max-pages 100 --email user@email.com
    """
    print_banner()

    asyncio.run(run_scrape(
        url=url,
        max_pages=max_pages,
        use_cache=not no_cache,
        use_ai=not no_ai,
        email=email,
        output_format=format
    ))


@app.command()
def interactive():
    """
    Start interactive mode with guided prompts

    Example:
        python main.py interactive
    """
    interactive_mode()


@app.command()
def dashboard():
    """
    Display cache statistics and analytics dashboard

    Example:
        python main.py dashboard
    """
    print_banner()

    console.print("[bold cyan]📊 CACHE STATISTICS[/bold cyan]\n")

    stats = cache_manager.get_stats(days=30)

    # Main stats table
    table = Table(title="Last 30 Days", show_header=True)
    table.add_column("Metric", style="cyan", width=30)
    table.add_column("Value", style="green", width=20)

    table.add_row("Cached Pages", f"{stats['cached_pages']:,}")
    table.add_row("Total Accesses", f"{stats['total_accesses']:,}")
    table.add_row("Cached AI Analyses", f"{stats['cached_analyses']:,}")
    table.add_row("Cache Hit Rate", f"{stats['cache_hit_rate']:.1f}%")
    table.add_row("API Calls Saved", f"{stats['api_calls_saved']:,}")
    table.add_row("Cost Saved", f"${stats['cost_saved']:.4f}")
    table.add_row("Total Tokens Used", f"{stats['total_tokens_used']:,}")

    console.print(table)
    console.print()


@app.command()
def cache_clear():
    """
    Clear all cache entries

    Example:
        python main.py cache-clear
    """
    print_banner()

    if Confirm.ask("[yellow]⚠ Clear ALL cache entries? This cannot be undone.[/yellow]"):
        cache_manager.clear_all()
        console.print("[green]✓ Cache cleared successfully![/green]")
    else:
        console.print("[dim]Cancelled.[/dim]")


@app.command()
def cache_clean():
    """
    Remove expired cache entries

    Example:
        python main.py cache-clean
    """
    print_banner()

    console.print("[cyan]Cleaning expired cache entries...[/cyan]")
    cache_manager.clear_expired()
    console.print("[green]✓ Expired entries removed![/green]")


@app.command()
def version():
    """
    Show version information

    Example:
        python main.py version
    """
    from src import __version__

    console.print(f"\n[bold cyan]Website Scraper Pro v{__version__}[/bold cyan]")
    console.print(f"[dim]Python {sys.version.split()[0]}[/dim]\n")


if __name__ == "__main__":
    # If no arguments provided, start interactive mode
    if len(sys.argv) == 1:
        interactive_mode()
    else:
        app()
