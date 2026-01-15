# GitHub Pages Setup Guide for EasyLang Documentation

This guide explains how to enable and configure GitHub Pages for the EasyLang documentation site.

## 📁 Documentation Structure

The complete documentation is located in the `docs/` directory:

```
docs/
├── _config.yml                 # Jekyll configuration
├── index.md                    # Homepage
├── assets/
│   └── css/
│       └── style.scss          # Custom styling
├── getting-started/
│   ├── index.md
│   ├── installation.md
│   ├── first-bot.md
│   └── basic-concepts.md
├── features/                   # 21 feature pages
│   ├── index.md
│   ├── messaging.md
│   ├── embeds.md
│   ├── components.md
│   └── ...
├── api/                        # 17 API reference pages
│   ├── index.md
│   ├── built-in-functions.md
│   ├── discord-functions.md
│   └── ...
├── examples/                   # 6 complete bot examples
│   ├── index.md
│   ├── basic-bot.md
│   ├── music-bot.md
│   └── ...
└── bridge-system/             # 3 bridge system pages
    ├── index.md
    ├── python-packages.md
    └── npm-packages.md
```

**Total:** 50+ comprehensive documentation pages!

## 🚀 Enabling GitHub Pages

### Option 1: Via GitHub Website (Recommended)

1. Go to your repository on GitHub: `https://github.com/deathamongstlife/EasyLang`

2. Click on **Settings** tab

3. Scroll down to **Pages** section in the left sidebar

4. Under **Source**, select:
   - **Branch:** `main`
   - **Folder:** `/docs`

5. Click **Save**

6. Wait 1-2 minutes for the site to build

7. Your site will be available at:
   ```
   https://deathamongstlife.github.io/EasyLang/
   ```

### Option 2: Via Git

If you prefer using Git commands:

```bash
# Make sure all documentation is committed
git add docs/
git commit -m "Add comprehensive GitHub Pages documentation"
git push origin main

# Then enable Pages via GitHub website as described above
```

## ⚙️ Configuration

The documentation is already configured with the correct settings in `docs/_config.yml`:

```yaml
title: "EasyLang"
description: "A beginner-friendly programming language for Discord bot development"
url: "https://deathamongstlife.github.io"
baseurl: "/EasyLang"
repository: "deathamongstlife/EasyLang"
theme: jekyll-theme-cayman
```

**No additional configuration needed!**

## 🎨 Customization

### Change Theme

To use a different Jekyll theme:

1. Edit `docs/_config.yml`
2. Change the `theme:` line to one of these supported themes:
   - `jekyll-theme-cayman` (current)
   - `jekyll-theme-minimal`
   - `jekyll-theme-slate`
   - `jekyll-theme-architect`
   - `jekyll-theme-hacker`
   - `jekyll-theme-leap-day`
   - `jekyll-theme-merlot`
   - `jekyll-theme-midnight`
   - `jekyll-theme-modernist`
   - `jekyll-theme-tactile`
   - `jekyll-theme-time-machine`

3. Commit and push changes

### Modify Styling

Custom styles are in `docs/assets/css/style.scss`. You can:

- Change color scheme (modify CSS variables)
- Adjust typography
- Customize component styling
- Add new styles

### Update Content

All content is in Markdown (`.md`) files. Edit any file and commit to update.

## 🔍 Testing Locally

To test the site locally before pushing:

### Prerequisites

```bash
# Install Ruby (if not already installed)
# On macOS:
brew install ruby

# On Ubuntu/Debian:
sudo apt-get install ruby-full

# On Windows:
# Download from https://rubyinstaller.org/
```

### Install Jekyll

```bash
gem install jekyll bundler
```

### Run Local Server

```bash
cd docs
bundle install
bundle exec jekyll serve
```

Visit `http://localhost:4000/EasyLang/` in your browser.

## 📝 Updating Documentation

### Adding New Pages

