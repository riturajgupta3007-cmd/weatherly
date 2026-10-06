/* =====================================================
   WEATHERLY SMART WEATHER
   COMPLETE JAVASCRIPT
   ===================================================== */

const API = {
  forecast: "https://api.open-meteo.com/v1/forecast",
  geocode: "https://geocoding-api.open-meteo.com/v1/search",
  reverse: "https://api.bigdatacloud.net/data/reverse-geocode-client"
};

const state = {
  lat: 26.7606,
  lon: 83.3732,

  place: {
    name: "Gorakhpur",
    country: "India",
    admin: "Uttar Pradesh"
  },

  data: null,
  loading: false
};

const $ = id => document.getElementById(id);

const els = {
  themeBtn: $("themeBtn"),
  locationBtn: $("locationBtn"),
  refreshBtn: $("refreshBtn"),

  searchForm: $("searchForm"),
  cityInput: $("cityInput"),
  searchResults: $("searchResults"),

  statusBar: $("statusBar"),
  statusText: $("statusText"),

  placeName: $("placeName"),
  placeMeta: $("placeMeta"),
  timezoneText: $("timezoneText"),
  liveText: $("liveText"),

  weatherArt: $("weatherArt"),
  temperature: $("temperature"),
  condition: $("condition"),
  feelsLike: $("feelsLike"),
  pressure: $("pressure"),
  windDir: $("windDir"),
  rainChance: $("rainChance"),

  sunrise: $("sunrise"),
  sunset: $("sunset"),
  sunProgress: $("sunProgress"),
  sunDot: $("sunDot"),

  humidity: $("humidity"),
  wind: $("wind"),
  visibility: $("visibility"),
  uv: $("uv"),

  adviceTitle: $("adviceTitle"),
  adviceIcon: $("adviceIcon"),
  adviceList: $("adviceList"),

  hourlyList: $("hourlyList"),
  hourlyZone: $("hourlyZone"),

  dailyList: $("dailyList"),

  chatBox: $("chatBox"),
  chatForm: $("chatForm"),
  chatInput: $("chatInput"),

  toast: $("toast")
};


/* =====================================================
   WEATHER CODES
   ===================================================== */

const WEATHER = {
  0: ["Clear sky", "clear"],
  1: ["Mainly clear", "clear"],
  2: ["Partly cloudy", "partly"],
  3: ["Overcast", "cloudy"],

  45: ["Fog", "fog"],
  48: ["Rime fog", "fog"],

  51: ["Light drizzle", "rain"],
  53: ["Moderate drizzle", "rain"],
  55: ["Dense drizzle", "rain"],

  56: ["Freezing drizzle", "rain"],
  57: ["Dense freezing drizzle", "rain"],

  61: ["Slight rain", "rain"],
  63: ["Moderate rain", "rain"],
  65: ["Heavy rain", "rain"],

  66: ["Freezing rain", "rain"],
  67: ["Heavy freezing rain", "rain"],

  71: ["Slight snow", "snow"],
  73: ["Moderate snow", "snow"],
  75: ["Heavy snow", "snow"],
  77: ["Snow grains", "snow"],

  80: ["Rain showers", "rain"],
  81: ["Moderate rain showers", "rain"],
  82: ["Heavy rain showers", "rain"],

  85: ["Snow showers", "snow"],
  86: ["Heavy snow showers", "snow"],

  95: ["Thunderstorm", "storm"],
  96: ["Thunderstorm with hail", "storm"],
  99: ["Thunderstorm with heavy hail", "storm"]
};


/* =====================================================
   STATUS
   ===================================================== */

function setStatus(message, type = "ok") {
  if (!els.statusText || !els.statusBar) return;

  els.statusText.textContent = message;

  els.statusBar.className =
    "status-bar " +
    (
      type === "loading"
        ? "loading"
        : type === "error"
          ? "error"
          : ""
    );
}


/* =====================================================
   TOAST
   ===================================================== */

function toast(message) {
  if (!els.toast) return;

  els.toast.textContent = message;
  els.toast.classList.add("show");

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2600);
}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[c])
  );
}


/* =====================================================
   WEATHER INFO
   ===================================================== */

function weatherInfo(code) {
  return WEATHER[code] || ["Unknown", "cloudy"];
}


/* =====================================================
   WIND DIRECTION
   ===================================================== */

function windDirection(deg) {
  const dirs = [
    "N",
    "NE",
    "E",
    "SE",
    "S",
    "SW",
    "W",
    "NW"
  ];

  return dirs[
    Math.round(Number(deg || 0) / 45) % 8
  ];
}


/* =====================================================
   TIME
   ===================================================== */

function formatTime(value) {
  if (!value) return "--:--";

  const parts = String(value).split("T");

  return parts[1]
    ? parts[1].slice(0, 5)
    : "--:--";
}


function formatDay(value, index) {
  if (index === 0) return "Today";

  return new Date(
    value + "T12:00:00"
  ).toLocaleDateString(
    undefined,
    {
      weekday: "short"
    }
  );
}


/* =====================================================
   WEATHER ICON
   ===================================================== */

function iconForType(type, isDay = true) {

  if (type === "clear") {
    return isDay ? "☀" : "☾";
  }

  if (type === "partly") return "⛅";
  if (type === "rain") return "🌧";
  if (type === "snow") return "❄";
  if (type === "storm") return "⛈";
  if (type === "fog") return "≋";

  return "☁";
}


/* =====================================================
   MOON VISUAL
   ===================================================== */

