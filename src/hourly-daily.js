// Import functions
import { quickBuildImgCarousel } from "./image-carousel";
import { getUnit } from "./index.js";
import { format } from "date-fns";

// Import images
import sunnySvg from "./images/weather-sunny.svg";
import cloudySvg from "./images/weather-cloudy.svg";
import rainSvg from "./images/weather-rain.svg";
import snowySvg from "./images/weather-snowy.svg";
import leftArrow from "./images/left-arrow.svg";
import rightArrow from "./images/right-arrow.svg";

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

function displayHourlyWeatherData(dataset, unit) {
    const parameters = [
        "datetime",
        "temp",
        "feelslike",
        "precip",
        "precipprob",
    ];
    const HOURS_DISPLAYED = 24;

    // Get weather icon to display in carousel
    const iconArr = [];
    for (let i = 0; i < HOURS_DISPLAYED; i++) {
        const preciptype = getHourlyResult(i, dataset, "preciptype");
        const precipprob = getHourlyResult(i, dataset, "precipprob");
        const cloudcover = getHourlyResult(i, dataset, "cloudcover");
        iconArr.push(getWeatherIcon(preciptype, precipprob, cloudcover));
    }

    // Create carousel with weather icon
    const hourlyDiv = document.querySelector("div.hourly");
    const hourlyHeader = document.createElement("h3");
    hourlyHeader.textContent = "24-Hour Forecast";
    hourlyDiv.replaceChildren(hourlyHeader);
    quickBuildImgCarousel(hourlyDiv, iconArr, leftArrow, rightArrow);

    // Get other data to display in carousel
    const hdataChild = hourlyDiv.querySelector("div.wide-container").children;
    for (let i = 0; i < HOURS_DISPLAYED; i++) {
        // Display hour
        const hourP = document.createElement("p");
        let hour = getHourlyResult(i, dataset, parameters[0]);
        hour = hour.slice(0, 2);
        hourP.textContent = hour;
        hdataChild[i].insertBefore(hourP, hdataChild[i].children[0]);

        // Display other parameters
        for (let j = 1; j < parameters.length; j++) {
            const value = getHourlyResult(i, dataset, parameters[j]);
            const newP = document.createElement("p");
            newP.textContent =
                Math.round(value * 10) / 10 + getUnit(parameters[j], unit);
            hdataChild[i].appendChild(newP);
        }
    }
}

function displayDailyWeatherData(dataset, unit) {
    const parameters = ["datetime", "temp", "precip", "precipprob"];
    const DAYS_DISPLAYED = 14;

    // Get weather icon to display in carousel
    const iconArr = [];
    for (let i = 0; i < DAYS_DISPLAYED; i++) {
        const preciptype = getDailyResult(i, dataset, "preciptype");
        const precipprob = getDailyResult(i, dataset, "precipprob");
        const cloudcover = getDailyResult(i, dataset, "cloudcover");
        iconArr.push(getWeatherIcon(preciptype, precipprob, cloudcover));
    }

    // Create carousel with weather icon
    const dailyDiv = document.querySelector("div.daily");
    const dailyHeader = document.createElement("h3");
    dailyHeader.textContent = "14-Day Forecast";
    dailyDiv.replaceChildren(dailyHeader);
    quickBuildImgCarousel(dailyDiv, iconArr, leftArrow, rightArrow);

    // Get other data to display in carousel
    const hdataChild = dailyDiv.querySelector("div.wide-container").children;
    for (let i = 0; i < DAYS_DISPLAYED; i++) {
        // Display day
        const dayP = document.createElement("p");
        let day = getDailyResult(i, dataset, parameters[0]);
        day = day.replaceAll("-", "/");
        dayP.textContent = format(day, "EEE d");
        hdataChild[i].insertBefore(dayP, hdataChild[i].children[0]);

        // Display other parameters
        for (let j = 1; j < parameters.length; j++) {
            const value = getDailyResult(i, dataset, parameters[j]);
            const newP = document.createElement("p");
            newP.textContent =
                Math.round(value * 10) / 10 + getUnit(parameters[j], unit);
            hdataChild[i].appendChild(newP);
        }
    }
}

function getWeatherIcon(preciptype, precipprob, cloudcover) {
    if (preciptype === null && cloudcover > 10) {
        return cloudySvg;
    } else if (preciptype === null) {
        return sunnySvg;
    }
    preciptype = preciptype.join(" ");
    console.log("🚀 ~ getWeatherIcon ~ preciptype:", preciptype);
    if (preciptype.includes("snow") && precipprob >= 35) {
        return snowySvg;
    } else if (preciptype.includes("rain") && precipprob >= 35) {
        return rainSvg;
    } else if (cloudcover > 10) {
        return cloudySvg;
    } else {
        return sunnySvg;
    }
}

function test(ihour, dataset, parameter) {
    return getDailyResult(ihour, dataset, parameter);
}

export { test, displayHourlyWeatherData, displayDailyWeatherData };
