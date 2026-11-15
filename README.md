# 🌤️ WeatherScope — Real-Time Weather Application

A modern, responsive, and detailed weather dashboard engineered with pure **HTML5**, **CSS3 (Glassmorphism & CSS Grid/Flexbox)**, and **Vanilla JavaScript**. 

WeatherScope delivers real-time weather telemetry, a 24-hour hourly forecast timeline with weather condition logos per time frame, a 3-day multi-day outlook, atmospheric air metrics, geolocation tracking, and dynamic environmental themes.

---

## 📸 Screenshots & Highlights

- **Hero Cockpit**: Displays city name, region, country, live clock, high-definition weather logo, current temperature, "feels like", daily highs/lows, and precipitation probability.
- **Hourly Forecast Timeline**: 24-hour cycle showing the exact weather condition logo, temperature, condition summary, and rain probability for every single hour.
- **3-Day Forecast**: Multi-day outlook with condition logos, minimum/maximum temperature range bars, and rain chances.
- **Atmospheric Highlights Grid**: Detailed telemetry covering Humidity, Dew Point, Wind Speed & Gusts, UV Index, Air Pressure, Visibility, and Air Quality (AQI with PM2.5).
- **Sun & Astro Timeline**: Sunrise, Sunset, and real-time Moon phase illumination.
- **Personalized Glassmorphic Footer**: Designed with an animated beating heart and custom SVG social links (LinkedIn, GitHub, Instagram, Facebook).

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **Real-Time Data** | Integrates with WeatherAPI (`forecast.json`) for live weather metrics across global locations. |
| **Hourly Forecast with Logos** | Continuously displays 24 consecutive hours with prominent weather icons, condition texts, and rain badges. |
| **Light & Dark Mode** | Interactive navbar toggle switching between sleek dark glassmorphism and radiant daylight mode, persisted across sessions. |
| **Dynamic Ambient Themes** | The background aura dynamically transforms based on condition (*Sunny Day*, *Night Sky*, *Rain/Storm*, *Overcast/Cloudy*). |
| **°C / °F Instant Toggle** | Switch units with zero latency — cached data recalculates without triggering unnecessary network calls. |
| **GPS Geolocation** | One-click `"My Location"` button detects user coordinates via HTML5 Geolocation API. |
| **Quick City Chips** | One-tap lookup for major cities (Mumbai, New Delhi, London, New York, Tokyo, Paris, Dubai, Sydney). |
| **Fully Responsive** | Engineered for Laptops, Desktops, Tablets, and Smartphones with zero horizontal blowout. |
| **Offline Resilience & Validation** | Graceful error banners for misspelled locations, timeouts, or network loss with a clean loading spinner. |

---

## 📁 Project Structure

```plaintext
weather_app/
│
├── index.html        # Semantic HTML5 skeleton, dashboard grid, and SVG iconography
├── style.css         # Modern design tokens, glassmorphism UI, keyframes, and media queries
├── script.js         # WeatherAPI controller, hourly calculations, formatters, and UI updates
└── README.md         # Comprehensive project documentation
```

---

## 🛠️ Properties & State Management

In `script.js`, application state is managed cleanly without external dependencies:

| Property / Variable | Type | Purpose |
| :--- | :--- | :--- |
| `API_KEY` | `String` | Secure access key for WeatherAPI authentication. |
| `DEFAULT_CITY` | `String` | Fallback city loaded on launch (`'Mumbai'`). |
| `currentUnit` | `String` | Active temperature scale: `'C'` (Celsius) or `'F'` (Fahrenheit). Persisted in `localStorage` under `weatherscope_unit`. |
| `currentTheme` | `String` | Active display theme: `'dark'` or `'light'`. Persisted in `localStorage` under `weatherscope_theme`. |
| `weatherData` | `Object \| null` | Memory cache of the latest API response, enabling instant unit conversion without re-fetching. |
| `currentCityQuery` | `String` | Tracks the active searched query. Persisted in `localStorage` under `weatherscope_last_city`. |

