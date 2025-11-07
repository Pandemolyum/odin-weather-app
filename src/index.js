import "./style.css";
import clearSkyImg from "./images/clear-sky.jpg";
import cloudySkyImg from "./images/cloudy-sky.jpg";
import rainImg from "./images/rain.jpg";
import snowImg from "./images/snow.jpg";
import sunnySvg from "./images/weather-sunny.svg";
import cloudySvg from "./images/weather-cloudy.svg";
import rainSvg from "./images/weather-rain.svg";
import snowySvg from "./images/weather-snowy.svg";
import searchSvg from "./images/magnify.svg";
import locationSvg from "./images/map-marker-radius.svg";
import loadingGif from "./images/loading.gif";
import imgRefs from "./ref/img-refs.json" with { type:"json"};

let unit = "metric";

updateIcons();

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
const searchButton = document.querySelector("img.search");
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

// Returns results for the cvurrent location
const locationButton = document.querySelector("img.location-search");
locationButton.addEventListener("click", () => {
    if (unitButton.checked) {
        unit = "us";
    } else {
        unit = "metric";
    }
    getGeolocationData(unit);
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
    showLoadingIcons()
    try {
        const location = await getLocation();
        const coords = getPosition(location);
        updateLocation(unit, coords[0] + "," + coords[1]);
    } catch (error) {
        showError(error);
    }
    hideLoadingIcons();
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
    showLoadingIcons()
    const result = await getData(weatherQuery);
    if (result) {
        displayWeatherData(location, result, unit);
    }
    hideLoadingIcons();
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
    } else if (parameter === "winddir") {
        value = getWindDirection(value);
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

// Returns wind direction based on documentation found below:
// https://www.visualcrossing.com/resources/documentation/weather-data/weather-data-documentation/
function getWindDirection(value) {
    const dirIndex = Math.floor((value + 11.25)/22.5);
    const dirArr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return dirArr[dirIndex];
}

// Updates the background picture and picture credits when the conditions'
// element textContent updates
function onConditionsTextContentChange(mutation) {
    const description = mutation[0].target.textContent.toLowerCase();
    let url;
    let img;
    let svg;

    if (description.includes("snow")) {
        url = snowImg;
        img = "snow.jpg";
        svg = snowySvg;
    } else if (
        description.includes("rain") ||
        description.includes("drizzle") ||
        description.includes("storm")
    ) {
        url = rainImg;
        img = "rain.jpg";
        svg = rainSvg;
    } else if (
        description.includes("overcast") ||
        description.includes("cloud")
    ) {
        url = cloudySkyImg;
        img = "cloudy-sky.jpg";
        svg = cloudySvg;
    } else {
        url = clearSkyImg;
        img = "clear-sky.jpg";
        svg = sunnySvg;
    }

    // Update background picture and its credits
    const body = document.querySelector("body");
    const credits = document.getElementById("credits");
    const creditsLink = document.getElementById("credits-link");

    body.style.backgroundImage = `url(${url}`;
    credits.textContent = "Background by " + imgRefs[img].artist + " on ";
    creditsLink.textContent = "Unsplash";
    creditsLink.href = imgRefs[img].link;

    // Update svg icon
    const svgElem = document.getElementById("conditions-svg");
    svgElem.src = svg;
}

// Updates icon sources
function updateIcons() {
    const searchIcon = document.querySelector("img.search")
    searchIcon.src = searchSvg;

    const locationIcon = document.querySelector("img.location-search")
    locationIcon.src = locationSvg;

    const searchIconLoad = document.querySelector("img.loading")
    searchIconLoad.src = loadingGif;

    const locationIconLoad = document.querySelector("img.loading-search")
    locationIconLoad.src = loadingGif;
}

function hideLoadingIcons() {
    const searchIcon = document.querySelector("img.search")
    searchIcon.style.display = "inline-block";

    const locationIcon = document.querySelector("img.location-search")
    locationIcon.style.display = "inline-block";

    const searchIconLoad = document.querySelector("img.loading")
    searchIconLoad.style.display = "none";

    const locationIconLoad = document.querySelector("img.loading-search")
    locationIconLoad.style.display = "none";
}

function showLoadingIcons() {
    const searchIcon = document.querySelector("img.search")
    searchIcon.style.display = "none";

    const locationIcon = document.querySelector("img.location-search")
    locationIcon.style.display = "none";

    const searchIconLoad = document.querySelector("img.loading")
    searchIconLoad.style.display = "inline-block";

    const locationIconLoad = document.querySelector("img.loading-search")
    locationIconLoad.style.display = "inline-block";
}