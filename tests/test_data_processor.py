"""Tests for data processor"""
import pytest
from pathlib import Path
from src.data_processor import DataProcessor


def test_data_processor_initialization(tmp_path):
    """Test data processor initialization"""
    processor = DataProcessor(str(tmp_path))

    assert processor.output_dir == tmp_path
    assert tmp_path.exists()


def test_excel_export(tmp_path):
    """Test Excel export functionality"""
    processor = DataProcessor(str(tmp_path))

    # Sample data
    data = [
        {
            "url": "https://example.com",
            "title": "Test Page",
            "meta_description": "Test description",
            "status_code": 200,
            "word_count": 500,
            "h1_count": 1,
            "h1_tags": ["Test Heading"],
            "internal_links_count": 10,
            "external_links_count": 5,
            "image_count": 3,
        }
    ]

    # Export to Excel
    filepath = processor.export_to_excel(data, "test_output.xlsx")

    assert filepath.exists()
    assert filepath.suffix == ".xlsx"


def test_csv_export(tmp_path):
    """Test CSV export functionality"""
    processor = DataProcessor(str(tmp_path))

    # Sample data
    data = [
        {
            "url": "https://example.com",
            "title": "Test Page",
            "word_count": 500,
        }
    ]

    # Export to CSV
    filepath = processor.export_to_csv(data, "test_output.csv")

    assert filepath.exists()
    assert filepath.suffix == ".csv"


def test_summary_generation(tmp_path):
    """Test summary generation"""
    processor = DataProcessor(str(tmp_path))

    data = [
        {
            "url": "https://example.com/page1",
            "title": "Page 1",
            "word_count": 500,
            "ai_quality_score": 8,
            "ai_topic": "Technology",
        },
        {
            "url": "https://example.com/page2",
            "title": "Page 2",
            "word_count": 600,
            "ai_quality_score": 9,
            "ai_topic": "Technology",
        },
    ]

    stats = {"duration": 10.5, "successful": 2}

    summary = processor.generate_summary(data, stats)

    assert summary["total_pages"] == 2
    assert summary["avg_word_count"] == 550
    assert summary["avg_quality_score"] == 8.5
