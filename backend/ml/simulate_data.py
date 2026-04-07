import csv
import json
import time
import os
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError

CSV_PATH = os.path.join(os.path.dirname(__file__), 'simulation_data.csv')
API_URL = "http://127.0.0.1:5000/sensor-data"


def simulate_data(delay=3):
    with open(CSV_PATH, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            payload = {
                "temperature": float(row["Temperature_C"]),
                "humidity": float(row["Humidity"]),
                "soil_moisture": float(row["Soil_Moisture"]),
                "rainfall_mm": float(row["Rainfall_mm"]),
                "sunlight_hours": float(row["Sunlight_Hours"]),
                "wind_speed_kmh": float(row["Wind_Speed_kmh"]),
                "soil_ph": float(row["Soil_pH"]),
                "irrigation_need": row["Irrigation_Need"],
            }
            req = urlrequest.Request(
                API_URL,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            try:
                with urlrequest.urlopen(req) as resp:
                    resp_body = resp.read().decode("utf-8")
                    print(f"POST /sensor-data {resp.status}: {resp_body}")
            except HTTPError as err:
                error_body = err.read().decode("utf-8", errors="replace")
                print(f"POST /sensor-data failed {err.code}: {error_body}")
                raise
            except URLError as err:
                print(f"Could not reach API at {API_URL}: {err}")
                raise
            time.sleep(delay)       # Wait before sending next row

if __name__ == "__main__":
    simulate_data(delay=1)  # 3 second between rows