function createMoonSVG() {
  return `
    <svg
      class="moon-svg"
      viewBox="0 0 180 180"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient
          id="moonGradient"
          cx="35%"
          cy="30%"
        >
          <stop
            offset="0%"
            stop-color="#fffde8"
          />
          <stop
            offset="55%"
            stop-color="#f8efc5"
          />
          <stop
            offset="100%"
            stop-color="#ded3a5"
          />
        </radialGradient>
      </defs>

      <circle
        class="moon-glow"
        cx="90"
        cy="90"
        r="69"
      />

      <circle
        class="moon-body"
        cx="90"
        cy="90"
        r="57"
        fill="url(#moonGradient)"
      />

      <circle
        class="moon-crater"
        cx="65"
        cy="66"
        r="9"
      />

      <circle
        class="moon-crater"
        cx="110"
        cy="54"
        r="7"
      />

      <circle
        class="moon-crater"
        cx="119"
        cy="91"
        r="11"
      />

      <circle
        class="moon-crater"
        cx="78"
        cy="110"
        r="6"
      />

      <circle
        class="moon-crater"
        cx="101"
        cy="126"
        r="8"
      />

      <circle
        class="star"
        cx="31"
        cy="46"
        r="2"
      />

      <circle
        class="star"
        cx="145"
        cy="39"
        r="2"
      />

      <circle
        class="star"
        cx="151"
        cy="120"
        r="1.8"
      />

      <circle
        class="star"
        cx="42"
        cy="135"
        r="1.5"
      />
    </svg>
  `;
}


/* =====================================================
   SUN VISUAL
   ===================================================== */

function createSunSVG() {
  return `
    <svg
      class="sun-svg"
      viewBox="0 0 180 180"
      xmlns="http://www.w3.org/2000/svg"
    >

      <defs>
        <radialGradient
          id="sunGradient"
          cx="35%"
          cy="28%"
        >
          <stop
            offset="0%"
            stop-color="#fff9b0"
          />

          <stop
            offset="55%"
            stop-color="#ffe45f"
          />

          <stop
            offset="100%"
            stop-color="#ffb52d"
          />
        </radialGradient>
      </defs>

      <circle
        cx="90"
        cy="90"
        r="67"
        fill="none"
        stroke="#ffc64a"
        stroke-width="2"
        stroke-dasharray="5 7"
      />

      <circle
        cx="90"
        cy="90"
        r="50"
        fill="url(#sunGradient)"
      />

      <ellipse
        cx="72"
        cy="68"
        rx="16"
        ry="9"
        fill="rgba(255,255,255,.55)"
        transform="rotate(-25 72 68)"
      />

    </svg>
  `;
}


/* =====================================================
   WEATHER VISUAL
   ===================================================== */

function weatherVisual(type, isDay) {

  if (type === "clear" && !isDay) {
    return createMoonSVG();
  }

  if (type === "clear" && isDay) {
    return createSunSVG();
  }

  if (type === "partly") {
    return `
      <div class="weather-scene">
        ${createSunSVG()}

        <div class="weather-cloud"></div>
      </div>
    `;
  }

  if (type === "rain" || type === "storm") {
    return `
      <div class="weather-scene">

        <div class="weather-cloud"></div>

        <div class="weather-rain">
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
        </div>

      </div>
    `;
  }

  if (type === "snow") {
    return `
      <div class="weather-scene">

        <div class="weather-cloud"></div>

        <div class="weather-snow">
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
        </div>

      </div>
    `;
  }

  if (type === "fog") {
    return `
      <div class="weather-scene">
        <div class="weather-cloud"></div>

        <div class="fog-lines">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
  }

  return `
    <div class="weather-scene">
      <div class="weather-cloud"></div>
    </div>
  `;
}


/* =====================================================
   CURRENT RAIN CHANCE
   ===================================================== */

function getCurrentRainChance() {

  if (!state.data) return 0;

  const c = state.data.current;

  if (
    typeof c.precipitation_probability ===
    "number"
  ) {
    return Math.round(
      c.precipitation_probability
    );
  }

  const h = state.data.hourly;

  if (!h || !h.time) return 0;

  const current = c.time;

  let index = h.time.findIndex(
    t => t >= current
  );

  if (index < 0) index = 0;

  return Math.round(
    h.precipitation_probability[index] || 0
  );
}


/* =====================================================
   FORECAST URL
   ===================================================== */

function buildForecastURL(lat, lon) {

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,

    current:
      [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "rain",
        "showers",
        "snowfall",
        "weather_code",
        "cloud_cover",
        "pressure_msl",
        "wind_speed_10m",
        "wind_direction_10m",
        "visibility",
        "uv_index"
      ].join(","),

    hourly:
      [
        "temperature_2m",
        "apparent_temperature",
        "precipitation_probability",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "relative_humidity_2m",
        "visibility",
        "uv_index",
        "is_day"
      ].join(","),

    daily:
      [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "sunrise",
        "sunset",
        "uv_index_max",
        "precipitation_probability_max",
        "precipitation_sum",
        "wind_speed_10m_max"
      ].join(","),

    timezone: "auto",
    forecast_days: "7"
  });

  return `${API.forecast}?${params}`;
}


/* =====================================================
   FETCH
   ===================================================== */

async function fetchJSON(url) {

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status}`
    );
  }

  return response.json();
}


/* =====================================================
   SUN TRACK
   ===================================================== */

function renderSun(d) {

  if (
    !d ||
    !d.daily ||
    !d.daily.sunrise ||
    !d.daily.sunset
  ) {
    return;
  }

  const sunrise = d.daily.sunrise[0];
  const sunset = d.daily.sunset[0];

  if (!sunrise || !sunset) return;

  if (els.sunrise) {
    els.sunrise.textContent =
      formatTime(sunrise);
  }

  if (els.sunset) {
    els.sunset.textContent =
      formatTime(sunset);
  }

  const now = new Date();

  const start =
    new Date(
      sunrise.replace("T", " ") + ":00"
    );

  const end =
    new Date(
      sunset.replace("T", " ") + ":00"
    );

  let progress =
    ((now - start) /
      (end - start)) * 100;

  if (!Number.isFinite(progress)) {
    progress = 0;
  }

  progress = Math.max(
    0,
    Math.min(100, progress)
  );

  if (els.sunProgress) {
    els.sunProgress.style.width =
      `${progress}%`;
  }

  if (els.sunDot) {
    els.sunDot.style.left =
      `${progress}%`;
  }
}


