// const searchBar = document.querySelector("input");
// const searchButton = document.querySelector("button");

// Retrieve location
let coords;
try {
    const location = await getLocation();
    coords = getPosition(location);
} catch (error) {
    showError(error);
}

// Build query
const unit = "metric";
const weatherQuery =
    "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/" +
    coords[0] +
    "," +
    coords[1] +
    "?unitGroup=" +
    unit +
    "&key=3VBHDWDMBCQABZH2U8VU3LS9Z&contentType=json";

// Get and parse query data
const result = await getData(weatherQuery);
console.log("🚀 ~ result:", result);
console.log(result["days"][0]["datetime"] + ": " + result["days"][0]["temp"]);

// ===== FUNCTIONS =====
async function getLocation() {
    if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return null;
    }
    return new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        });
    });
}

function getPosition(position) {
    return [position.coords.latitude, position.coords.longitude];
}

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
