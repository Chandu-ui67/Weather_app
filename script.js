/**
 * WeatherScope - Detailed Weather Application
 * Features:
 * - Real-time weather data via WeatherAPI
 * - Next 24-hour hourly forecast timeline with prominently visible weather condition logos
 * - 3-day multi-day outlook
 * - Comprehensive atmospheric metrics (Humidity, Wind, UV, Pressure, Visibility, AQI, Astro)
 * - °C / °F instant unit switching
 * - Geolocation GPS search & popular city chips
 * - Dynamic atmospheric theme adaptation
 * - Fully responsive for laptops, tablets, and smartphones
 */

// ==========================================
// App State & Constants
// ==========================================
const API_KEY = '2fff19db5f304d7db1d140503261502';
const DEFAULT_CITY = 'Mumbai';

let currentUnit = localStorage.getItem('weatherscope_unit') || 'C'; // 'C' or 'F'
let currentTheme = localStorage.getItem('weatherscope_theme') || 'dark'; // 'dark' or 'light'
let weatherData = null; // Cached API response object
let currentCityQuery = DEFAULT_CITY;

// ==========================================
// DOM Element References
// ==========================================
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const geoBtn = document.getElementById('geo-btn');

const unitCBtn = document.getElementById('unit-c-btn');
const unitFBtn = document.getElementById('unit-f-btn');
const themeDarkBtn = document.getElementById('theme-dark-btn');
const themeLightBtn = document.getElementById('theme-light-btn');
const cityChips = document.querySelectorAll('.city-chip');

const errorBanner = document.getElementById('error-banner');
const errorMessage = document.getElementById('error-message');
const closeErrorBtn = document.getElementById('close-error');
const loadingSpinner = document.getElementById('loading-spinner');
const dashboard = document.getElementById('weather-dashboard');

// Hero elements
const locationNameEl = document.getElementById('location-name');
const locationRegionEl = document.getElementById('location-region');
const localTimeEl = document.getElementById('local-time');
const weatherHeroIcon = document.getElementById('weather-hero-icon');
const currentTempEl = document.getElementById('current-temp');
const tempUnitSymbolEl = document.querySelector('.temp-unit-symbol');
const weatherConditionTextEl = document.getElementById('weather-condition-text');
const feelsLikeTempEl = document.getElementById('feels-like-temp');
const todayHighEl = document.getElementById('today-high');
const todayLowEl = document.getElementById('today-low');
const heroRainChanceEl = document.getElementById('hero-rain-chance');
const heroWindEl = document.getElementById('hero-wind');
const heroUvEl = document.getElementById('hero-uv');

// Hourly forecast elements
const hourlyTrack = document.getElementById('hourly-track');
const hourlyScrollLeft = document.getElementById('hourly-scroll-left');
const hourlyScrollRight = document.getElementById('hourly-scroll-right');

// Daily forecast elements
const dailyForecastList = document.getElementById('daily-forecast-list');

// Metric elements
const metricHumidity = document.getElementById('metric-humidity');
const metricDewpoint = document.getElementById('metric-dewpoint');
const metricWind = document.getElementById('metric-wind');
const metricWindDir = document.getElementById('metric-wind-dir');
const metricUv = document.getElementById('metric-uv');
const metricUvBadge = document.getElementById('metric-uv-badge');
const metricUvDesc = document.getElementById('metric-uv-desc');
const metricPressure = document.getElementById('metric-pressure');
const metricPressureDesc = document.getElementById('metric-pressure-desc');
const metricVisibility = document.getElementById('metric-visibility');
const metricVisDesc = document.getElementById('metric-vis-desc');
const metricAqiStatus = document.getElementById('metric-aqi-status');
const metricAqiBadge = document.getElementById('metric-aqi-badge');
const metricAqiPm = document.getElementById('metric-aqi-pm');
const metricSunrise = document.getElementById('metric-sunrise');
const metricSunset = document.getElementById('metric-sunset');
const metricMoonPhase = document.getElementById('metric-moon-phase');

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateThemeUI();
    updateUnitButtonsUI();
    setupEventListeners();
    
    // Load default or last viewed city
    const savedCity = localStorage.getItem('weatherscope_last_city') || DEFAULT_CITY;
    fetchWeather(savedCity);
});