/* =====================================================
   ADVICE
   ===================================================== */

function renderAdvice() {

  if (!state.data) return;

  const c = state.data.current;

  const rain =
    getCurrentRainChance();

  const temp =
    Number(c.temperature_2m || 0);

  const wind =
    Number(c.wind_speed_10m || 0);

  const uv =
    Number(c.uv_index || 0);

  const items = [];

  if (rain >= 60) {

    items.push([
      "☂",
      "Rain alert",
      "Rain probability is high. Carry an umbrella and keep outdoor plans flexible."
    ]);

  } else if (rain >= 30) {

    items.push([
      "☁",
      "Possible rain",
      "There is some rain risk. An umbrella may be useful."
    ]);

  } else {

    items.push([
      "☀",
      "Low rain risk",
      "Rain probability is currently low."
    ]);
  }


  if (temp >= 35) {

    items.push([
      "♨",
      "Hot weather",
      "Wear light clothes and take regular water breaks."
    ]);

  } else if (temp <= 12) {

    items.push([
      "🧥",
      "Cool weather",
      "A warm layer may be useful."
    ]);

  } else {

    items.push([
      "✓",
      "Comfortable temperature",
      "Temperature is generally comfortable for outdoor activity."
    ]);
  }


  if (wind >= 30) {

    items.push([
      "≋",
      "Strong wind",
      "Be careful with cycling and loose outdoor equipment."
    ]);
  }


  if (uv >= 6) {

    items.push([
      "☼",
      "High UV",
      "Prefer shade and sun protection."
    ]);
  }


  if (els.adviceTitle) {
    els.adviceTitle.textContent =
      rain >= 60
        ? "Plan around rain"
        : temp >= 35
          ? "Stay cool today"
          : "Good to know";
  }

  if (els.adviceIcon) {
    els.adviceIcon.textContent =
      rain >= 60
        ? "☂"
        : temp >= 35
          ? "♨"
          : "✦";
  }

  if (els.adviceList) {
    els.adviceList.innerHTML =
      items
        .slice(0, 4)
        .map(item => `
          <div class="advice-item">

            <span class="ico">
              ${item[0]}
            </span>

            <div>
              <b>${item[1]}</b>

              <p>${item[2]}</p>
            </div>

          </div>
        `)
        .join("");
  }
}


/* =====================================================
   ACTIVITY SCORE
   ===================================================== */

function activityScore(type) {

  const c = state.data.current;

  const rain =
    getCurrentRainChance();

  const temp =
    Number(c.temperature_2m || 0);

  const wind =
    Number(c.wind_speed_10m || 0);

  const humidity =
    Number(c.relative_humidity_2m || 0);

  let score = 92;

  if (rain > 10) {
    score -= Math.min(
      35,
      rain * 0.35
    );
  }

  if (rain >= 70) {
    score -= 15;
  }

  if (wind > 20) {
    score -= Math.min(
      20,
      (wind - 20) * 0.7
    );
  }


  if (type === "cricket") {

    if (temp > 34) score -= 18;
    if (temp < 15) score -= 8;
    if (humidity > 80) score -= 8;

  }


  if (type === "running") {

    if (temp > 30) score -= 20;
    if (temp < 8) score -= 8;
    if (humidity > 75) score -= 10;

  }


  if (type === "cycling") {

    if (temp > 34) score -= 15;
    if (wind > 28) score -= 12;

  }


  if (type === "walking") {

    if (temp > 37) score -= 14;
    if (temp < 7) score -= 7;

  }


  return Math.max(
    5,
    Math.min(
      99,
      Math.round(score)
    )
  );
}


function activityText(score) {

  if (score >= 80)
    return "Favorable conditions.";

  if (score >= 60)
    return "Generally okay; check the latest forecast before leaving.";

  if (score >= 40)
    return "Mixed conditions; consider a shorter session.";

  return "Less suitable right now; consider another time.";
}


function setActivity(id, score) {

  const scoreEl = $(`${id}Score`);
  const barEl = $(`${id}Bar`);
  const textEl = $(`${id}Text`);

  if (scoreEl)
    scoreEl.textContent = `${score}%`;

  if (barEl)
    barEl.style.width = `${score}%`;

  if (textEl)
    textEl.textContent =
      activityText(score);
}


function renderActivities() {

  if (!state.data) return;

  setActivity(
    "cricket",
    activityScore("cricket")
  );

  setActivity(
    "running",
    activityScore("running")
  );

  setActivity(
    "cycling",
    activityScore("cycling")
  );

  setActivity(
    "walking",
    activityScore("walking")
  );
}


/* =====================================================
   HOURLY
   ===================================================== */

function renderHourly() {

  if (!state.data || !els.hourlyList)
    return;

  const h =
    state.data.hourly;

  const current =
    state.data.current.time;

  let start =
    h.time.findIndex(
      t => t >= current
    );

  if (start < 0)
    start = 0;

  const end =
    Math.min(
      start + 24,
      h.time.length
    );

  els.hourlyList.innerHTML =
    h.time
      .slice(start, end)
      .map((time, index) => {

        const i =
          start + index;

        const [, type] =
          weatherInfo(
            h.weather_code[i]
          );

        const rain =
          Math.round(
            h.precipitation_probability[i] || 0
          );

        return `
          <div class="hour-card ${
            time === current
              ? "current"
              : ""
          }">

            <small>
              ${
                time === current
                  ? "Now"
                  : formatTime(time)
              }
            </small>

            <div class="hour-icon">
              ${
                iconForType(
                  type,
                  Boolean(h.is_day[i])
                )
              }
            </div>

            <b>
              ${Math.round(
                h.temperature_2m[i]
              )}°
            </b>

            <em>
              ☂ ${rain}%
            </em>

          </div>
        `;
      })
      .join("");

  if (els.hourlyZone) {
    els.hourlyZone.textContent =
      state.data.timezone ||
      "Local time";
  }
}


/* =====================================================
   DAILY
   ===================================================== */

