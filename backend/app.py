import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3

app = Flask(__name__, static_folder='../dist', static_url_path='')
CORS(app)

DB_NAME = "studyplan.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS users (login TEXT PRIMARY KEY, password TEXT NOT NULL)')
    cursor.execute('''CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_login TEXT, title TEXT NOT NULL, 
        description TEXT, category TEXT, priority TEXT, deadline TEXT, completed INTEGER DEFAULT 0,
        FOREIGN KEY(user_login) REFERENCES users(login))''')
    try:
        cursor.execute("INSERT INTO users (login, password) VALUES (?, ?)", ('nur_nur@888', '123'))
    except: pass
    conn.commit()
    conn.close()

init_db()

# --- API МАРШРУТЫ ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (login, password) VALUES (?, ?)", (data['login'], data['password']))
        conn.commit()
        return jsonify({'message': 'Успешно'}), 201
    except: return jsonify({'error': 'Ошибка'}), 400
    finally: conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE login = ? AND password = ?", (data['login'], data['password']))
    user = cursor.fetchone()
    conn.close()
    return jsonify({'message': 'OK', 'login': data['login']}) if user else (jsonify({'error': 'Нет'}), 401)

@app.route('/api/tasks', methods=['GET', 'POST'])
def handle_tasks():
    if request.method == 'GET':
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks WHERE user_login = ?", (request.args.get('user_login'),))
        tasks = [{'id': r[0], 'title': r[2], 'completed': bool(r[7])} for r in cursor.fetchall()]
        conn.close()
        return jsonify(tasks)
    return jsonify({'message': 'Добавлено'}), 201

# --- ФИНАЛЬНАЯ ЛОГИКА ОТДАЧИ САЙТА ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path.startswith('api/'): return jsonify({"error": "Not Found"}), 404
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