// ==========================================
// Event Listeners Setup
// ==========================================
function setupEventListeners() {
    // Search form submission
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            fetchWeather(query);
            searchInput.blur();
        }
    });

    // Clear search input button
    searchInput.addEventListener('input', () => {
        if (searchInput.value.length > 0) {
            clearSearchBtn.classList.add('visible');
        } else {
            clearSearchBtn.classList.remove('visible');
        }
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.classList.remove('visible');
        searchInput.focus();
    });

    // Geolocation button
    geoBtn.addEventListener('click', getUserLocation);

    // Unit toggle buttons
    unitCBtn.addEventListener('click', () => switchUnit('C'));
    unitFBtn.addEventListener('click', () => switchUnit('F'));

    // Theme toggle buttons (Dark / Light Mode)
    themeDarkBtn.addEventListener('click', () => switchTheme('dark'));
    themeLightBtn.addEventListener('click', () => switchTheme('light'));

    // Popular city chips
    cityChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const city = chip.getAttribute('data-city');
            if (city) {
                searchInput.value = city;
                clearSearchBtn.classList.add('visible');
                fetchWeather(city);
            }
        });
    });

    // Error banner dismiss
    closeErrorBtn.addEventListener('click', hideError);

    // Hourly horizontal scroll buttons (for desktop and laptop mice)
    if (hourlyScrollLeft && hourlyScrollRight) {
        hourlyScrollLeft.addEventListener('click', () => {
            hourlyTrack.scrollBy({ left: -260, behavior: 'smooth' });
        });
        hourlyScrollRight.addEventListener('click', () => {
            hourlyTrack.scrollBy({ left: 260, behavior: 'smooth' });
        });
    }
}

// ==========================================
// Geolocation Support
// ==========================================
function getUserLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        return;
    }

    geoBtn.classList.add('loading');
    showLoading(true);

    navigator.geolocation.getCurrentPosition(
        (position) => {
            geoBtn.classList.remove('loading');
            const coords = `${position.coords.latitude},${position.coords.longitude}`;
            fetchWeather(coords);
        },
        (error) => {
            geoBtn.classList.remove('loading');
            showLoading(false);
            let message = 'Unable to retrieve your location.';
            if (error.code === error.PERMISSION_DENIED) {
                message = 'Location access was denied. Please search manually by city name.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                message = 'Location information is currently unavailable.';
            } else if (error.code === error.TIMEOUT) {
                message = 'Location request timed out. Please try again.';
            }
            showError(message);
        },
        { timeout: 10000, enableHighAccuracy: true }
    );
}

