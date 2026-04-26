import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import CropCard from "./cards/Crop";
import IrrigationCard from "./cards/Irrigation";
import StressCard from "./cards/Stress";
import SensorCard from "./cards/Sensor";
import DataChart from "./cards/Graph";
import styles from "./style.module.css";
import WeatherCard from "./cards/Weather";

const sensors = [
  { label: "Temperature", unit: "°C", icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-80v-166L310-118l-56-56 186-186v-80h-80L174-254l-56-56 128-130H80v-80h166L118-650l56-56 186 186h80v-80L254-786l56-56 130 128v-166h80v166l130-128 56 56-186 186v80h80l186-186 56 56-128 130h166v80H714l128 130-56 56-186-186h-80v80l186 186-56 56-130-128v166h-80Z"/></svg>, value: 28.4 },
  { label: "Humidity", unit: "%", icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-100q-133 0-226.5-92T160-416q0-63 24.5-120.5T254-638l226-222 226 222q45 44 69.5 101.5T800-416q0 132-93.5 224T480-100ZM240-416h480q0-47-18-89.5T650-580L480-748 310-580q-34 32-52 74.5T240-416Z"/></svg>,  value: 67   },
  { label: "Soil Moisture", unit: "%", icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M577.5-537.5Q560-555 560-580q0-17 9.5-34.5t20.5-32q11-14.5 20.5-24l9.5-9.5 9.5 9.5q9.5 9.5 20.5 24t20.5 32Q680-597 680-580q0 25-17.5 42.5T620-520q-25 0-42.5-17.5Zm160-120Q720-675 720-700q0-17 9.5-34.5t20.5-32q11-14.5 20.5-24l9.5-9.5 9.5 9.5q9.5 9.5 20.5 24t20.5 32Q840-717 840-700q0 25-17.5 42.5T780-640q-25 0-42.5-17.5Zm0 240Q720-435 720-460q0-17 9.5-34.5t20.5-32q11-14.5 20.5-24l9.5-9.5 9.5 9.5q9.5 9.5 20.5 24t20.5 32Q840-477 840-460q0 25-17.5 42.5T780-400q-25 0-42.5-17.5Zm-519 239Q160-237 160-320q0-48 21-89.5t59-70.5v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q38 29 59 70.5t21 89.5q0 83-58.5 141.5T360-120q-83 0-141.5-58.5ZM240-320h240q0-29-12.5-54T432-416l-32-24v-280q0-17-11.5-28.5T360-760q-17 0-28.5 11.5T320-720v280l-32 24q-23 17-35.5 42T240-320Z"/></svg>,  value: 42   },
  { label: "Rainfall", unit: "mm", icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M558-84q-15 8-30.5 2.5T504-102l-60-120q-8-15-2.5-30.5T462-276q15-8 30.5-2.5T516-258l60 120q8 15 2.5 30.5T558-84Zm240 0q-15 8-30.5 2.5T744-102l-60-120q-8-15-2.5-30.5T702-276q15-8 30.5-2.5T756-258l60 120q8 15 2.5 30.5T798-84Zm-480 0q-15 8-30.5 2.5T264-102l-60-120q-8-15-2.5-30.5T222-276q15-8 30.5-2.5T276-258l60 120q8 15 2.5 30.5T318-84Zm-18-236q-91 0-155.5-64.5T80-540q0-83 55-145t136-73q32-57 87.5-89.5T480-880q90 0 156.5 57.5T717-679q69 6 116 57t47 122q0 75-52.5 127.5T700-320H300Zm0-80h400q42 0 71-29t29-71q0-42-29-71t-71-29h-60v-40q0-66-47-113t-113-47q-48 0-87.5 26T333-704l-10 24h-25q-57 2-97.5 42.5T160-540q0 58 41 99t99 41Zm180-200Z"/></svg>, value: 12   },
  { label: "Sunlight Hours",unit: "h", icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-760v-160h80v160h-80Zm266 110-55-55 112-115 56 57-113 113Zm54 210v-80h160v80H760ZM440-40v-160h80v160h-80ZM254-652 140-763l57-56 113 113-56 54Zm508 512L651-255l54-54 114 110-57 59ZM40-440v-80h160v80H40Zm157 300-56-57 112-112 29 27 29 28-114 114Zm113-170q-70-70-70-170t70-170q70-70 170-70t170 70q70 70 70 170t-70 170q-70 70-170 70t-170-70Zm283-57q47-47 47-113t-47-113q-47-47-113-47t-113 47q-47 47-47 113t47 113q47 47 113 47t113-47ZM480-480Z"/></svg>,  value: 6.5  },
  { label: "Wind Speed", unit: "km/h", icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M460-160q-50 0-85-35t-35-85h80q0 17 11.5 28.5T460-240q17 0 28.5-11.5T500-280q0-17-11.5-28.5T460-320H80v-80h380q50 0 85 35t35 85q0 50-35 85t-85 35ZM80-560v-80h540q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43h-80q0-59 40.5-99.5T620-840q59 0 99.5 40.5T760-700q0 59-40.5 99.5T620-560H80Zm660 320v-80q26 0 43-17t17-43q0-26-17-43t-43-17H80v-80h660q59 0 99.5 40.5T880-380q0 59-40.5 99.5T740-240Z"/></svg>,  value: 14   },
  { label: "Soil pH", unit: "", icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M360-82Q238-96 159-187T80-408q0-100 79.5-217.5T400-880q161 137 240.5 254.5T720-408v8h-80v-8q0-73-60.5-165T400-774Q281-665 220.5-573T160-408q0 97 56 164t144 81v81Zm40-387Zm40 389v-240h140q24 0 42 18t18 42v40q0 24-18 42t-42 18h-80v80h-60Zm240 0v-240h60v80h80v-80h60v240h-60v-100h-80v100h-60ZM500-220h80v-40h-80v40Z"/></svg>,  value: 6.8  },
];


export default function Dashboard() {
  const container = useRef();

  useGSAP(() => {
    gsap.from(".gsap-card", {
      y: 28, opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "power3.out",
    });
    gsap.from(".gsap-sensor", {
      y: 18, opacity: 0,
      stagger: 0.06,
      duration: 0.45,
      delay: 0.3,
      ease: "power2.out",
    });
  }, { scope: container });

  return (
    <div ref={container} className={styles.dashboard}>
      <p className={styles.sectionLabel}>Predictions</p>
      <div className={styles.topCards}>
          <CropCard crop="Wheat" confidence={91} className="gsap-card" />
          <IrrigationCard status="needs" className="gsap-card" />
          <StressCard level={0.55} className="gsap-card" />
          <WeatherCard className="gsap-card" />
      </div>
      <p className={styles.sectionLabel}>Live Sensor Readings</p>
      <div className={styles.sensorGrid}>
        {sensors.map((s) => (
          <SensorCard key={s.label} {...s} className="gsap-sensor" />
        ))}
      </div>

      <p className={styles.sectionLabel}>Trends · Last 7 Days</p>
      <DataChart />

    </div>
  );
}
