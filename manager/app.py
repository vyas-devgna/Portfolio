"""
Portfolio Manager — Flask Dashboard
Manages all dynamic content modules for the portfolio:
  - Photography gallery
  - Animals gallery
  - Sketches gallery
  - Writing/Poetry
  - Version cache-busting
  - One-click Git deploy
"""

import json
import os
import time
import subprocess
import shutil
from pathlib import Path
from flask import Flask, render_template, request, jsonify, send_from_directory

# ─── Config ──────────────────────────────────────────────────────────

PORTFOLIO_ROOT = Path(__file__).resolve().parent.parent
MANAGER_DIR = Path(__file__).resolve().parent

GALLERY_CONFIG = {
    'photography': {
        'json': PORTFOLIO_ROOT / 'photography.json',
        'image_dir': PORTFOLIO_ROOT / 'images' / 'photography',
        'web_prefix': 'images/photography/',
    },
    'animals': {
        'json': PORTFOLIO_ROOT / 'animals.json',
        'image_dir': PORTFOLIO_ROOT / 'images' / 'animals',
        'web_prefix': 'images/animals/',
    },
    'sketches': {
        'json': PORTFOLIO_ROOT / 'sketches.json',
        'image_dir': PORTFOLIO_ROOT / 'images' / 'sketches',
        'web_prefix': 'images/sketches/',
    },
}

WRITING_JSON = PORTFOLIO_ROOT / 'writing.json'
VERSION_JSON = PORTFOLIO_ROOT / 'version.json'

ALLOWED_IMAGE_EXT = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'}
ALLOWED_VIDEO_EXT = {'.mp4', '.webm', '.mov'}

app = Flask(__name__, template_folder=str(MANAGER_DIR / 'templates'))


# ─── Helpers ─────────────────────────────────────────────────────────