function renderDaily() {

  if (!state.data || !els.dailyList)
    return;

  const d =
    state.data.daily;

  els.dailyList.innerHTML =
    d.time
      .map((date, index) => {

        const [
          condition,
          type
        ] =
          weatherInfo(
            d.weather_code[index]
          );

        return `
          <div class="day-card ${
            index === 0
              ? "today"
              : ""
          }">

            <b>
              ${formatDay(
                date,
                index
              )}
            </b>

            <div class="day-icon">
              ${
                iconForType(
                  type,
                  true
                )
              }
            </div>

            <div class="temps">

              <b>
                ${Math.round(
                  d.temperature_2m_max[index]
                )}°
              </b>

              <span>
                ${Math.round(
                  d.temperature_2m_min[index]
                )}°
              </span>

            </div>

            <small>
              ☂ ${
                Math.round(
                  d.precipitation_probability_max[index] || 0
                )
              }%
              ·
              ${condition}
            </small>

          </div>
        `;
      })
      .join("");
}


/* =====================================================
   SEARCH
   ===================================================== */

let searchTimer;

if (els.cityInput) {

  els.cityInput.addEventListener(
    "input",
    () => {

      clearTimeout(searchTimer);

      const query =
        els.cityInput.value.trim();

      if (query.length < 2) {

        if (els.searchResults) {
          els.searchResults.classList.add(
            "hidden"
          );
        }

        return;
      }

      searchTimer =
        setTimeout(
          () => searchCities(query),
          300
        );
    }
  );
}


async function searchCities(query) {

  try {

    const url =
      `${API.geocode}?name=${
        encodeURIComponent(query)
      }&count=7&language=en&format=json`;

    const data =
      await fetchJSON(url);

    const results =
      data.results || [];

    if (!els.searchResults)
      return;

    if (!results.length) {

      els.searchResults.innerHTML = `
        <div style="
          padding:14px;
          font-size:10px;
          color:#8b96a8;
        ">
          No locations found.
        </div>
      `;

    } else {

      els.searchResults.innerHTML =
        results
          .map((place, index) => `
            <button
              type="button"
              class="search-result"
              data-index="${index}"
            >
              <strong>
                ${escapeHTML(place.name)}
              </strong>

              <small>
                ${escapeHTML(
                  [
                    place.admin1,
                    place.country
                  ]
                    .filter(Boolean)
                    .join(", ")
                )}
              </small>
            </button>
          `)
          .join("");

      els.searchResults
        .classList
        .remove("hidden");

      els.searchResults
        .querySelectorAll(
          ".search-result"
        )
        .forEach(button => {

          button.addEventListener(
            "click",
            () => {

              const place =
                results[
                  Number(
                    button.dataset.index
                  )
                ];

              selectPlace(place);
            }
          );
        });
    }

  } catch (error) {

    console.error(error);

    toast(
      "Unable to search locations."
    );
  }
}


function selectPlace(place) {

  if (!place) return;

  state.lat =
    Number(place.latitude);

  state.lon =
    Number(place.longitude);

  state.place = {
    name:
      place.name || "Unknown",
    country:
      place.country || "India",
    admin:
      place.admin1 ||
      place.admin2 ||
      ""
  };

  if (els.cityInput) {
    els.cityInput.value =
      place.name || "";
  }

  if (els.searchResults) {
    els.searchResults
      .classList
      .add("hidden");
  }

  loadWeather();
}


/* =====================================================
   SEARCH FORM
   ===================================================== */

if (els.searchForm) {

  els.searchForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const query =
        els.cityInput
          ? els.cityInput.value.trim()
          : "";

      if (!query) {
        toast("Enter a city name.");
        return;
      }

      searchCities(query);
    }
  );
}


/* =====================================================
   LOCATION
   ===================================================== */

async function detectLocation() {

  if (!navigator.geolocation) {

    toast(
      "Geolocation is not supported."
    );

    return;
  }

  setStatus(
    "Detecting your location...",
    "loading"
  );

  navigator.geolocation.getCurrentPosition(

    async position => {

      state.lat =
        position.coords.latitude;

      state.lon =
        position.coords.longitude;

      try {

        const url =
          `${API.reverse}?latitude=${
            state.lat
          }&longitude=${
            state.lon
          }&localityLanguage=en`;

        const data =
          await fetchJSON(url);

        state.place = {
          name:
            data.city ||
            data.locality ||
            data.principalSubdivision ||
            "My Location",

          country:
            data.countryName ||
            "India",

          admin:
            data.principalSubdivision ||
            ""
        };

      } catch (error) {

        console.error(error);

        state.place = {
          name: "My Location",
          country: "India",
          admin: ""
        };
      }

      loadWeather();
    },

    error => {

      console.error(error);

      setStatus(
        "Location permission was not available.",
        "error"
      );

      toast(
        "Please allow location access."
      );
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    }
  );
}


/* =====================================================
   THEME
   ===================================================== */

function applyTheme(theme) {

  document.body.classList.toggle(
    "dark",
    theme === "dark"
  );

  localStorage.setItem(
    "weatherlyTheme",
    theme
  );
}


function initTheme() {

  const saved =
    localStorage.getItem(
      "weatherlyTheme"
    );

  if (saved) {

    applyTheme(saved);

  } else {

    const prefersDark =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

    applyTheme(
      prefersDark
        ? "dark"
        : "light"
    );
  }
}


if (els.themeBtn) {

  els.themeBtn.addEventListener(
    "click",
    () => {

      const isDark =
        document.body.classList.contains(
          "dark"
        );

      applyTheme(
        isDark
          ? "light"
          : "dark"
      );
    }
  );
}


/* =====================================================
   LOAD WEATHER
   ===================================================== */

async function loadWeather() {

  if (state.loading)
    return;

  state.loading = true;

  setStatus(
    "Updating live weather...",
    "loading"
  );

  try {

    const data =
      await fetchJSON(
        buildForecastURL(
          state.lat,
          state.lon
        )
      );

    state.data = data;

    renderAll();

    setStatus(
      "Weather updated just now"
    );

  } catch (error) {

    console.error(error);

    setStatus(
      "Unable to load weather data.",
      "error"
    );

    toast(
      "Weather data could not be loaded."
    );

  } finally {

    state.loading = false;
  }
}


