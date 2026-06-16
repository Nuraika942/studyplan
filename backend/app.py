import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3

app = Flask(__name__, static_folder='../dist', static_url_path='')
CORS(app)

DB_NAME = "studyplan.db"

# --- ИНИЦИАЛИЗАЦИЯ БАЗЫ ---
def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS users (login TEXT PRIMARY KEY, password TEXT NOT NULL)')
    cursor.execute('''CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_login TEXT, title TEXT, 
        description TEXT, category TEXT, priority TEXT, deadline TEXT, completed INTEGER DEFAULT 0)''')
    conn.commit(); conn.close()
init_db()

# --- ВСЕ ТВОИ API МАРШРУТЫ ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    try:
        conn = sqlite3.connect(DB_NAME)
        conn.execute("INSERT INTO users VALUES (?, ?)", (data['login'], data['password']))
        conn.commit(); conn.close()
        return jsonify({'message': 'OK'}), 201
    except: return jsonify({'error': 'Ошибка'}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = sqlite3.connect(DB_NAME)
    user = conn.execute("SELECT * FROM users WHERE login=? AND password=?", (data['login'], data['password'])).fetchone()
    conn.close()
    return jsonify({'login': data['login']}) if user else (jsonify({'error': 'Нет'}), 401)

@app.route('/api/tasks', methods=['GET', 'POST'])
def handle_tasks():
    conn = sqlite3.connect(DB_NAME)
    if request.method == 'GET':
        tasks = conn.execute("SELECT * FROM tasks WHERE user_login=?", (request.args.get('user_login'),)).fetchall()
        conn.close()
        return jsonify([{'id': t[0], 'title': t[2], 'completed': bool(t[7])} for t in tasks])
    data = request.json
    conn.execute("INSERT INTO tasks (user_login, title, description, category, priority, deadline) VALUES (?,?,?,?,?,?)", 
                 (data['user_login'], data['title'], data['description'], data['category'], data['priority'], data['deadline']))
    conn.commit(); conn.close()
    return jsonify({'message': 'Added'}), 201

# --- РОУТЫ ДЛЯ REACT ---
# Вот этот код позволяет работать твоим страницам (/planner, /login и т.д.)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # Если путь начинается с api/ — это запрос к базе, Flask его обрабатывает
    if path.startswith('api/'):
        return jsonify({"error": "Not Found"}), 404
    # Если запрашивают файл (js, css, картинки) — отдаем его
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # Если путь не начинается с api/ — это страница React, отдаем index.html
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