def read_json(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def write_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    return True


def bump_version():
    version = str(int(time.time() * 1000))
    write_json(VERSION_JSON, {'version': version})
    return version


def get_version():
    data = read_json(VERSION_JSON)
    if isinstance(data, dict):
        return data.get('version', 'unknown')
    return 'unknown'


def safe_filename(filename):
    """Sanitize filename while preserving extension."""
    name = Path(filename).stem
    ext = Path(filename).suffix.lower()
    # Remove unsafe characters
    safe = ''.join(c if c.isalnum() or c in '-_.' else '_' for c in name)
    return safe + ext


# ─── Dashboard ───────────────────────────────────────────────────────

@app.route('/')
def dashboard():
    return render_template('dashboard.html')


# ─── Gallery API ─────────────────────────────────────────────────────

@app.route('/api/gallery/<name>', methods=['GET'])
def get_gallery(name):
    if name not in GALLERY_CONFIG:
        return jsonify({'error': 'Unknown gallery'}), 404
    cfg = GALLERY_CONFIG[name]
    items = read_json(cfg['json'])
    return jsonify({'items': items, 'name': name})


@app.route('/api/gallery/<name>', methods=['POST'])
def save_gallery(name):
    if name not in GALLERY_CONFIG:
        return jsonify({'error': 'Unknown gallery'}), 404
    cfg = GALLERY_CONFIG[name]
    items = request.json
    if not isinstance(items, list):
        return jsonify({'error': 'Expected array'}), 400
    write_json(cfg['json'], items)
    return jsonify({'ok': True, 'count': len(items)})


@app.route('/api/gallery/<name>/upload', methods=['POST'])
def upload_to_gallery(name):
    if name not in GALLERY_CONFIG:
        return jsonify({'error': 'Unknown gallery'}), 404
    cfg = GALLERY_CONFIG[name]
    cfg['image_dir'].mkdir(parents=True, exist_ok=True)

    uploaded = []
    files = request.files.getlist('files')

    for f in files:
        if not f.filename:
            continue
        ext = Path(f.filename).suffix.lower()
        if ext not in ALLOWED_IMAGE_EXT and ext not in ALLOWED_VIDEO_EXT:
            continue

        filename = safe_filename(f.filename)
        # Avoid overwriting
        dest = cfg['image_dir'] / filename
        counter = 1
        while dest.exists():
            stem = Path(filename).stem
            dest = cfg['image_dir'] / f"{stem}_{counter}{ext}"
            counter += 1

        f.save(str(dest))
        file_type = 'video' if ext in ALLOWED_VIDEO_EXT else 'image'
        web_path = cfg['web_prefix'] + dest.name
        uploaded.append({'type': file_type, 'src': web_path, 'caption': ''})

    # Append to JSON
    items = read_json(cfg['json'])
    items.extend(uploaded)
    write_json(cfg['json'], items)

    return jsonify({'ok': True, 'added': len(uploaded), 'items': items})


@app.route('/api/gallery/<name>/<int:index>', methods=['DELETE'])
def delete_gallery_item(name, index):
    if name not in GALLERY_CONFIG:
        return jsonify({'error': 'Unknown gallery'}), 404
    cfg = GALLERY_CONFIG[name]
    items = read_json(cfg['json'])

    if index < 0 or index >= len(items):
        return jsonify({'error': 'Index out of range'}), 400

    removed = items.pop(index)
    write_json(cfg['json'], items)

    # Optionally delete the file
    if request.args.get('delete_file') == '1':
        file_path = PORTFOLIO_ROOT / removed.get('src', '')
        if file_path.exists() and file_path.is_file():
            file_path.unlink()

    return jsonify({'ok': True, 'removed': removed, 'items': items})


# ─── Writing API ─────────────────────────────────────────────────────

@app.route('/api/writing', methods=['GET'])
def get_writing():
    poems = read_json(WRITING_JSON)
    return jsonify({'items': poems})


@app.route('/api/writing', methods=['POST'])
def save_writing():
    poems = request.json
    if not isinstance(poems, list):
        return jsonify({'error': 'Expected array'}), 400
    write_json(WRITING_JSON, poems)
    return jsonify({'ok': True, 'count': len(poems)})


@app.route('/api/writing/add', methods=['POST'])
def add_writing():
    poem = request.json
    if not poem or not isinstance(poem, dict):
        return jsonify({'error': 'Expected object'}), 400
    poems = read_json(WRITING_JSON)
    poems.append(poem)
    write_json(WRITING_JSON, poems)
    return jsonify({'ok': True, 'index': len(poems) - 1, 'items': poems})


@app.route('/api/writing/<int:index>', methods=['PUT'])
def update_writing(index):
    poems = read_json(WRITING_JSON)
    if index < 0 or index >= len(poems):
        return jsonify({'error': 'Index out of range'}), 400
    updated = request.json
    if not isinstance(updated, dict):
        return jsonify({'error': 'Expected object'}), 400
    poems[index] = updated
    write_json(WRITING_JSON, poems)
    return jsonify({'ok': True, 'items': poems})


@app.route('/api/writing/<int:index>', methods=['DELETE'])
def delete_writing(index):
    poems = read_json(WRITING_JSON)
    if index < 0 or index >= len(poems):
        return jsonify({'error': 'Index out of range'}), 400
    removed = poems.pop(index)
    write_json(WRITING_JSON, poems)
    return jsonify({'ok': True, 'removed': removed, 'items': poems})


# ─── Version & Deploy ────────────────────────────────────────────────

@app.route('/api/version', methods=['GET'])
def get_version_api():
    return jsonify({'version': get_version()})


@app.route('/api/version/bump', methods=['POST'])
def bump_version_api():
    v = bump_version()
    return jsonify({'ok': True, 'version': v})


@app.route('/api/deploy', methods=['POST'])
def deploy():
    try:
        # Bump version
        version = bump_version()

        # Git operations
        cmds = [
            ['git', 'add', '.'],
            ['git', 'commit', '-m', f'Portfolio update v{version}'],
            ['git', 'push'],
        ]

        output_lines = []
        for cmd in cmds:
            result = subprocess.run(
                cmd,
                cwd=str(PORTFOLIO_ROOT),
                capture_output=True,
                text=True,
                timeout=30,
            )
            output_lines.append({
                'cmd': ' '.join(cmd),
                'stdout': result.stdout.strip(),
                'stderr': result.stderr.strip(),
                'returncode': result.returncode,
            })
            # Don't fail on "nothing to commit"
            if result.returncode != 0 and 'nothing to commit' not in result.stdout:
                if 'everything up-to-date' not in result.stderr.lower():
                    return jsonify({
                        'ok': False,
                        'version': version,
                        'error': f'Command failed: {" ".join(cmd)}',
                        'output': output_lines,
                    }), 500

        return jsonify({'ok': True, 'version': version, 'output': output_lines})

    except subprocess.TimeoutExpired:
        return jsonify({'ok': False, 'error': 'Command timed out'}), 500
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500


# ─── Serve portfolio images for preview ──────────────────────────────

@app.route('/portfolio/<path:filepath>')
def serve_portfolio_file(filepath):
    return send_from_directory(str(PORTFOLIO_ROOT), filepath)


# ─── Run ─────────────────────────────────────────────────────────────

if __name__ == '__main__':
    print(f"\n  Portfolio Manager")
    print(f"  Portfolio root: {PORTFOLIO_ROOT}")
    print(f"  Dashboard:      http://localhost:5000\n")
    app.run(debug=True, port=5000)