/* =====================================================
   REFRESH BUTTON
   ===================================================== */

if (els.refreshBtn) {

  els.refreshBtn.addEventListener(
    "click",
    loadWeather
  );
}


if (els.locationBtn) {

  els.locationBtn.addEventListener(
    "click",
    detectLocation
  );
}
/* =====================================================
   BEST TIME RECOMMENDATION
   ===================================================== */

function getActivityHourScore(
  activity,
  temperature,
  rain,
  wind,
  humidity,
  uv,
  weatherType
) {

  let score = 100;


  /* Rain */

  if (rain >= 70) {
    score -= 45;

  } else if (rain >= 50) {
    score -= 30;

  } else if (rain >= 30) {
    score -= 18;

  } else if (rain >= 15) {
    score -= 8;
  }


  /* Wind */

  if (wind > 35) {
    score -= 25;

  } else if (wind > 28) {
    score -= 17;

  } else if (wind > 20) {
    score -= 8;
  }


  /* Weather */

  if (weatherType === "storm") {
    score -= 40;
  }

  if (weatherType === "snow") {
    score -= 20;
  }


  /* Cricket */

  if (activity === "cricket") {

    if (temperature > 35) {
      score -= 25;

    } else if (temperature > 32) {
      score -= 12;
    }

    if (temperature < 15) {
      score -= 12;
    }

    if (humidity > 85) {
      score -= 12;
    }

    if (uv >= 8) {
      score -= 10;
    }
  }


  /* Running */

  if (activity === "running") {

    if (temperature > 32) {
      score -= 25;

    } else if (temperature > 29) {
      score -= 12;
    }

    if (temperature < 8) {
      score -= 12;
    }

    if (humidity > 80) {
      score -= 15;
    }

    if (uv >= 7) {
      score -= 12;
    }
  }


  /* Cycling */

  if (activity === "cycling") {

    if (temperature > 35) {
      score -= 22;

    } else if (temperature > 32) {
      score -= 10;
    }

    if (temperature < 10) {
      score -= 10;
    }

    if (wind > 25) {
      score -= 15;
    }

    if (rain >= 30) {
      score -= 15;
    }
  }


  /* Walking */

  if (activity === "walking") {

    if (temperature > 36) {
      score -= 25;

    } else if (temperature > 32) {
      score -= 12;
    }

    if (temperature < 8) {
      score -= 8;
    }

    if (humidity > 85) {
      score -= 8;
    }

    if (uv >= 8) {
      score -= 10;
    }
  }


  return Math.max(
    5,
    Math.min(
      99,
      Math.round(score)
    )
  );
}


/* =====================================================
   BEST TIME MESSAGE
   ===================================================== */

function getBestTimeMessage(score) {

  if (score >= 85) {
    return "Excellent conditions for this activity.";
  }

  if (score >= 70) {
    return "Good conditions for outdoor activity.";
  }

  if (score >= 55) {
    return "Fair conditions; plan with some caution.";
  }

  if (score >= 40) {
    return "Mixed conditions; consider a shorter session.";
  }

  return "Not ideal; another time may be better.";
}


/* =====================================================
   FORMAT HOUR RANGE
   ===================================================== */

function formatHourRange(
  startTime,
  endTime
) {

  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}


/* =====================================================
   FIND BEST ACTIVITY TIME
   ===================================================== */

function findBestActivityTime(activity) {

  if (
    !state.data ||
    !state.data.hourly
  ) {
    return null;
  }

  const h =
    state.data.hourly;

  const current =
    state.data.current.time;

  let start =
    h.time.findIndex(
      time => time >= current
    );

  if (start < 0) {
    start = 0;
  }

  const maxHours =
    Math.min(
      start + 18,
      h.time.length
    );

  let best = null;


  for (
    let i = start;
    i < maxHours;
    i++
  ) {

    const temperature =
      Number(
        h.temperature_2m[i] || 0
      );

    const rain =
      Number(
        h.precipitation_probability[i] || 0
      );

    const wind =
      Number(
        h.wind_speed_10m[i] || 0
      );

    const humidity =
      Number(
        h.relative_humidity_2m[i] || 0
      );

    const uv =
      Number(
        h.uv_index[i] || 0
      );

    const code =
      Number(
        h.weather_code[i] || 0
      );

    const [
      ,
      weatherType
    ] =
      weatherInfo(code);


    const score =
      getActivityHourScore(
        activity,
        temperature,
        rain,
        wind,
        humidity,
        uv,
        weatherType
      );


    const candidate = {
      index: i,
      score,
      temperature,
      rain,
      wind,
      humidity,
      uv,
      time: h.time[i]
    };


    if (
      !best ||
      candidate.score > best.score
    ) {
      best = candidate;
    }
  }


  return best;
}


/* =====================================================
   RENDER BEST TIME CARD
   ===================================================== */

function renderBestTimeCard(
  activity,
  timeId,
  tempId,
  rainId,
  windId,
  textId
) {

  const result =
    findBestActivityTime(
      activity
    );


  if (!result) {

    if ($(timeId))
      $(timeId).textContent =
        "No forecast available";

    if ($(tempId))
      $(tempId).textContent =
        "🌡️ --°C";

    if ($(rainId))
      $(rainId).textContent =
        "🌧️ --%";

    if ($(windId))
      $(windId).textContent =
        "💨 -- km/h";

    if ($(textId))
      $(textId).textContent =
        "Weather forecast is unavailable.";

    return;
  }


  const nextIndex =
    Math.min(
      result.index + 2,
      state.data.hourly.time.length - 1
    );


  const startTime =
    state.data.hourly.time[
      result.index
    ];

  const endTime =
    state.data.hourly.time[
      nextIndex
    ];


  if ($(timeId)) {

    $(timeId).textContent =
      formatHourRange(
        startTime,
        endTime
      );
  }


  if ($(tempId)) {

    $(tempId).textContent =
      `🌡️ ${Math.round(
        result.temperature
      )}°C`;
  }


  if ($(rainId)) {

    $(rainId).textContent =
      `🌧️ ${Math.round(
        result.rain
      )}%`;
  }


  if ($(windId)) {

    $(windId).textContent =
      `💨 ${Math.round(
        result.wind
      )} km/h`;
  }


  if ($(textId)) {

    $(textId).textContent =
      getBestTimeMessage(
        result.score
      );
  }
}


