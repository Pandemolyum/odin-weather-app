import "./style.css";
import clearSkyImg from "./images/clear-sky.jpg";
import cloudySkyImg from "./images/cloudy-sky.jpg";
import rainImg from "./images/rain.jpg";
import snowImg from "./images/snow.jpg";

let unit = "metric";

// Displays new weather data based on search value after pressing Enter
const searchBar = document.querySelector("input.search");
let lastSearch = "";
searchBar.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && lastSearch !== searchBar.value) {
        lastSearch = searchBar.value;
        updateLocation(unit, searchBar.value);
    }
});

// Displays new weather data based on search value after clicking the search button
const searchButton = document.querySelector("button.search");
searchButton.addEventListener("click", () => {
    updateLocation(unit, searchBar.value);
});

// Displays weather data of the currently displayed query on unit toggled
const unitButton = document.querySelector("label.unit input");
unitButton.addEventListener("change", () => {
    if (unitButton.checked) {
        unit = "us";
    } else {
        unit = "metric";
    }
    updateLocation(unit, document.getElementById("location").textContent);
});

getGeolocationData(unit);

// Changes background based on weather conditions
const observer = new MutationObserver(onConditionsTextContentChange);
const config = {
    characterData: false,
    attributes: false,
    childList: true,
    subtree: false,
};
const conditions = document.getElementById("conditions");
observer.observe(conditions, config);

// Retrieves the current geolocation and updates it
async function getGeolocationData(unit) {
    try {
        const location = await getLocation();
        const coords = getPosition(location);
        updateLocation(unit, coords[0] + "," + coords[1]);
    } catch (error) {
        showError(error);
    }
}

// Builds a query for new weather data and calls getData which queries
// the weather data, then updates the display
async function updateLocation(unit, location) {
    // Build query
    const weatherQuery =
        "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/" +
        location +
        "?unitGroup=" +
        unit +
        "&key=3VBHDWDMBCQABZH2U8VU3LS9Z&contentType=json";

    // Get and display query data
    const result = await getData(weatherQuery);
    if (result) {
        displayWeatherData(location, result, unit);
    }
}

// Returns the current geolocation
async function getLocation() {
    if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return null;
    }
    return new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });
    });
}

// Returns the current latitude and longitude given a navigator.geolocation position
function getPosition(position) {
    return [position.coords.latitude, position.coords.longitude];
}

// Displays geolocation errors in the console
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.error("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.error("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.error("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.error("An unknown error occurred.");
            break;
    }
}

// Sends a query and returns the JSON result
async function getData(query) {
    try {
        const response = await fetch(query);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        console.log("🚀 ~ getData ~ result:", result);
        return result;
    } catch (error) {
        console.error(error.message);
    }
}

// Displays weather data based on a JSON result and specific parameters
function displayWeatherData(location, data, unit) {
    const parameters = [
        "conditions",
        "temp",
        "feelslike",
        "humidity",
        "precip",
        "precipprob",
        "windspeed",
        "winddir",
        "pressure",
        "uvindex",
        "sunrise",
        "sunset",
        "moonphase",
    ];

    const locationH2 = document.querySelector("h2");
    locationH2.textContent = location;

    for (let param of parameters) {
        setTextContent(param, data, unit);
    }
}

// Sets the textContent property of the element with a specified id
// based on queried JSON data
function setTextContent(parameter, data, unit) {
    const elem = document.getElementById(parameter);

    let value = data["currentConditions"][parameter];
    if (parameter === "moonphase") {
        value = getMoonPhase(value);
    }

    elem.textContent = value + getUnit(parameter, unit);
}

// Returns the appropriate unit for a given parameter based on documentation found below:
// https://www.visualcrossing.com/resources/documentation/weather-data/weather-data-documentation/
function getUnit(parameter, unit) {
    if (unit === "metric") {
        switch (parameter) {
            case "temp":
                return "°C";
            case "feelslike":
                return "°C";
            case "humidity":
                return "%";
            case "precip":
                return " mm";
            case "precipprob":
                return "%";
            case "windspeed":
                return " kph";
            case "pressure":
                return "mb";
            default:
                return "";
        }
    }

    if (unit === "us") {
        switch (parameter) {
            case "temp":
                return "°F";
            case "feelslike":
                return "°F";
            case "humidity":
                return "%";
            case "precip":
                return " inches";
            case "precipprob":
                return "%";
            case "windspeed":
                return " mph";
            case "pressure":
                return "mb";
            default:
                return "";
        }
    }
}

// Returns a moon phase with an emoji based on documentation found below:
// https://www.visualcrossing.com/resources/documentation/weather-data/weather-data-documentation/
function getMoonPhase(value) {
    switch (true) {
        case value === 0:
            return "New Moon 🌑";
        case value > 0 && value < 0.25:
            return "Waxing Crescent 🌒";
        case value === 0.25:
            return "First Quarter 🌓";
        case value > 0.25 && value < 0.5:
            return "Waxing Gibbous 🌔";
        case value === 0.5:
            return "Full Moon 🌕";
        case value > 0.5 && value < 0.75:
            return "Waning Gibbous 🌖";
        case value === 0.75:
            return "Last Quarter 🌗";
        case value > 0.75 && value < 1:
            return "Waning Crescent 🌘";
    }
}

function onConditionsTextContentChange(mutation) {
    const description = mutation[0].target.textContent.toLowerCase();
    const body = document.querySelector("body");
    console.log("🚀 ~ onConditionsTextContentChange ~ body:", body);
    console.log("🚀 ~ description:", description);
    if (description.includes("snow")) {
        body.style.backgroundImage = `url(${snowImg}`;
    } else if (
        description.includes("rain") ||
        description.includes("drizzle") ||
        description.includes("storm")
    ) {
        body.style.backgroundImage = `url(${rainImg}`;
    } else if (
        description.includes("overcast") ||
        description.includes("cloud")
    ) {
        body.style.backgroundImage = `url(${cloudySkyImg}`;
    } else {
        body.style.backgroundImage = `url(${clearSkyImg}`;
    }
}
