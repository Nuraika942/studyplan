import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='../dist', static_url_path='')
CORS(app)

# Простой API тест
@app.route('/api/test')
def test():
    return jsonify({"status": "Бэкенд работает!"})

# Отдача React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path.startswith('api/'): return jsonify({"error": "Not Found"}), 404
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
