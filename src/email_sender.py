"""
Email delivery module using SendGrid
Sends beautiful HTML emails with scrape results
"""
import base64
from pathlib import Path
from typing import Dict, Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
from rich.console import Console
from src.config import settings

console = Console()


class EmailSender:
    """
    Send emails with SendGrid API
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize email sender

        Args:
            api_key: SendGrid API key
        """
        self.api_key = api_key or settings.sendgrid_api_key
        self.from_email = settings.sendgrid_from_email
        self.from_name = settings.sendgrid_from_name

        if not self.api_key or self.api_key == "your_sendgrid_api_key_here":
            console.print("[yellow]⚠ SendGrid API key not configured. Email features disabled.[/yellow]")
            self.enabled = False
        else:
            self.client = SendGridAPIClient(self.api_key)
            self.enabled = True

    def _create_html_body(self, summary: Dict, base_url: str) -> str:
        """
        Create beautiful HTML email body

        Args:
            summary: Summary statistics
            base_url: Scraped website URL

        Returns:
            HTML string
        """
        # Extract stats
        total_pages = summary.get("total_pages", 0)
        successful = summary.get("successful", 0)
        avg_quality = summary.get("avg_quality_score", 0)
        duration = summary.get("duration", 0)
        cost = summary.get("total_cost", 0)

        # Top topics
        top_topics_html = ""
        if "top_topics" in summary:
            top_topics_html = "<ul style='list-style-type: none; padding: 0;'>"
            for topic, count in list(summary["top_topics"].items())[:3]:
                top_topics_html += f"<li style='padding: 5px 0;'>• <strong>{topic}</strong>: {count} pages</li>"
            top_topics_html += "</ul>"

        # Top pages
        top_pages_html = ""
        if "top_pages" in summary:
            top_pages_html = "<ol style='padding-left: 20px;'>"
            for page in summary["top_pages"][:3]:
                title = page.get("Title", "")[:50]
                score = page.get("Quality Score", 0)
                top_pages_html += f"<li style='padding: 5px 0;'><strong>{title}</strong> (Score: {score}/10)</li>"
            top_pages_html += "</ol>"

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Scrape Results Are Ready!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7fafc;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #00D9FF 0%, #B026FF 100%); padding: 40px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                        🕷️ Your Scrape Results Are Ready!
                                    </h1>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">

                                    <p style="color: #2d3748; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                                        Hi there! 👋
                                    </p>

                                    <p style="color: #2d3748; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                                        Your scrape of <strong style="color: #00D9FF;">{base_url}</strong> is complete!
                                    </p>

                                    <!-- Summary Box -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
                                        <tr>
                                            <td>
                                                <h2 style="margin: 0 0 15px 0; color: #2d3748; font-size: 18px; font-weight: bold;">
                                                    📊 Summary
                                                </h2>
                                                <table width="100%" cellpadding="5" cellspacing="0">
                                                    <tr>
                                                        <td style="color: #4a5568; font-size: 14px;">Total Pages:</td>
                                                        <td style="color: #2d3748; font-size: 14px; font-weight: bold; text-align: right;">{total_pages}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #4a5568; font-size: 14px;">Successfully Scraped:</td>
                                                        <td style="color: #48bb78; font-size: 14px; font-weight: bold; text-align: right;">{successful} ({successful/max(total_pages, 1)*100:.1f}%)</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #4a5568; font-size: 14px;">Average Quality Score:</td>
                                                        <td style="color: #2d3748; font-size: 14px; font-weight: bold; text-align: right;">{avg_quality:.1f}/10</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #4a5568; font-size: 14px;">Processing Time:</td>
                                                        <td style="color: #2d3748; font-size: 14px; font-weight: bold; text-align: right;">{int(duration//60)}m {int(duration%60)}s</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #4a5568; font-size: 14px;">Total Cost:</td>
                                                        <td style="color: #2d3748; font-size: 14px; font-weight: bold; text-align: right;">${cost:.4f}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Top Topics -->
                                    {f'''
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px 0;">
                                        <tr>
                                            <td>
                                                <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 16px; font-weight: bold;">
                                                    🏆 Top Topics
                                                </h3>
                                                {top_topics_html}
                                            </td>
                                        </tr>
                                    </table>
                                    ''' if top_topics_html else ''}

                                    <!-- Top Pages -->
                                    {f'''
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                                        <tr>
                                            <td>
                                                <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 16px; font-weight: bold;">
                                                    ⭐ Top Performing Pages
                                                </h3>
                                                {top_pages_html}
                                            </td>
                                        </tr>
                                    </table>
                                    ''' if top_pages_html else ''}

                                    <!-- Attachment Info -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
                                        <tr>
                                            <td>
                                                <p style="margin: 0; color: #2d3748; font-size: 14px;">
                                                    📎 <strong>Attachment:</strong> Full scrape results in Excel format
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="color: #4a5568; font-size: 14px; line-height: 20px; margin: 0;">
                                        Made with ❤️ by <strong>Website Scraper Pro</strong>
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f7fafc; padding: 20px; text-align: center;">
                                    <p style="margin: 0; color: #718096; font-size: 12px;">
                                        This is an automated email from Website Scraper Pro
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        return html

    def send_results(
        self,
        to_email: str,
        summary: Dict,
        base_url: str,
        attachment_path: Optional[Path] = None
    ) -> bool:
        """
        Send scrape results via email

        Args:
            to_email: Recipient email address
            summary: Summary statistics dictionary
            base_url: Scraped website URL
            attachment_path: Path to Excel file to attach

        Returns:
            True if sent successfully
        """
        if not self.enabled:
            console.print("[yellow]⚠ Email sending is disabled. Configure SendGrid API key to enable.[/yellow]")
            return False

        try:
            # Create HTML body
            html_content = self._create_html_body(summary, base_url)

            # Create message
            subject = f"🕷️ Scrape Results Ready: {base_url}"

            message = Mail(
                from_email=(self.from_email, self.from_name),
                to_emails=to_email,
                subject=subject,
                html_content=html_content
            )

            # Attach file if provided
            if attachment_path and attachment_path.exists():
                with open(attachment_path, 'rb') as f:
                    file_data = f.read()

                encoded_file = base64.b64encode(file_data).decode()

                attachment = Attachment(
                    FileContent(encoded_file),
                    FileName(attachment_path.name),
                    FileType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
                    Disposition('attachment')
                )

                message.attachment = attachment

            # Send email
            console.print(f"\n[cyan]📧 Sending email to {to_email}...[/cyan]")
            response = self.client.send(message)

            if response.status_code in [200, 201, 202]:
                console.print(f"[green]✓ Email sent successfully![/green]")
                return True
            else:
                console.print(f"[red]✗ Email failed: {response.status_code}[/red]")
                return False

        except Exception as e:
            console.print(f"[red]✗ Email error: {e}[/red]")
            return False


# Convenience function
def send_results_email(
    to_email: str,
    summary: Dict,
    base_url: str,
    attachment_path: Optional[Path] = None
) -> bool:
    """
    Send results email

    Args:
        to_email: Recipient email
        summary: Summary statistics
        base_url: Base URL scraped
        attachment_path: Path to attachment

    Returns:
        True if successful
    """
    sender = EmailSender()
    return sender.send_results(to_email, summary, base_url, attachment_path)
