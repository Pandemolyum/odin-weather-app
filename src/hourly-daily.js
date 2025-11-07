import sunnySvg from "./images/weather-sunny.svg";
import cloudySvg from "./images/weather-cloudy.svg";
import rainSvg from "./images/weather-rain.svg";
import snowySvg from "./images/weather-snowy.svg";

// Returns current hour as an integer from 0 to 23
function getSystemHour() {
    const now = new Date();
    return now.getHours();
}

// Returns timezone offset compared to UTC
function getSystemTimezone() {
    const now = new Date();
    return now.getHours() - now.getUTCHours();
}

// Returns parameter from the dataset for the next i hours
// with 0 being the current hour and 1 being the next hour
function getHourlyResult(ihour, dataset, parameter) {
    // The JSON is adjusted to the location's local time. The first entries will always
    // be the current date and time. We use the system timezone to account for the
    // difference in timezone with the requested location.
    let time = getSystemHour() + (dataset.tzoffset - getSystemTimezone());

    // Apply hour offset (no need to change days because time is returned in local
    // time and first entries will be current day)
    if (time >= 24) {
        time -= 24;
    } else if (time < 0) {
        time += 24;
    }

    // Apply incremental hour and day offset
    time += ihour;
    let day = 0;
    if (time >= 24) {
        time -= 24;
        day++;
    }

    return dataset.days[day].hours[time][parameter];
}

// Returns parameter from the dataset for the next i days
// with 0 being the current day and 1 being the next day
function getDailyResult(iday, dataset, parameter) {
    return dataset.days[iday][parameter];
}

function displayHourlyResults() {
    const hourlyDiv = document.querySelector("div.hourly");
    const parameters = [
        "datetime",
        "temp",
        "feelslike",
        "precip",
        "precipprob",
    ];
}

function displayDailyResults() {
    const dailyDiv = document.querySelector("div.daily");
    const parameters = [
        "datetime",
        "tempmax",
        "tempmin",
        "precip",
        "precipprob",
    ];
}

function getWeatherIcon(preciptype, precipprob, cloudcover) {
    let svg;

    if (preciptype.contains("snow") && precipprob >= 35) {
        svg = snowySvg;
    } else if (preciptype.contains("rain") && precipprob >= 35) {
        svg = rainSvg;
    } else if (cloudcover > 10) {
        svg = cloudySvg;
    } else {
        svg = sunnySvg;
    }

    return svg;
}

function test(ihour, dataset, parameter) {
    return getDailyResult(ihour, dataset, parameter);
}

export { test };
