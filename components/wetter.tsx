import { useState, useEffect } from 'react';

// Eine einfache Funktion, die zufällige Wetterdaten generiert
const fetchRandomWeatherData = () => {
    const weatherConditions = ['Sonnig', 'Regnerisch', 'Bewölkt', 'Schneefall', 'Stürmisch'];
    const temperature = Math.floor(Math.random() * 35);

    return {
        condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
        temperature: temperature,
    };
};

export default function RandomWeather() {
    const [weather, setWeather] = useState({ condition: 'Unbekannt', temperature: 0 });

    useEffect(() => {
        const timer = setTimeout(() => {
            setWeather(fetchRandomWeatherData());
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            <h1>Zufälliges Wetter</h1>
            <p>Das Wetter ist heute: {weather.condition}</p>
            <p>Temperatur: {weather.temperature}°C</p>
        </div>
    );
}
