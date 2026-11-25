
import React, { useEffect, useMemo, useState } from "react";
import EarthGlobe from "./components/EarthGlobe";
import "./App.css";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const navigation = [
  ["overview", "◈", "Overview"],
  ["planet", "◎", "Planet view"],
  ["forecast", "◷", "Forecast"],
  ["insights", "⌁", "Atmosphere"],
];

function weatherIcon(condition = "") {
  const type = condition.toLowerCase();

  if (type.includes("thunder")) return "⛈️";
  if (type.includes("rain") || type.includes("drizzle")) return "🌧️";
  if (type.includes("snow")) return "❄️";
  if (type.includes("cloud")) return "☁️";
  if (type.includes("clear")) return "☀️";
  if (
    type.includes("mist") ||
    type.includes("haze") ||
    type.includes("fog")
  ) return "🌫️";

  return "🌤️";
}

function Metric({ symbol, label, value, unit, detail }) {
  return (
    <article className="metric">
      <div className="metric-top">
        <span>{symbol}</span>
        <small>{label}</small>
      </div>
      <strong>
        {value}
        <sup>{unit}</sup>
      </strong>
      <p>{detail}</p>
      <i />
    </article>
  );
}

export default function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Start in dark mode
  const [dark, setDark] = useState(false);

  const [page, setPage] = useState("overview");
  const [unit, setUnit] = useState("C");

  async function searchCity(city) {
    if (!API_KEY || API_KEY.includes("PASTE_")) {
      setError("Please add your OpenWeatherMap API key in the .env file.");
      return;
    }

    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const encodedCity = encodeURIComponent(city);

      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&units=metric&appid=${API_KEY}`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&units=metric&appid=${API_KEY}`
        ),
      ]);

      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();

      if (!weatherResponse.ok) {
        throw new Error(weatherData.message || "City not found.");
      }

      if (!forecastResponse.ok) {
        throw new Error(forecastData.message || "Forecast unavailable.");
      }

      setWeather(weatherData);
      setForecast(forecastData.list || []);
      setQuery("");
    } catch (err) {
      setError(err.message || "Unable to load weather information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    searchCity("Chennai");
  }, []);

  function temperature(value) {
    const converted =
      unit === "C" ? value : (value * 9) / 5 + 32;

    return `${Math.round(converted)}°`;
  }

  function localTime(timestamp) {
    if (!weather) return "--:--";

    return new Date(
      (timestamp + weather.timezone) * 1000
    ).toLocaleTimeString("en-GB", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function goToSection(id) {
    setPage(id);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const dailyForecast = useMemo(() => {
    const grouped = {};

    forecast.forEach((item) => {
      const date = new Date(
        (item.dt + (weather?.timezone || 0)) * 1000
      )
        .toISOString()
        .slice(0, 10);

      if (!grouped[date]) {
        grouped[date] = {
          date,
          temperatures: [],
          item,
        };
      }

      grouped[date].temperatures.push(item.main.temp);

      if (item.dt_txt.includes("12:00:00")) {
        grouped[date].item = item;
      }
    });

    return Object.values(grouped).slice(0, 5);
  }, [forecast, weather]);

  return (
    <div className={`app ${dark ? "dark" : ""}`}>

      {/* SIDEBAR */}

      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => goToSection("overview")}
        >
          <b>A</b>
          <span>
            AETHER
            <small>ATMOSPHERIC INTELLIGENCE</small>
          </span>
        </button>

        <label>YOUR WORKSPACE</label>

        <nav>
          {navigation.map(([id, symbol, name]) => (
            <button
              key={id}
              onClick={() => goToSection(id)}
              className={page === id ? "active" : ""}
            >
              <span>{symbol}</span>
              {name}
              {page === id && <i>↗</i>}
            </button>
          ))}
        </nav>

        <div className="side-status">
          <b>✦</b>
          <span>
            Atmosphere online
            <small>Global data connection</small>
          </span>
          <em />
        </div>

        <footer>
          AETHER STUDIO <span>V1.0</span>
        </footer>
      </aside>

      {/* MAIN CONTENT */}

      <main>
        <header className="topbar">
          <div className="crumb">
            WORKSPACE <b>/</b>{" "}
            {navigation.find((item) => item[0] === page)?.[2].toUpperCase()}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              searchCity(query);
            }}
          >
            <span>⌕</span>

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Explore a city..."
            />

            <button disabled={loading}>
              {loading ? "LOADING..." : "SEARCH ↗"}
            </button>
          </form>

          <button
            className="theme"
            onClick={() => setDark((previous) => !previous)}
            title="Switch theme"
          >
            {dark ? "☼" : "☾"}{" "}
            <small>{dark ? "LIGHT" : "DARK"}</small>
          </button>
        </header>

        {error && (
          <div className="error">
            ⚠ {error}
          </div>
        )}

        {loading && !weather ? (
          <div className="loading">
            Gathering atmospheric data...
          </div>
        ) : weather ? (
          <>
            {/* WELCOME */}

            <section className="welcome" id="overview">
              <div>
                <p className="eyebrow">
                  REAL-TIME ATMOSPHERIC INTELLIGENCE
                </p>

                <h1>
                  See beyond
                  <br />
                  <em>the forecast.</em>
                </h1>

                <p>
                  A clearer perspective on the world above you.
                </p>
              </div>

              <span className="live">
                ● LIVE CONDITIONS
              </span>
            </section>

            {/* CURRENT WEATHER AND EARTH */}

            <section className="hero">
              <article className="current">
                <div className="overline">
                  01 / CURRENT CONDITIONS
                  <b>● LIVE</b>
                </div>

                <div className="place">
                  <div>
                    <h2>{weather.name}</h2>
                    <p>
                      {weather.sys.country} ·{" "}
                      {weather.coord.lat.toFixed(2)}°,{" "}
                      {weather.coord.lon.toFixed(2)}°
                    </p>
                  </div>

                  <span>
                    {weatherIcon(weather.weather[0].main)}
                  </span>
                </div>

                <div className="temp">
                  <strong>
                    {temperature(weather.main.temp)}
                  </strong>

                  <div>
                    <b>{weather.weather[0].description}</b>
                    <small>
                      Feels like {temperature(weather.main.feels_like)}
                      {unit}
                    </small>
                  </div>
                </div>

                <hr />

                <div className="sun">
                  <div>
                    ☀
                    <small>SUNRISE</small>
                    <b>{localTime(weather.sys.sunrise)}</b>
                  </div>

                  <div>
                    ◒
                    <small>SUNSET</small>
                    <b>{localTime(weather.sys.sunset)}</b>
                  </div>

                  <button
                    onClick={() =>
                      setUnit((previous) =>
                        previous === "C" ? "F" : "C"
                      )
                    }
                  >
                    °{unit} ↔ °{unit === "C" ? "F" : "C"}
                  </button>
                </div>
              </article>

              <article className="earth-card" id="planet">
                <div className="earth-head">
                  <div>
                    <small>02 / PLANETARY VIEW</small>
                    <h3>
                      Our living planet<span>.</span>
                    </h3>
                  </div>

                  <b>INTERACTIVE 3D</b>
                </div>

                <EarthGlobe weather={weather} />

                <div className="earth-foot">
                  DRAG TO ROTATE · SCROLL TO ZOOM
                  <span>
                    {weather.name.toUpperCase()} MARKER
                  </span>
                </div>
              </article>
            </section>

            {/* ATMOSPHERIC METRICS */}

            <section className="section" id="insights">
              <div className="section-head">
                <div>
                  <small>03 / ENVIRONMENTAL READINGS</small>
                  <h2>Atmospheric profile</h2>
                </div>

                <span>MEASURED IN REAL TIME</span>
              </div>

              <div className="metrics">
                <Metric
                  symbol="◉"
                  label="HUMIDITY"
                  value={`${weather.main.humidity}%`}
                  detail="Relative moisture"
                />

                <Metric
                  symbol="↗"
                  label="WIND SPEED"
                  value={weather.wind.speed.toFixed(1)}
                  unit="m/s"
                  detail={`Direction ${weather.wind.deg ?? 0}°`}
                />

                <Metric
                  symbol="⌁"
                  label="AIR PRESSURE"
                  value={weather.main.pressure}
                  unit="hPa"
                  detail="Sea-level pressure"
                />

                <Metric
                  symbol="◌"
                  label="VISIBILITY"
                  value={(weather.visibility / 1000).toFixed(1)}
                  unit="km"
                  detail="Horizontal range"
                />
              </div>
            </section>

            {/* WEATHER FORECAST */}

            <section className="section" id="forecast">
              <div className="section-head">
                <div>
                  <small>04 / THE NEXT 24 HOURS</small>
                  <h2>Weather timeline</h2>
                </div>

                <span>3-HOUR FORECAST INTERVALS</span>
              </div>

              <div className="hours">
                {forecast.slice(0, 8).map((item, index) => (
                  <article key={item.dt}>
                    <small>
                      {index === 0
                        ? "NEXT"
                        : new Date(
                            (item.dt + weather.timezone) * 1000
                          ).toLocaleTimeString("en-GB", {
                            timeZone: "UTC",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </small>

                    <b>
                      {weatherIcon(item.weather[0].main)}
                    </b>

                    <strong>
                      {temperature(item.main.temp)}
                      {unit}
                    </strong>

                    <i>{item.main.humidity}% RH</i>
                  </article>
                ))}
              </div>

              <div className="section-head weekly-title">
                <div>
                  <small>05 / EXTENDED OUTLOOK</small>
                  <h2>Five-day outlook</h2>
                </div>

                <span>MODEL FORECAST</span>
              </div>

              <div className="week">
                {dailyForecast.map((day) => (
                  <div key={day.date}>
                    <b>
                      {new Date(
                        day.date + "T12:00:00"
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                      })}
                    </b>

                    <span>
                      {weatherIcon(day.item.weather[0].main)}{" "}
                      <small>
                        {day.item.weather[0].description}
                      </small>
                    </span>

                    <strong>
                      {temperature(Math.min(...day.temperatures))}
                      {unit}
                      <i />
                      {temperature(Math.max(...day.temperatures))}
                      {unit}
                    </strong>
                  </div>
                ))}
              </div>

              <p className="note">
                Forecast values use the 3-hour forecast feed.
                The first and last days may be partial.
              </p>
            </section>

            <footer className="page-foot">
              ✦ AETHER WEATHER INTELLIGENCE
              <span>
                DATA BY OPENWEATHER · BUILT FOR CURIOSITY
              </span>
            </footer>
          </>
        ) : null}
      </main>
    </div>
  );
}