1. Create a new `.md` file in the appropriate directory:
   ```bash
   docs/features/new-feature.md
   docs/api/new-api-page.md
   docs/examples/new-example.md
   ```

2. Add front matter at the top:
   ```markdown
   ---
   layout: default
   title: Page Title
   description: Page description
   ---

   # Page Content Here
   ```

3. Update navigation in `docs/_config.yml` if needed

4. Commit and push

### Updating Existing Pages

1. Edit the `.md` file
2. Commit and push
3. Changes appear within 1-2 minutes

## 🔗 Internal Links

Use these link formats:

```markdown
[Link Text](/EasyLang/path/to/page)
```

Examples:
```markdown
[Getting Started](/EasyLang/getting-started/)
[Installation](/EasyLang/getting-started/installation)
[API Reference](/EasyLang/api/)
[Examples](/EasyLang/examples/)
```

## 📊 Site Analytics (Optional)

To add Google Analytics:

1. Get your tracking ID from Google Analytics
2. Edit `docs/_config.yml`
3. Uncomment and update:
   ```yaml
   google_analytics: UA-XXXXXXXXX-X
   ```

## 🐛 Troubleshooting

### Site Not Building

1. Check GitHub Actions tab for build errors
2. Verify all Markdown files have proper front matter
3. Check for syntax errors in `_config.yml`

### 404 Errors

- Make sure `baseurl` in `_config.yml` matches your repository name
- Use `/EasyLang/` prefix for all internal links
- Check file paths are correct

### Styling Not Working

1. Verify `assets/css/style.scss` exists
2. Check front matter in SCSS file:
   ```scss
   ---
   ---

   @import "{{ site.theme }}";
   /* Your styles here */
   ```

### Local Server Issues

```bash
# Clean and rebuild
bundle exec jekyll clean
bundle exec jekyll serve
```

## 📱 Mobile Responsiveness

The documentation is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## ♿ Accessibility

The site includes:
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Screen reader support
- High contrast text
- Readable fonts

## 🔐 SEO Optimization

Each page includes:
- Title tags
- Meta descriptions
- Semantic headings
- Clean URLs
- Sitemap (auto-generated)
- robots.txt friendly

## 📈 Monitoring

After deployment, monitor:
- Build status in GitHub Actions
- Page load times
- Broken links
- User feedback

## 🎯 Next Steps

After enabling GitHub Pages:

1. **Verify deployment**: Visit your site URL
2. **Test navigation**: Check all links work
3. **Review content**: Read through documentation
4. **Share the link**: Add to your README
5. **Promote**: Share on social media, Discord, etc.

## 📚 Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Cayman Theme](https://github.com/pages-themes/cayman)

## 🤝 Contributing to Documentation

To contribute:

1. Fork the repository
2. Edit documentation in `docs/` directory
3. Test changes locally
4. Submit a pull request
5. Describe your changes clearly

## 📧 Support

If you encounter issues:

1. Check this guide first
2. Search GitHub Issues
3. Open a new issue with:
   - Description of problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

---

## 🎉 Congratulations!

Your comprehensive EasyLang documentation site is ready to go live!

### Quick Launch Checklist

- [ ] Enable GitHub Pages in repository settings
- [ ] Wait for initial build (1-2 minutes)
- [ ] Visit `https://deathamongstlife.github.io/EasyLang/`
- [ ] Test navigation and links
- [ ] Update main README with documentation link
- [ ] Share with community

### Site Features

✅ **50+ pages** of comprehensive documentation
✅ **21 feature guides** with examples
✅ **17 API reference pages** covering 148+ functions
✅ **6 complete bot examples** ready to use
✅ **Bridge system docs** for Python & npm
✅ **Custom styling** with responsive design
✅ **Search functionality** (browser Ctrl+F)
✅ **Mobile-friendly** layout
✅ **Fast loading** static site
✅ **SEO optimized** for discoverability

---

**Your documentation URL:**
```
https://deathamongstlife.github.io/EasyLang/
```

Bookmark it, share it, and help developers discover EasyLang!
