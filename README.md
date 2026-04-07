# GraphFusionBench Paper Site

Static academic project page for GraphFusionBench.

This folder is designed to be pushed as a standalone GitHub repository. It uses the GitHub Pages Actions workflow template and deploys the `site/` folder directly.

## Folder Structure

```text
GraphFusionBench-paper-site/
  .github/
    workflows/
      deploy-pages.yml
  site/
    .nojekyll
    index.html
    assets/
      css/
        styles.css
      js/
        main.js
    data/
      stats.json
  .gitignore
  README.md
```

## Deploy

```bash
cd D:/fusionr1/GraphFusionBench-paper-site
git init -b main
git add .
git commit -m "Add GraphFusionBench paper site"
git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
git push -u origin main
```

Then in the GitHub repository:

1. Open `Settings -> Pages`.
2. Set `Build and deployment -> Source` to `GitHub Actions`.
3. Push to `main`; `.github/workflows/deploy-pages.yml` will deploy the website.

## Local Preview

```bash
python -m http.server 8000 -d site
```

Open `http://localhost:8000`.
