function getWeather() {
    const apiKey = '9ccee6c9cf8f9ef31f9f34734dfdeba4';
    const city = document.getElementById('city').value;

    if (!city) {
        alert('Please enter a city');
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast(data.list);
        })
        .catch(error => {
            console.error('Error fetching hourly forecast data:', error);
            alert('Error fetching hourly forecast data. Please try again.');
        });
}

function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherRecommendationDiv = document.getElementById('weather-recommendation');  

    // Clear previous content
    weatherInfoDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';
    weatherRecommendationDiv.innerHTML = '';  

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.name;
        const temperature = Math.round(data.main.temp);
        const description = data.weather[0].description;

        const temperatureHTML = `<p>${temperature}°C</p>`;
        const weatherHtml = `<p>${cityName}</p><p>${description}</p>`;

        // ✅ Fetch recommendation
        const recommendation = getWeatherRecommendation(temperature, description);
        console.log("Weather Recommendation:", recommendation);  // Debugging output

        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHtml;
        weatherRecommendationDiv.innerHTML = `<p>${recommendation}</p>`;  
    }
}

function getWeatherRecommendation(temp, condition) {
    console.log("Checking Recommendation for Temp:", temp, "Condition:", condition); // Debugging output

    if (temp > 30) {
        return "☀️ It's hot outside! Stay hydrated and avoid direct sunlight.";
    } else if (temp >= 20 && temp <= 30) {
        return "🌤️ Great weather! A perfect time for outdoor activities.";
    } else if (temp >= 10 && temp < 20) {
        return "🌬️ Cool and breezy. Light jackets recommended!";
    } else {
        return "❄️ It's cold! Stay warm and indoors if possible.";
    }
}



function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByCoords(lat, lon);
        }, error => {
            console.error("Error fetching location:", error);
            alert("Location access denied. Please enter a city manually.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
    { timeout: 10000 }
}

function getWeatherByCoords(lat, lon) {
    const apiKey = '9ccee6c9cf8f9ef31f9f34734dfdeba4';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    
    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            
        });
}

function initWeatherMap() {
    const map = L.map('weather-map').setView([20, 78], 5); // Centered in India
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        getWeatherByCoords(lat, lng);
    });
}

window.onload = function() {
    getLocationWeather();
    initWeatherMap();
};

function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    const next24Hours = hourlyData.slice(0, 8); // Display the next 24 hours (3-hour intervals)

    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000); // Convert timestamp to milliseconds
        const hour = dateTime.getHours();
        const temperature = Math.round(item.main.temp); // No conversion needed
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span>${temperature}°C</span>
            </div>
        `;

        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    });
}


window.onload = function() {
    getLocationWeather();
    setTimeout(initWeatherMap, 500);
};
function getAQI(lat, lon) {
    const apiKey = '9ccee6c9cf8f9ef31f9f34734dfdeba4';
    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(aqiUrl)
        .then(response => response.json())
        .then(data => {
            displayAQI(data.list[0].main.aqi);
        })
        .catch(error => {
            console.error("Error fetching AQI data:", error);
            document.getElementById("aqi-level").innerText = "AQI data unavailable.";
        });
}

function displayAQI(aqi) {
    const aqiLevel = document.getElementById("aqi-level");
    const aqiMessage = document.getElementById("aqi-message");

    let aqiText, color;
    
    if (aqi === 1) {
        aqiText = "Good (0-50)";
        color = "green";
    } else if (aqi === 2) {
        aqiText = "Fair (51-100)";
        color = "yellow";
    } else if (aqi === 3) {
        aqiText = "Moderate (101-150)";
        color = "orange";
    } else if (aqi === 4) {
        aqiText = "Poor (151-200)";
        color = "red";
    } else {
        aqiText = "Very Poor (201-500)";
        color = "red";
    }

    aqiLevel.innerText = `AQI: ${aqiText}`;
    aqiLevel.style.color = color;

    aqiMessage.innerText = getAQIMessage(aqi);
}

function getAQIMessage(aqi) {
    if (aqi === 1) return "✅ Air is clean. Enjoy outdoor activities!";
    if (aqi === 2) return "🙂 Air quality is fair. No major risks.";
    if (aqi === 3) return "⚠️ Sensitive individuals should limit outdoor time.";
    if (aqi === 4) return "🚨 Unhealthy air! Reduce outdoor exposure.";
    return "❌ Very unhealthy! Avoid going outside.";
}


function getWeatherByCoords(lat, lon) {
    const apiKey = '9ccee6c9cf8f9ef31f9f34734dfdeba4';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
            getAQI(lat, lon);  
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
        });
}
