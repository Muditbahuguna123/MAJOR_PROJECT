from database import get_db

def init_db():
    db = get_db
    cursor = db.cursor()

    cursor.execute(""""CREATE TABLE IF NOT EXISTS sensor_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        temperatur REAL, humidity REAL, 
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    ) """)
    cursor.execute(""""CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        severity TEXT,
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    ) """)

    db.commit()