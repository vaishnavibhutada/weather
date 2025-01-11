const apiKey = "6cfa9afa7a0516a1689d67eea871f8d1"; // OpenWeather API Key

const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
const alertsUrl = 'https://api.openweathermap.org/data/2.5/alerts';
const newsUrl = 'https://newsapi.org/v2/top-headlines?q=weather&apiKey=YOUR_NEWS_API_KEY'; // Replace with a News API key

document.getElementById('search-btn').addEventListener('click', searchWeather);
document.getElementById('refresh-btn').addEventListener('click', refreshWeather);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
window.addEventListener('load', detectLocation);

async function searchWeather() {
  const city = document.getElementById('city-input').value.trim();

  if (city === '') {
    alert('Please enter a city name!');
    return;
  }

  try {
    const weatherResponse = await fetch(`${weatherUrl}?q=${city}&appid=${apiKey}&units=metric`);
    const weatherData = await weatherResponse.json();
    if (weatherData.cod === '404') {
      document.getElementById('weather-details').innerHTML = `<p class="placeholder">City not found. Please try again.</p>`;
    } else {
      displayWeatherDetails(weatherData);
      fetchForecast(city);
      fetchWeatherAlerts(city);
      fetchWeatherNews();
      initMap(weatherData.coord.lat, weatherData.coord.lon);
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    document.getElementById('weather-details').innerHTML = `<p class="placeholder">Error fetching data. Please try again.</p>`;
  }
}

function displayWeatherDetails(data) {
  document.getElementById('weather-details').innerHTML = `
    <p><strong>Weather:</strong> ${data.weather[0].description}</p>
    <p><strong>Temperature:</strong> ${Math.round(data.main.temp)}°C</p>
    <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
    <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
  `;
  document.getElementById('location-name').textContent = `Weather in ${data.name}`;
}
async function fetchForecast(city) {
    try {
      const forecastResponse = await fetch(`${forecastUrl}?q=${city}&appid=${apiKey}&units=metric`);
      const forecastData = await forecastResponse.json();
      const forecastCards = document.getElementById('forecast-details');
      forecastCards.innerHTML = '';
  
      // Ensure you display 5 days of forecast, not every 3-hour interval
      const dailyForecasts = [];
      forecastData.list.forEach(forecast => {
        const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString();
        if (!dailyForecasts.some(item => item.date === forecastDate)) {
          dailyForecasts.push({
            date: forecastDate,
            temp: Math.round(forecast.main.temp),
            description: forecast.weather[0].description
          });
        }
      });
  
      // Display only the first 5 unique daily forecasts
      dailyForecasts.slice(0, 5).forEach(forecast => {
        forecastCards.innerHTML += `
          <div class="forecast-card">
            <p>${forecast.date}</p>
            <p>${forecast.temp}°C</p>
            <p>${forecast.description}</p>
          </div>
        `;
      });
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    }
  }
  

async function fetchWeatherAlerts(city) {
  try {
    const alertResponse = await fetch(`${alertsUrl}?q=${city}&appid=${apiKey}`);
    const alertData = await alertResponse.json();
    const alertDiv = document.getElementById('alerts');
    alertDiv.innerHTML = '';

    if (alertData.length > 0) {
      alertDiv.innerHTML = '<h3>Weather Alerts</h3>';
      alertData.forEach(alert => {
        alertDiv.innerHTML += `<p>${alert.event}: ${alert.description}</p>`;
      });
    } else {
      alertDiv.innerHTML = '<p>No weather alerts for this location.</p>';
    }
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
  }
}

async function fetchWeatherNews() {
  try {
    const newsResponse = await fetch(newsUrl);
    const newsData = await newsResponse.json();
    const newsDiv = document.getElementById('weather-news');
    newsDiv.innerHTML = '';

    newsData.articles.forEach(article => {
      newsDiv.innerHTML += `
        <p><a href="${article.url}" target="_blank">${article.title}</a></p>
      `;
    });
  } catch (error) {
    console.error('Error fetching weather news:', error);
  }
}

function initMap(lat, lon) {
  const map = L.map('map').setView([lat, lon], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  L.marker([lat, lon]).addTo(map)
    .bindPopup('Weather location')
    .openPopup();
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
}

async function detectLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const weatherResponse = await fetch(`${weatherUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const weatherData = await weatherResponse.json();
        displayWeatherDetails(weatherData);
        fetchForecast(weatherData.name);
        fetchWeatherAlerts(weatherData.name);
        fetchWeatherNews();
        initMap(lat, lon);
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    });
  }
}

function refreshWeather() {
  const city = document.getElementById('city-input').value.trim();
  if (city) {
    searchWeather();
  } else {
    alert('Please enter a city name first.');
  }
}