/* =====================================================
   RENDER ALL BEST TIMES
   ===================================================== */

function renderBestTimes() {

  if (!state.data)
    return;


  renderBestTimeCard(
    "cricket",
    "cricketBestTime",
    "cricketBestTemp",
    "cricketBestRain",
    "cricketBestWind",
    "cricketBestText"
  );


  renderBestTimeCard(
    "running",
    "runningBestTime",
    "runningBestTemp",
    "runningBestRain",
    "runningBestWind",
    "runningBestText"
  );


  renderBestTimeCard(
    "cycling",
    "cyclingBestTime",
    "cyclingBestTemp",
    "cyclingBestRain",
    "cyclingBestWind",
    "cyclingBestText"
  );


  renderBestTimeCard(
    "walking",
    "walkingBestTime",
    "walkingBestTemp",
    "walkingBestRain",
    "walkingBestWind",
    "walkingBestText"
  );
}


/* =====================================================
   SMART WEATHER ALERTS
   ===================================================== */

function renderSmartAlerts() {

  const container =
    $("smartAlerts");

  if (!container)
    return;


  if (
    !state.data ||
    !state.data.hourly
  ) {

    container.innerHTML = `
      <div class="smart-alert info">
        <span class="smart-alert-icon">⏳</span>

        <div class="smart-alert-content">
          <b>Analyzing weather...</b>
          <p>Checking the upcoming forecast.</p>
        </div>
      </div>
    `;

    return;
  }


  const h =
    state.data.hourly;

  const current =
    state.data.current.time;


  let start =
    h.time.findIndex(
      t => t >= current
    );

  if (start < 0)
    start = 0;


  const end =
    Math.min(
      start + 12,
      h.time.length
    );


  const alerts = [];


  /* ---------------------------------------------
     RAIN
     --------------------------------------------- */

  let maxRain = 0;
  let maxRainIndex = start;


  for (
    let i = start;
    i < end;
    i++
  ) {

    const rain =
      Number(
        h.precipitation_probability[i] || 0
      );

    if (rain > maxRain) {
      maxRain = rain;
      maxRainIndex = i;
    }
  }


  if (maxRain >= 70) {

    alerts.push({
      type: "danger",
      icon: "🌧️",
      title: "High rain chance",
      text:
        `Rain probability may reach ${Math.round(
          maxRain
        )}% around ${formatTime(
          h.time[maxRainIndex]
        )}. Keep an umbrella ready.`
    });

  } else if (maxRain >= 40) {

    alerts.push({
      type: "warning",
      icon: "☂️",
      title: "Possible rain",
      text:
        `Rain probability may reach ${Math.round(
          maxRain
        )}% around ${formatTime(
          h.time[maxRainIndex]
        )}.`
    });
  }


  /* ---------------------------------------------
     WIND
     --------------------------------------------- */

  let maxWind = 0;
  let maxWindIndex = start;


  for (
    let i = start;
    i < end;
    i++
  ) {

    const wind =
      Number(
        h.wind_speed_10m[i] || 0
      );

    if (wind > maxWind) {
      maxWind = wind;
      maxWindIndex = i;
    }
  }


  if (maxWind >= 35) {

    alerts.push({
      type: "danger",
      icon: "💨",
      title: "Strong winds",
      text:
        `Wind may reach ${Math.round(
          maxWind
        )} km/h around ${formatTime(
          h.time[maxWindIndex]
        )}. Outdoor activities may be uncomfortable.`
    });

  } else if (maxWind >= 25) {

    alerts.push({
      type: "warning",
      icon: "≋",
      title: "Windy conditions",
      text:
        `Wind may reach ${Math.round(
          maxWind
        )} km/h during the next few hours.`
    });
  }


  /* ---------------------------------------------
     TEMPERATURE
     --------------------------------------------- */

  let maxTemp = -Infinity;
  let maxTempIndex = start;


  for (
    let i = start;
    i < end;
    i++
  ) {

    const temp =
      Number(
        h.temperature_2m[i] || 0
      );

    if (temp > maxTemp) {
      maxTemp = temp;
      maxTempIndex = i;
    }
  }


  if (maxTemp >= 38) {

    alerts.push({
      type: "danger",
      icon: "🔥",
      title: "Very hot conditions",
      text:
        `Temperature may reach ${Math.round(
          maxTemp
        )}°C around ${formatTime(
          h.time[maxTempIndex]
        )}. Stay hydrated and avoid unnecessary heat exposure.`
    });

  } else if (maxTemp >= 35) {

    alerts.push({
      type: "warning",
      icon: "🌡️",
      title: "Hot weather",
      text:
        `Temperature may reach ${Math.round(
          maxTemp
        )}°C around ${formatTime(
          h.time[maxTempIndex]
        )}.`
    });
  }


  /* ---------------------------------------------
     UV
     --------------------------------------------- */

  let maxUV = 0;
  let maxUVIndex = start;


  for (
    let i = start;
    i < end;
    i++
  ) {

    const uv =
      Number(
        h.uv_index[i] || 0
      );

    if (uv > maxUV) {
      maxUV = uv;
      maxUVIndex = i;
    }
  }


  if (maxUV >= 8) {

    alerts.push({
      type: "warning",
      icon: "☀️",
      title: "High UV index",
      text:
        `UV index may reach ${Math.round(
          maxUV
        )}. Prefer shade and use sun protection during peak hours.`
    });

  } else if (maxUV >= 6) {

    alerts.push({
      type: "info",
      icon: "🕶️",
      title: "Moderate to high UV",
      text:
        "Sun protection may be useful during outdoor activities."
    });
  }


  /* ---------------------------------------------
     VISIBILITY
     --------------------------------------------- */

  let minVisibility = Infinity;
  let minVisibilityIndex = start;


  for (
    let i = start;
    i < end;
    i++
  ) {

    const visibility =
      Number(
        h.visibility[i] || Infinity
      ) / 1000;

    if (
      visibility < minVisibility
    ) {

      minVisibility =
        visibility;

      minVisibilityIndex =
        i;
    }
  }


  if (
    minVisibility < 3 &&
    Number.isFinite(minVisibility)
  ) {

    alerts.push({
      type: "warning",
      icon: "🌫️",
      title: "Low visibility",
      text:
        `Visibility may fall to about ${minVisibility.toFixed(
          1
        )} km around ${formatTime(
          h.time[minVisibilityIndex]
        )}.`
    });
  }


  /* ---------------------------------------------
     LIMIT ALERTS
     --------------------------------------------- */

  const selectedAlerts =
    alerts.slice(0, 4);


  /* ---------------------------------------------
     NO ALERT
     --------------------------------------------- */

  if (!selectedAlerts.length) {

    container.innerHTML = `
      <div class="smart-alert good">
        <span class="smart-alert-icon">✓</span>

        <div class="smart-alert-content">
          <b>Conditions look stable</b>

          <p>
            No major weather warning detected
            in the upcoming hours.
          </p>
        </div>
      </div>
    `;

    return;
  }


  /* ---------------------------------------------
     RENDER
     --------------------------------------------- */

  container.innerHTML =
    selectedAlerts
      .map(alert => `
        <div class="smart-alert ${escapeHTML(
          alert.type
        )}">

          <span class="smart-alert-icon">
            ${alert.icon}
          </span>

          <div class="smart-alert-content">

            <b>
              ${escapeHTML(
                alert.title
              )}
            </b>

            <p>
              ${escapeHTML(
                alert.text
              )}
            </p>

          </div>

        </div>
      `)
      .join("");
}