---

## ⚙️ JavaScript Functions & Architecture

### 1. Data Fetching & Geolocation
- **`fetchWeather(query)`**
  - **Type**: `async`
  - **Parameters**: `query` (city name, zip code, or `'latitude,longitude'`)
  - **Description**: Contacts the WeatherAPI forecast endpoint with 3-day projection and air quality data. Handles error states, toggles the loading overlay, caches response in `weatherData`, and calls `renderApp()`.
- **`getUserLocation()`**
  - **Description**: Invokes `navigator.geolocation.getCurrentPosition()`. On success, fetches weather using GPS coordinates (`lat,lon`); on error, provides helpful guidance (e.g., permission denied).

### 2. Rendering Orchestration
- **`renderApp(data)`**
  - **Description**: Master render pipeline. Sequentially invokes `renderCurrentWeather()`, `renderHourlyForecast()`, `renderDailyForecast()`, `renderDetailedMetrics()`, and `applyDynamicTheme()`.
- **`renderCurrentWeather(data)`**
  - **Description**: Populates city name, region, country, formatted date/time, 128×128 retina weather condition logo, temperature, condition text, "feels like", high/low, rain chance, wind, and UV level.
- **`renderHourlyForecast(data)`**
  - **Description**: Computes the next 24 consecutive hours starting from the local hour index (combining remainder of today + early hours of tomorrow). Dynamically builds cards displaying:
    - Time frame label (*"Now"*, *"1 AM"*, *"2 PM"*, etc.)
    - Weather condition logo (`<img>`)
    - Temperature in the active unit
    - Condition description
    - Rain probability pill (`💧 %`)
  - Sets `.is-current` on the active hour and scrolls the track smoothly to the start.
- **`renderDailyForecast(data)`**
  - **Description**: Generates 3-day forecast rows with Day Name (*"Today"*, *"Tomorrow"*, *"Wed"*), formatted date, weather icon, condition text, rain chance, and min/max temperature gradient bar.
- **`renderDetailedMetrics(data)`**
  - **Description**: Updates the 6-card metrics grid:
    - Humidity percentage and dew point
    - Wind speed, compass direction, angle, and gust velocity
    - UV Index and risk advisory
    - Atmospheric pressure in `mb` and `inHg`
    - Visibility distance with clarity classification
    - US-EPA Air Quality Index (AQI) with PM2.5 density
    - Sunrise, Sunset, and Moon illumination phase

### 3. Themes & Unit Switching
- **`switchTheme(theme)`**
  - **Parameters**: `'dark'` or `'light'`
  - **Description**: Switches the UI color palette, sets `body.light-mode`, activates corresponding toggle button state, and persists the choice to `localStorage`.
- **`updateThemeUI()`**
  - **Description**: Synchronizes toggle button classes and `document.body` attributes with the active `currentTheme`.
- **`switchUnit(unit)`**
  - **Parameters**: `'C'` or `'F'`
  - **Description**: Toggles active temperature scale, updates button UI, saves preference to `localStorage`, and immediately re-renders all displays using cached data without network lag.
- **`applyDynamicTheme(data)`**
  - **Description**: Inspects `is_day` and weather condition string to assign appropriate theme classes to `<body>` while preserving user-selected Light/Dark mode:
    - `theme-rain`: For rain, drizzle, thunderstorm, or snow.
    - `theme-cloudy`: For overcast, mist, fog, or cloudy skies.
    - `theme-day-sunny`: For daytime clear skies.
    - `theme-night`: For nighttime skies.

