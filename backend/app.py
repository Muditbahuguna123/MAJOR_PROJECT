from flask import Flask
from flask_cors import CORS
from models import init_db
from routes.sensor_routes import sensor_bp
from routes.analytics_routes import analytics_bp

app = Flask(__name__)
CORS(app)

init_db()
app.register_blueprint(sensor_bp)
app.register_blueprint(analytics_bp)

if __name__ == "__main__":
    app.run(debug=True)


"""When you run this file:

Flask app is created

CORS is enabled

Database is prepared

All routes are attached

Server starts listening"""