// ==========================================
// Fetch Weather Data from WeatherAPI
// ==========================================
async function fetchWeather(query) {
    hideError();
    showLoading(true);

    try {
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=3&aqi=yes&alerts=no`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || data.error) {
            const errText = data.error?.message || `Location "${query}" not found. Please check spelling.`;
            throw new Error(errText);
        }

        // Cache response in memory
        weatherData = data;
        currentCityQuery = data.location.name;
        localStorage.setItem('weatherscope_last_city', currentCityQuery);

        // Update active city chip styling
        updateActiveChip(currentCityQuery);

        // Render full detailed interface
        renderApp(data);

    } catch (err) {
        console.error('Weather fetch error:', err);
        showError(err.message || 'Failed to fetch weather data. Please check your internet connection.');
    } finally {
        showLoading(false);
    }
}

// ==========================================
// Main Render Orchestrator
// ==========================================
function renderApp(data) {
    if (!data) return;

    renderCurrentWeather(data);
    renderHourlyForecast(data);
    renderDailyForecast(data);
    renderDetailedMetrics(data);
    applyDynamicTheme(data);
}

// ==========================================
// 1. Current Weather (Hero Section)
// ==========================================
function renderCurrentWeather(data) {
    const loc = data.location;
    const cur = data.current;
    const today = data.forecast.forecastday[0];

    // Location & Time
    locationNameEl.textContent = loc.name;
    locationRegionEl.textContent = `${loc.region ? loc.region + ', ' : ''}${loc.country}`;
    localTimeEl.textContent = formatDateTime(loc.localtime);

    // Weather Condition Logo (Ensure high-resolution 128x128 icon with https:)
    const rawIcon = cur.condition.icon || '';
    const hiresIcon = rawIcon.replace('64x64', '128x128');
    const safeIconUrl = hiresIcon.startsWith('http') ? hiresIcon : `https:${hiresIcon}`;
    
    weatherHeroIcon.src = safeIconUrl;
    weatherHeroIcon.alt = cur.condition.text || 'Weather logo';

    // Temperature & Unit
    const tempValue = currentUnit === 'C' ? Math.round(cur.temp_c) : Math.round(cur.temp_f);
    currentTempEl.textContent = tempValue;
    tempUnitSymbolEl.textContent = `°${currentUnit}`;

    // Condition Text
    weatherConditionTextEl.textContent = cur.condition.text;

    // Feels like, High & Low
    const feelsLikeVal = currentUnit === 'C' ? Math.round(cur.feelslike_c) : Math.round(cur.feelslike_f);
    const maxTempVal = currentUnit === 'C' ? Math.round(today.day.maxtemp_c) : Math.round(today.day.maxtemp_f);
    const minTempVal = currentUnit === 'C' ? Math.round(today.day.mintemp_c) : Math.round(today.day.mintemp_f);

    feelsLikeTempEl.textContent = `${feelsLikeVal}°${currentUnit}`;
    todayHighEl.textContent = `${maxTempVal}°${currentUnit}`;
    todayLowEl.textContent = `${minTempVal}°${currentUnit}`;

    // Quick Hero Stats Bar
    heroRainChanceEl.textContent = `${today.day.daily_chance_of_rain || 0}%`;
    const windSpeedStr = currentUnit === 'C' 
        ? `${Math.round(cur.wind_kph)} km/h ${cur.wind_dir}` 
        : `${Math.round(cur.wind_mph)} mph ${cur.wind_dir}`;
    heroWindEl.textContent = windSpeedStr;

    const uvRating = getUvAdvisory(cur.uv);
    heroUvEl.textContent = `${uvRating.label} (${cur.uv})`;
}

// ==========================================
// 2. Hourly Forecast Timeline ("Logo visible with time frame")
// ==========================================
function renderHourlyForecast(data) {
    if (!data.forecast || !data.forecast.forecastday) return;

    hourlyTrack.innerHTML = '';

    const locLocalTime = data.location.localtime; // e.g. "2026-11-16 14:30"
    const currentHourIndex = parseInt(locLocalTime.split(' ')[1].split(':')[0], 10);

    const day0Hours = data.forecast.forecastday[0].hour;
    const day1Hours = data.forecast.forecastday[1]?.hour || [];

    // Combine remaining hours of today and early hours of tomorrow to form 24 continuous hours
    const next24Hours = [];
    for (let i = currentHourIndex; i < 24; i++) {
        next24Hours.push({ ...day0Hours[i], isCurrent: i === currentHourIndex });
    }
    const neededFromTomorrow = 24 - next24Hours.length;
    for (let i = 0; i < neededFromTomorrow && i < day1Hours.length; i++) {
        next24Hours.push({ ...day1Hours[i], isCurrent: false });
    }

    // Scroll hourly track back to the start
    if (hourlyTrack) {
        hourlyTrack.scrollTo({ left: 0, behavior: 'smooth' });
    }

    const fragment = document.createDocumentFragment();

    next24Hours.forEach((hourData) => {
        const card = document.createElement('div');
        card.className = `hourly-card ${hourData.isCurrent ? 'is-current' : ''}`;

        // Time Frame Label (e.g. "Now", "3 PM", "4 AM")
        let timeLabel = '';
        if (hourData.isCurrent) {
            timeLabel = 'Now';
        } else {
            const timeString = hourData.time.split(' ')[1]; // "15:00"
            timeLabel = formatHour12(timeString, false);
        }

        // Prominently Visible Weather Condition Logo
        const rawIcon = hourData.condition.icon;
        const safeIcon = rawIcon.startsWith('http') ? rawIcon : `https:${rawIcon}`;

        // Temperature
        const temp = currentUnit === 'C' ? Math.round(hourData.temp_c) : Math.round(hourData.temp_f);

        // Rain or humidity badge
        const chanceOfRain = hourData.chance_of_rain || 0;
        const rainBadgeHtml = chanceOfRain > 0
            ? `<span class="hourly-rain">💧 ${chanceOfRain}%</span>`
            : `<span class="hourly-rain" style="opacity: 0.6;">💧 0%</span>`;

        card.innerHTML = `
            <span class="hourly-time">${timeLabel}</span>
            <div class="hourly-logo-wrap" title="${hourData.condition.text}">
                <img class="hourly-logo" src="${safeIcon}" alt="${hourData.condition.text}" loading="lazy" />
            </div>
            <strong class="hourly-temp">${temp}°${currentUnit}</strong>
            <span class="hourly-condition" title="${hourData.condition.text}">${hourData.condition.text}</span>
            ${rainBadgeHtml}
        `;

        fragment.appendChild(card);
    });

    hourlyTrack.appendChild(fragment);
}

// ==========================================
// 3. 3-Day Forecast Section
// ==========================================
function renderDailyForecast(data) {
    if (!data.forecast || !data.forecast.forecastday) return;

    dailyForecastList.innerHTML = '';
    const fragment = document.createDocumentFragment();

    data.forecast.forecastday.forEach((dayData, index) => {
        const row = document.createElement('div');
        row.className = 'daily-row';

        // Day label & date
        let dayName = '';
        if (index === 0) dayName = 'Today';
        else if (index === 1) dayName = 'Tomorrow';
        else {
            const dateObj = new Date(dayData.date + 'T00:00:00');
            dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        }

        const dateParts = dayData.date.split('-');
        const formattedDate = `${formatMonthShort(dateParts[1])} ${parseInt(dateParts[2], 10)}`;

        // Icon
        const rawIcon = dayData.day.condition.icon;
        const safeIcon = rawIcon.startsWith('http') ? rawIcon : `https:${rawIcon}`;

        // Min & Max temps
        const minTemp = currentUnit === 'C' ? Math.round(dayData.day.mintemp_c) : Math.round(dayData.day.mintemp_f);
        const maxTemp = currentUnit === 'C' ? Math.round(dayData.day.maxtemp_c) : Math.round(dayData.day.maxtemp_f);

        const rainChance = dayData.day.daily_chance_of_rain || 0;

        row.innerHTML = `
            <div class="daily-day">
                <span class="daily-day-name">${dayName}</span>
                <span class="daily-date">${formattedDate}</span>
            </div>
            <div class="daily-icon-wrap" title="${dayData.day.condition.text}">
                <img class="daily-icon" src="${safeIcon}" alt="${dayData.day.condition.text}" loading="lazy" />
            </div>
            <div class="daily-condition-wrap">
                <span class="daily-desc">${dayData.day.condition.text}</span>
                <span class="daily-rain-chance">💧 ${rainChance}% rain</span>
            </div>
            <div class="daily-range">
                <span class="daily-min">${minTemp}°</span>
                <div class="daily-bar" aria-hidden="true"></div>
                <span class="daily-max">${maxTemp}°</span>
            </div>
        `;

        fragment.appendChild(row);
    });

    dailyForecastList.appendChild(fragment);
}

// ==========================================
// 4. Detailed Atmospheric Metrics
// ==========================================
function renderDetailedMetrics(data) {
    const cur = data.current;
    const astro = data.forecast.forecastday[0]?.astro;

    // Humidity & Dewpoint
    metricHumidity.textContent = `${cur.humidity}%`;
    const dewPointVal = currentUnit === 'C' ? Math.round(cur.dewpoint_c) : Math.round(cur.dewpoint_f);
    metricDewpoint.textContent = `Dew point: ${dewPointVal}°${currentUnit}`;

    // Wind Speed, Direction & Gusts
    if (currentUnit === 'C') {
        metricWind.textContent = `${Math.round(cur.wind_kph)} km/h`;
        metricWindDir.textContent = `${cur.wind_dir} (${cur.wind_degree}°) • Gusts up to ${Math.round(cur.gust_kph)} km/h`;
    } else {
        metricWind.textContent = `${Math.round(cur.wind_mph)} mph`;
        metricWindDir.textContent = `${cur.wind_dir} (${cur.wind_degree}°) • Gusts up to ${Math.round(cur.gust_mph)} mph`;
    }

    // UV Index & Advisory
    metricUv.textContent = cur.uv;
    const uvInfo = getUvAdvisory(cur.uv);
    metricUvBadge.textContent = uvInfo.label;
    metricUvBadge.className = `badge ${uvInfo.badgeClass}`;
    metricUvDesc.textContent = uvInfo.description;

    // Atmospheric Pressure
    metricPressure.textContent = `${cur.pressure_mb} mb`;
    metricPressureDesc.textContent = `${cur.pressure_in} inHg • ${cur.pressure_mb > 1013 ? 'High pressure system' : 'Normal / Low pressure'}`;

    // Visibility
    if (currentUnit === 'C') {
        metricVisibility.textContent = `${cur.vis_km} km`;
    } else {
        metricVisibility.textContent = `${cur.vis_miles} mi`;
    }
    metricVisDesc.textContent = cur.vis_km >= 10 ? 'Excellent visibility' : (cur.vis_km >= 5 ? 'Moderate visibility' : 'Low visibility / Fog');

    // Air Quality Index (AQI)
    if (cur.air_quality) {
        const epaIndex = cur.air_quality['us-epa-index'] || 1;
        const aqiInfo = getAqiInfo(epaIndex);
        metricAqiStatus.textContent = aqiInfo.status;
        metricAqiBadge.textContent = `EPA ${epaIndex}`;
        metricAqiBadge.className = `badge ${aqiInfo.badgeClass}`;
        const pm25 = Math.round(cur.air_quality.pm2_5 || 0);
        metricAqiPm.textContent = `PM2.5: ${pm25} µg/m³ • ${aqiInfo.desc}`;
    } else {
        metricAqiStatus.textContent = 'Good';
        metricAqiBadge.textContent = 'EPA 1';
        metricAqiBadge.className = 'badge badge-low';
        metricAqiPm.textContent = 'Standard air quality levels';
    }

    // Sun & Astro Timings
    if (astro) {
        metricSunrise.textContent = astro.sunrise || '--:-- AM';
        metricSunset.textContent = astro.sunset || '--:-- PM';
        metricMoonPhase.textContent = `Moon Phase: ${astro.moon_phase || 'Clear Sky'} (${astro.moon_illumination || 0}% lit)`;
    }
}

// ==========================================
// Dynamic Ambient Theme Controller
// ==========================================
function applyDynamicTheme(data) {
    const isDay = data.current.is_day === 1;
    const condition = data.current.condition.text.toLowerCase();

    // Remove only weather condition classes, preserving 'light-mode' if active
    document.body.classList.remove('theme-rain', 'theme-cloudy', 'theme-day-sunny', 'theme-night', 'theme-default');

    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunder') || condition.includes('shower')) {
        document.body.classList.add('theme-rain');
    } else if (condition.includes('cloud') || condition.includes('overcast') || condition.includes('mist') || condition.includes('fog')) {
        document.body.classList.add('theme-cloudy');
    } else if (isDay) {
        document.body.classList.add('theme-day-sunny');
    } else {
        document.body.classList.add('theme-night');
    }
}

// ==========================================
// Theme Switching (Dark / Light Mode)
// ==========================================
function switchTheme(theme) {
    if (currentTheme === theme) return;

    currentTheme = theme;
    localStorage.setItem('weatherscope_theme', theme);
    updateThemeUI();
}

function updateThemeUI() {
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        themeLightBtn.classList.add('active');
        themeDarkBtn.classList.remove('active');
    } else {
        document.body.classList.remove('light-mode');
        themeDarkBtn.classList.add('active');
        themeLightBtn.classList.remove('active');
    }
}

// ==========================================
// Unit Switching (°C / °F)
// ==========================================
function switchUnit(unit) {
    if (currentUnit === unit) return;

    currentUnit = unit;
    localStorage.setItem('weatherscope_unit', unit);
    updateUnitButtonsUI();

    // Re-render immediately using cached data (no redundant network request)
    if (weatherData) {
        renderApp(weatherData);
    }
}

function updateUnitButtonsUI() {
    if (currentUnit === 'C') {
        unitCBtn.classList.add('active');
        unitFBtn.classList.remove('active');
    } else {
        unitFBtn.classList.add('active');
        unitCBtn.classList.remove('active');
    }
}

// ==========================================
// Helper Utilities & Formatters
// ==========================================
function updateActiveChip(cityName) {
    cityChips.forEach(chip => {
        const chipCity = chip.getAttribute('data-city').toLowerCase();
        if (cityName.toLowerCase().includes(chipCity) || chipCity.includes(cityName.toLowerCase())) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
}

function formatDateTime(localtimeStr) {
    // localtimeStr comes as "2026-11-16 12:45"
    if (!localtimeStr) return '';
    try {
        const parts = localtimeStr.split(' ');
        const dateParts = parts[0].split('-');
        const timeParts = parts[1].split(':');
        
        const dateObj = new Date(
            parseInt(dateParts[0], 10),
            parseInt(dateParts[1], 10) - 1,
            parseInt(dateParts[2], 10),
            parseInt(timeParts[0], 10),
            parseInt(timeParts[1], 10)
        );

        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const dayNumber = dateObj.getDate();
        const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
        const year = dateObj.getFullYear();

        const time12 = formatHour12(parts[1], true);

        return `${dayName}, ${dayNumber} ${monthName} ${year} • ${time12}`;
    } catch {
        return localtimeStr;
    }
}

function formatHour12(time24, showMinutes = false) {
    // Expects "14:00" or "09:30"
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return showMinutes && m !== undefined ? `${hour}:${m} ${ampm}` : `${hour} ${ampm}`;
}

function formatMonthShort(monthNumStr) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idx = parseInt(monthNumStr, 10) - 1;
    return months[idx] || '';
}

function getUvAdvisory(uv) {
    if (uv <= 2) {
        return { label: 'Low', badgeClass: 'badge-low', description: 'No protection needed. Safe to stay outside.' };
    } else if (uv <= 5) {
        return { label: 'Moderate', badgeClass: 'badge-normal', description: 'Protection advised during midday.' };
    } else if (uv <= 7) {
        return { label: 'High', badgeClass: 'badge-high', description: 'Protection essential. Seek shade.' };
    } else if (uv <= 10) {
        return { label: 'Very High', badgeClass: 'badge-high', description: 'Extra precaution required outdoors.' };
    } else {
        return { label: 'Extreme', badgeClass: 'badge-purple', description: 'Avoid outdoor sun exposure.' };
    }
}

function getAqiInfo(epaIndex) {
    switch (epaIndex) {
        case 1:
            return { status: 'Good', badgeClass: 'badge-low', desc: 'Air quality is satisfactory' };
        case 2:
            return { status: 'Moderate', badgeClass: 'badge-normal', desc: 'Acceptable for most individuals' };
        case 3:
            return { status: 'Sensitive', badgeClass: 'badge-normal', desc: 'Sensitive groups may feel effects' };
        case 4:
            return { status: 'Unhealthy', badgeClass: 'badge-high', desc: 'General public might experience irritation' };
        case 5:
            return { status: 'Very Unhealthy', badgeClass: 'badge-high', desc: 'Health alert: serious risk' };
        case 6:
            return { status: 'Hazardous', badgeClass: 'badge-purple', desc: 'Health warning of emergency conditions' };
        default:
            return { status: 'Moderate', badgeClass: 'badge-normal', desc: 'Normal atmospheric conditions' };
    }
}

// ==========================================
// UI State Controls (Loading & Error)
// ==========================================
function showLoading(isLoading) {
    if (isLoading) {
        loadingSpinner.classList.remove('hidden');
        dashboard.style.opacity = '0.45';
        dashboard.style.pointerEvents = 'none';
    } else {
        loadingSpinner.classList.add('hidden');
        dashboard.style.opacity = '1';
        dashboard.style.pointerEvents = 'auto';
    }
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.classList.remove('hidden');
    // Auto-scroll to top so user sees the message
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideError() {
    errorBanner.classList.add('hidden');
}