### 4. Utilities & Formatters
- **`formatDateTime(localtimeStr)`**: Converts `"YYYY-MM-DD HH:MM"` into a human-readable string like `"Monday, 16 Nov 2026 • 12:45 PM"`.
- **`formatHour12(time24, showMinutes)`**: Formats `"14:00"` to `"2 PM"` (or `"2:00 PM"` if `showMinutes` is true).
- **`getUvAdvisory(uv)`**: Returns classification (*Low*, *Moderate*, *High*, *Very High*, *Extreme*) and corresponding badge styling class.
- **`getAqiInfo(epaIndex)`**: Maps the US-EPA index (1 to 6) to status text (*Good*, *Moderate*, *Sensitive*, *Unhealthy*, *Hazardous*).
- **`showLoading(isLoading)`** & **`showError(msg)`**: Controls UI overlay states and alert banners.

---

## 🎨 CSS Architecture & Styling Details

### 1. Zero Horizontal Clipping (`minmax(0, 1fr)`)
- Horizontally scrollable elements inside CSS Grid columns default to `min-width: auto`, which can cause grid columns to stretch across thousands of pixels.
- WeatherScope uses `grid-template-columns: minmax(0, 1.16fr) minmax(0, 0.84fr);` and `min-width: 0` on all cards and flex wrappers, ensuring the timeline scrolls smoothly within its card without pushing the right column off-screen.

### 2. Glassmorphism Design System
- **Surfaces**: `background: rgba(22, 31, 48, 0.65);` with `backdrop-filter: blur(20px);`
- **Borders**: Subdued translucent glass borders (`rgba(255, 255, 255, 0.12)`)
- **Accents**: Neon glow highlights for buttons, active city chips, and interactive cards.

### 3. Keyframe Animations
- `@keyframes heartBeat`: Realistic dual-pulse heartbeat effect on the footer creator badge.
- `@keyframes pulse`: Breathing green indicator dot for live data status.
- `@keyframes spin`: Smooth circular loader during async API calls.
- `@keyframes fadeIn`: Subtle entrance animation for error banners.

### 4. Responsive Breakpoints
- **Desktop / Laptop (`> 1024px`)**:
  - Two-column dashboard cockpit view (`1.16fr` / `0.84fr`).
  - Max width constrained to `1200px` with strict viewport centering (`margin: 0 auto`).
- **Tablets (`768px – 1023px`)**:
  - Single-column dashboard with 3-column metrics grid.
  - Touch-friendly swipe on hourly and city chips.
- **Mobile Phones (`< 768px`)**:
  - Full-width vertical layout with 2-column compact metric cards.
  - Search bar and action buttons adapt gracefully.
- **Small Mobile Devices (`< 400px`)**:
  - Single-column metric cards and optimized daily forecast rows.

---

## 🔌 API Reference

This application uses the [WeatherAPI](https://www.weatherapi.com/) Forecast endpoint:

```http
GET https://api.weatherapi.com/v1/forecast.json?key={API_KEY}&q={LOCATION}&days=3&aqi=yes&alerts=no
```

- **Weather Condition Icons**: Retrieved dynamically from WeatherAPI CDN (`//cdn.weatherapi.com/...`) and converted to `https://` with `128x128` high-DPI scaling for retina screens.

---

## 💻 How to Run Locally

No build tools, bundlers, or package installations are required:

1. Clone or download this project folder.
2. Double-click [index.html](file:///c:/Users/Chandan%20Gorai/Desktop/web%20Dev/project%2010/weather_app/index.html) to open it directly in any modern browser.
3. *Optional (Development Server)*: If using VS Code, right-click `index.html` and select **"Open with Live Server"**, or run:
   ```bash
   npx serve .
   ```

---

## 👨‍💻 Author

**Designed & crafted with ❤️ by Chandan**

- **LinkedIn**: [Chandan](https://www.linkedin.com)
- **GitHub**: [Chandan](https://github.com)
- **Instagram**: [Chandan](https://www.instagram.com)
- **Facebook**: [Chandan](https://www.facebook.com)

---

*WeatherScope — Real-Time Forecast & Atmosphere Telemetry.*
