from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import time

app = Flask(__name__)
CORS(app)  # Разрешаем React общаться с Flask

DB_NAME = "studyplan.db"

def init_db():
    """Создаем таблицы пользователей и задач, если их нет"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Таблица пользователей
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            login TEXT PRIMARY KEY,
            password TEXT NOT NULL
        )
    ''')
    
    # Таблица задач
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_login TEXT,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            priority TEXT,
            deadline TEXT,
            completed INTEGER DEFAULT 0,
            FOREIGN KEY(user_login) REFERENCES users(login)
        )
    ''')
    
    # Добавим дефолтного пользователя nur_nur@888, если базы еще нет
    try:
        cursor.execute("INSERT INTO users (login, password) VALUES (?, ?)", ('nur_nur@888', '123'))
    except sqlite3.IntegrityError:
        pass  # Уже есть
        
    conn.commit()
    conn.close()

# Инициализируем БД при старте
init_db()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    login = data.get('login')
    password = data.get('password')
    
    if not login or not password:
        return jsonify({'error': 'Заполните все поля'}), 400
        
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (login, password) VALUES (?, ?)", (login, password))
        conn.commit()
        return jsonify({'message': 'Успешная регистрация'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Пользователь уже существует'}), 400
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    login = data.get('login')
    password = data.get('password')
    
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE login = ? AND password = ?", (login, password))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify({'message': 'Вход выполнен', 'login': login}), 200
    return jsonify({'error': 'Неверный логин или пароль'}), 401

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    user_login = request.args.get('user_login')
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, description, category, priority, deadline, completed FROM tasks WHERE user_login = ?", (user_login,))
    rows = cursor.fetchall()
    conn.close()
    
    tasks = []
    for r in rows:
        tasks.append({
            'id': r[0], 'title': r[1], 'description': r[2],
            'category': r[3], 'priority': r[4], 'deadline': r[5],
            'completed': bool(r[6])
        })
    return jsonify(tasks), 200

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    user_login = data.get('user_login')
    title = data.get('title')
    description = data.get('description')
    category = data.get('category')
    priority = data.get('priority')
    deadline = data.get('deadline')
    
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO tasks (user_login, title, description, category, priority, deadline, completed)
        VALUES (?, ?, ?, ?, ?, ?, 0)
    ''', (user_login, title, description, category, priority, deadline))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify(({'id': new_id}), 21)

@app.route('/api/tasks/<int:task_id>/toggle', methods=['POST'])
def toggle_task(task_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("UPDATE tasks SET completed = NOT completed WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Статус обновлен'}), 200

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Задача удалена'}), 200

if __name__ == '__main__':
       port = int(.environ.get("PORT", 5000))
       app.run(host='0.0.0.0', port=port, debug=True)