/* =====================================================
   ASSISTANT HELPERS
   ===================================================== */

function hourlyAt(offset = 0) {

  if (
    !state.data ||
    !state.data.hourly
  ) {
    return null;
  }

  const h =
    state.data.hourly;

  const current =
    state.data.current.time;

  let index =
    h.time.findIndex(
      t => t >= current
    );

  if (index < 0)
    index = 0;

  index += offset;

  if (
    index < 0 ||
    index >= h.time.length
  ) {
    return null;
  }

  return {
    index,

    time:
      h.time[index],

    temperature:
      h.temperature_2m[index],

    rain:
      h.precipitation_probability[index],

    wind:
      h.wind_speed_10m[index],

    humidity:
      h.relative_humidity_2m[index],

    uv:
      h.uv_index[index],

    visibility:
      h.visibility[index],

    weatherCode:
      h.weather_code[index]
  };
}


function findFivePM() {

  if (
    !state.data ||
    !state.data.hourly
  ) {
    return null;
  }

  const h =
    state.data.hourly;

  const current =
    state.data.current.time;

  let start =
    h.time.findIndex(
      t => t >= current
    );

  if (start < 0)
    start = 0;


  for (
    let i = start;
    i < h.time.length;
    i++
  ) {

    if (
      String(h.time[i]).includes(
        "T17:"
      )
    ) {

      return {
        index: i,
        time: h.time[i],
        temperature:
          h.temperature_2m[i],
        rain:
          h.precipitation_probability[i],
        wind:
          h.wind_speed_10m[i],
        weatherCode:
          h.weather_code[i]
      };
    }
  }


  return null;
}


/* =====================================================
   ASSISTANT MESSAGE
   ===================================================== */

function assistantReply(question) {

  if (!state.data) {
    return "Weather data is still loading. Please wait a moment.";
  }


  const q =
    question
      .toLowerCase()
      .trim();


  const c =
    state.data.current;


  const rain =
    getCurrentRainChance();


  const temp =
    Math.round(
      c.temperature_2m
    );


  const wind =
    Math.round(
      c.wind_speed_10m
    );


  const humidity =
    Math.round(
      c.relative_humidity_2m
    );


  const uv =
    Math.round(
      c.uv_index || 0
    );


  const [condition] =
    weatherInfo(
      c.weather_code
    );


  /* Rain */

  if (
    q.includes("rain") ||
    q.includes("बारिश") ||
    q.includes("barish")
  ) {

    return `
      Current rain chance is
      <b>${rain}%</b>.
      Current condition is
      <b>${escapeHTML(condition)}</b>.
    `;
  }


  /* Temperature */

  if (
    q.includes("temperature") ||
    q.includes("temp") ||
    q.includes("hot") ||
    q.includes("cold") ||
    q.includes("garmi") ||
    q.includes("thand")
  ) {

    return `
      The current temperature is
      <b>${temp}°C</b>,
      with humidity around
      <b>${humidity}%</b>.
    `;
  }


  /* Wind */

  if (
    q.includes("wind") ||
    q.includes("hawa")
  ) {

    return `
      Current wind speed is
      <b>${wind} km/h</b>,
      coming from
      <b>${escapeHTML(
        windDirection(
          c.wind_direction_10m
        )
      )}</b>.
    `;
  }


  /* UV */

  if (
    q.includes("uv") ||
    q.includes("sun")
  ) {

    return `
      Current UV index is
      <b>${uv}</b>.
      ${
        uv >= 6
          ? "Sun protection is recommended."
          : "UV conditions are relatively comfortable."
      }
    `;
  }


  /* Humidity */

  if (
    q.includes("humidity") ||
    q.includes("moisture")
  ) {

    return `
      Current humidity is
      <b>${humidity}%</b>.
    `;
  }


  /* Best time */

  if (
    q.includes("best time") ||
    q.includes("cricket") ||
    q.includes("running") ||
    q.includes("cycling") ||
    q.includes("walking")
  ) {

    let activity =
      "walking";

    if (q.includes("cricket"))
      activity = "cricket";

    if (q.includes("running"))
      activity = "running";

    if (q.includes("cycling"))
      activity = "cycling";


    const result =
      findBestActivityTime(
        activity
      );


    if (!result) {
      return "I don't have enough hourly forecast data right now.";
    }


    return `
      The best upcoming time for
      <b>${activity}</b> looks like
      <b>${formatTime(
        result.time
      )}</b>.
      The weather score is
      <b>${result.score}/99</b>.
    `;
  }


  /* Evening */

  if (
    q.includes("5 pm") ||
    q.includes("5pm") ||
    q.includes("evening")
  ) {

    const five =
      findFivePM();

    if (!five) {
      return "I couldn't find the 5 PM forecast.";
    }

    const [
      eveningCondition
    ] =
      weatherInfo(
        five.weatherCode
      );

    return `
      Around 5 PM,
      temperature may be around
      <b>${Math.round(
        five.temperature
      )}°C</b>,
      rain chance around
      <b>${Math.round(
        five.rain || 0
      )}%</b>,
      with
      <b>${escapeHTML(
        eveningCondition
      )}</b>.
    `;
  }


  /* General */

  return `
    Right now it is
    <b>${temp}°C</b> with
    <b>${escapeHTML(condition)}</b>.
    Rain chance is
    <b>${rain}%</b>,
    wind is
    <b>${wind} km/h</b>,
    and humidity is
    <b>${humidity}%</b>.
  `;
}


