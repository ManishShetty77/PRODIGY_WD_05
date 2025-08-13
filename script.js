const API_KEY = '7a0f9133c04c8952c67fd2115ae54fa2';

async function fetchWeather(url, showForecast = true) {
  const weatherInfo = document.getElementById("weatherInfo");
  weatherInfo.innerHTML = "<p>Loading...</p>";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather not found");
    const data = await response.json();
    displayWeather(data);
    if (showForecast) fetchForecast(data.coord.lat, data.coord.lon);
  } catch (error) {
    displayError(error.message);
  }
}

async function fetchForecast(lat, lon) {
  const unit = document.getElementById("unitSelect").value;
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast not found");
    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    console.warn("Forecast error:", error.message);
  }
}

function getWeatherByCity() {
  const city = document.getElementById("cityInput").value.trim();
  const unit = document.getElementById("unitSelect").value;
  if (!city) {
    alert("Please enter a city name.");
    return;
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${unit}&appid=${API_KEY}`;
  fetchWeather(url);
  document.getElementById("cityInput").value = "";
}

function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const unit = document.getElementById("unitSelect").value;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;
        fetchWeather(url);
      },
      () => {
        alert("Location access denied.");
      }
    );
  } else {
    alert("Geolocation not supported by your browser.");
  }
}

function displayWeather(data) {
  const icon = data.weather[0].icon;
  const unitSymbol = document.getElementById("unitSelect").value === "metric" ? "C" : "F";
  const windUnit = unitSymbol === "C" ? "m/s" : "mph";
  const html = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <p>
      <img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${data.weather[0].description}" />
      ${data.weather[0].main} - ${data.weather[0].description}
    </p>
    <p>🌡️ Temperature: ${data.main.temp}°${unitSymbol}</p>
    <p>💧 Humidity: ${data.main.humidity}%</p>
    <p>🌬️ Wind: ${data.wind.speed} ${windUnit}</p>
  `;
  document.getElementById("weatherInfo").innerHTML = html;
}

function displayForecast(data) {
  const filtered = data.list.filter(item => item.dt_txt.includes("12:00:00"));
  let forecastHTML = `<h3>5-Day Forecast</h3><div class="forecast-container">`;
  filtered.forEach(day => {
    const date = new Date(day.dt_txt);
    const options = { weekday: "short", month: "short", day: "numeric" };
    const dayString = date.toLocaleDateString(undefined, options);
    const icon = day.weather[0].icon;
    const temp = Math.round(day.main.temp);
    const desc = day.weather[0].main;
    const unitSymbol = document.getElementById("unitSelect").value === "metric" ? "C" : "F";
    forecastHTML += `
      <div class="forecast-day" tabindex="0" aria-label="Forecast for ${dayString}: ${desc}, ${temp} degrees">
        <p><strong>${dayString}</strong></p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" />
        <p>${temp}°${unitSymbol}</p>
        <p>${desc}</p>
      </div>
    `;
  });
  forecastHTML += `</div>`;
  document.getElementById("weatherInfo").insertAdjacentHTML("beforeend", forecastHTML);
}

function displayError(message) {
  const weatherInfo = document.getElementById("weatherInfo");
  const iconUrl = "https://img.icons8.com/ios-glyphs/30/fa314a/error.png";
  weatherInfo.innerHTML = `
    <div class="error-message" role="alert" aria-live="assertive">
      <img src="${iconUrl}" alt="Error icon" />
      <span>Error: ${message}</span>
    </div>
  `;
}

document.getElementById("weatherForm").addEventListener("submit", (e) => {
  e.preventDefault();
  getWeatherByCity();
});

document.getElementById("locationBtn").addEventListener("click", getWeatherByLocation);
