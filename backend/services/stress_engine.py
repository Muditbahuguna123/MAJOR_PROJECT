from database import get_db

def evaluate_stress(avg_temp, avg_hum):
    if avg_temp > 35 and avg_hum < 40:
        return "High", "Increase irrigation frequency"
    elif 30 <= avg_temp <= 35:
        return "Moderate", "Monitor conditions"
    else:
        return "Low", "Normal irrigation"
    
def log_alert(severity, message):
    db = get_db()
    db.execute("""
               INSERT INTO alerts(severity, message) VALUES(?,?)
               """,(severity, message))
    db.commit()