/* =====================================================
   CHAT UI
   ===================================================== */

function addChatMessage(
  message,
  type = "bot"
) {

  if (!els.chatBox)
    return;

  const div =
    document.createElement(
      "div"
    );

  div.className =
    `chat-message ${type}`;

  div.innerHTML =
    message;

  els.chatBox.appendChild(
    div
  );

  els.chatBox.scrollTop =
    els.chatBox.scrollHeight;
}


if (els.chatForm) {

  els.chatForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const question =
        els.chatInput
          ? els.chatInput.value.trim()
          : "";

      if (!question)
        return;


      addChatMessage(
        escapeHTML(question),
        "user"
      );


      if (els.chatInput) {
        els.chatInput.value = "";
      }


      setTimeout(() => {

        addChatMessage(
          assistantReply(question),
          "bot"
        );

      }, 250);
    }
  );
}


/* =====================================================
   QUICK CHAT BUTTONS
   ===================================================== */

document
  .querySelectorAll(
    "[data-question]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const question =
          button.dataset.question;

        if (!question)
          return;

        addChatMessage(
          escapeHTML(question),
          "user"
        );

        setTimeout(() => {

          addChatMessage(
            assistantReply(
              question
            ),
            "bot"
          );

        }, 250);
      }
    );
  });


/* =====================================================
   RENDER ALL
   ===================================================== */

function renderAll() {

  const d =
    state.data;

  if (!d)
    return;


  const c =
    d.current;


  const [
    condition,
    type
  ] =
    weatherInfo(
      c.weather_code
    );


  /* Location */

  if (els.placeName) {

    els.placeName.textContent =
      `${state.place.name}, ${
        state.place.country ||
        "India"
      }`;
  }


  if (els.placeMeta) {

    els.placeMeta.textContent =
      state.place.admin ||
      `${Number(
        d.latitude
      ).toFixed(2)}°, ${
        Number(
          d.longitude
        ).toFixed(2)
      }°`;
  }


  if (els.timezoneText) {

    els.timezoneText.textContent =
      d.timezone_abbreviation ||
      d.timezone ||
      "Local time";
  }


  /* Day / Night */

  if (els.liveText) {

    els.liveText.textContent =
      c.is_day
        ? "Day"
        : "Night";
  }


  /* Temperature */

  if (els.temperature) {

    els.temperature.textContent =
      Math.round(
        c.temperature_2m
      );
  }


  if (els.condition) {

    els.condition.textContent =
      condition;
  }


  if (els.feelsLike) {

    els.feelsLike.textContent =
      `${Math.round(
        c.apparent_temperature
      )}°`;
  }


  if (els.pressure) {

    els.pressure.textContent =
      `${Math.round(
        c.pressure_msl
      )} hPa`;
  }


  if (els.windDir) {

    els.windDir.textContent =
      windDirection(
        c.wind_direction_10m
      );
  }


  if (els.rainChance) {

    els.rainChance.textContent =
      `${getCurrentRainChance()}%`;
  }


  /* Weather Art */

  if (els.weatherArt) {

    els.weatherArt.innerHTML =
      weatherVisual(
        type,
        Boolean(c.is_day)
      );
  }


  /* Detail cards */

  if (els.humidity) {

    els.humidity.textContent =
      `${Math.round(
        c.relative_humidity_2m
      )}%`;
  }


  if (els.wind) {

    els.wind.textContent =
      `${Math.round(
        c.wind_speed_10m
      )} km/h`;
  }


  if (els.visibility) {

    const visibility =
      Number(
        c.visibility || 0
      ) / 1000;

    els.visibility.textContent =
      visibility
        ? `${visibility.toFixed(1)} km`
        : "--";
  }


  if (els.uv) {

    els.uv.textContent =
      Math.round(
        c.uv_index || 0
      );
  }


  /* Other sections */

  renderSun(d);

  renderAdvice();

  renderActivities();

  renderHourly();

  renderDaily();

  renderBestTimes();

  renderSmartAlerts();
}


/* =====================================================
   INITIALIZE
   ===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initTheme();

    loadWeather();
  }
);


/* =====================================================
   SAFETY INITIAL LOAD
   ===================================================== */

if (
  document.readyState ===
  "loading"
) {

  // DOMContentLoaded will handle initialization.

} else {

  initTheme();

  if (!state.data) {
    loadWeather();
  }
}