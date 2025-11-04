# 🚀 Quick Start Guide

## 1. Setup (2 minutes)

```bash
# Run the setup script
./setup.sh

# Or manually:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 2. Configure API Key

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-your_actual_key_here
```

**Your current key is already in .env - ready to use!**

## 3. Run Your First Scrape

### Interactive Mode (Easiest)

```bash
python main.py
```

Follow the prompts:
- Enter URL: `https://example.com`
- Max pages: `10` (start small)
- Use cache: `y`
- AI analysis: `y`
- Email results: `n` (optional)
- Format: `xlsx`

### Command Line Mode

```bash
# Basic scrape
python main.py scrape https://example.com --max-pages 10

# With all options
python main.py scrape https://example.com \
  --max-pages 100 \
  --email your@email.com \
  --format xlsx
```

## 4. View Results

Results are saved to `output/` directory:
- Excel file with beautiful formatting
- All metadata + AI analysis
- Ready to share!

## 5. Check Cache Stats

```bash
python main.py dashboard
```

See how much you're saving with caching!

## 📚 Examples

### Small Blog (10-50 pages)
```bash
python main.py scrape https://smallblog.com --max-pages 50
```
- Time: ~2 minutes
- Cost: ~$0.01

### Medium Website (100-200 pages)
```bash
python main.py scrape https://medium-site.com --max-pages 200
```
- Time: ~5-8 minutes
- Cost: ~$0.05

### Large Website (500 pages)
```bash
python main.py scrape https://large-site.com --max-pages 500
```
- Time: ~12-15 minutes
- Cost: ~$0.08 (with cache)

## 🆘 Need Help?

### Test Your Setup
```bash
python main.py version
```

### View All Commands
```bash
python main.py --help
```

### Clear Cache
```bash
python main.py cache-clear
```

## 💡 Tips

1. **Start Small** - Try 10 pages first to test
2. **Use Cache** - Saves 50%+ on repeat scrapes
3. **Check Costs** - Dashboard shows real-time savings
4. **Email Optional** - Works great without SendGrid

## 🎯 Next Steps

1. ✅ Run your first scrape (10 pages)
2. ✅ Check the Excel output
3. ✅ Try a larger scrape (100+ pages)
4. ✅ View cache statistics
5. ✅ Set up email (optional)

**Enjoy your new AI-powered scraper!** 🎉
