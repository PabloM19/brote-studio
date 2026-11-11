from pathlib import Path
import base64
import json
import mimetypes
import re

root = Path(__file__).resolve().parent.parent

def source(name):
    return (root / name).read_text()

def data_uri(path):
    mime = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    return f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode()

assets = {p.name: data_uri(p) for p in (root / 'assets').iterdir()
          if p.suffix in {'.svg', '.woff2', '.jpg'}}
styles = re.sub(r'url\(\s*[\'"]?assets/([^\'")]+)[\'"]?\s*\)',
                lambda match: f'url("{assets[match[1]]}")', source('styles.css'))
html = source('index.html').replace('href="assets/favicon.svg"', f'href="{assets["favicon.svg"]}"')
html = html.replace('<link rel="stylesheet" href="styles.css">', f'<style>{styles}</style>')
html = html.replace('<link rel="stylesheet" href="ui-refinements.css">', f'<style>{source("ui-refinements.css")}</style>')
html = html.replace('<link rel="stylesheet" href="setup.css">', f'<style>{source("setup.css")}</style>')
html = html.replace('<link rel="stylesheet" href="editor.css">', f'<style>{source("editor.css")}</style>')
html = html.replace('  <script src="setup.js" defer></script>\n', '')
# Reuse the outer CSS text instead of embedding a second copy of the fonts.
html = html.replace('  <script src="guide.js" defer></script>\n', '')
html = html.replace('  <script src="script.js" defer></script>\n', '')
html = html.replace('<style>', '<style id="brote-original-css">', 1)
offline = f'window.broteOffline = {{ assets: {json.dumps(assets)}, guidedCSS: {json.dumps(source("site-guided.css"))}, previewCSS: document.querySelector("#brote-original-css").textContent }};'
scripts = '\n'.join([offline, source('setup.js'), source('guide.js'), source('script.js')])
assert '</script' not in scripts.lower()
html = html.replace('</body>', f'<script>\n{scripts}\n</script>\n</body>')
(root / 'abrir-demo.html').write_text(html)
