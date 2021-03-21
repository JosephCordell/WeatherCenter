const search = document.getElementById('searchBar');
const searchBtn = document.querySelector('.magnify');
const hysterectomy = document.getElementById('history')

searchBtn.addEventListener('click', weatherSearch);
hysterectomy.addEventListener('click', weatherSearch)

let today = new Date();
let hArray = JSON.parse(localStorage.getItem('history')) || []

const apiKey = 'a59bbeba7bafcee0f00d3e1c5baef098'


let latitude = 0;
let longitude = 0;
let apiCurrentTest = `http://api.openweathermap.org/data/2.5/weather?q=${hArray.length === 0?'earth': hArray[0].city}&units=imperial&appid=a59bbeba7bafcee0f00d3e1c5baef098`

//updates the page for the City that the user searches for
function weatherSearch(event) {
    event.preventDefault()
    if (event.target.localName === 'li') {
        input = event.target.innerHTML.toLowerCase()
        apiURL = `http://api.openweathermap.org/data/2.5/weather?q=${input}&units=imperial&appid=${apiKey}`
    }else {
        input = search.value.toLowerCase()
        apiURL = `http://api.openweathermap.org/data/2.5/weather?q=${input}&units=imperial&appid=${apiKey}`
    }
    fetch(apiURL)
        .then(response => {
            if (response.ok){
                return response.json();
            } else{
            throw new Error("Please put a real city and just the city name")
            }
        })
        .then(request => {
            currentWeather(request);
        })
        .catch(error => {
            alert(error)
        });
}

//gets default data for when user loads the page
fetch(apiCurrentTest)
    .then(response => {
    return response.json();
    })
    .then(request => {
        currentWeather(request);
    })
    .catch(error => {
        alert(error)
    });

//data to fill todays weather 
function currentWeather (response) {
    latitude = response.coord.lat
    longitude =response.coord.lon
    const searchCity = response.name
    let apiOneCall = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely,alerts&units=imperial&appid=${apiKey}`
    updateHistory(response)
    fetch(apiOneCall)
        .then(response => {
            if (response.ok){
                return response.json();
            } else{
            throw new Error("Please put just a city name")
            }
        })
        .then(request => {
        forecastCards(request, searchCity)
        })
        .catch(error => {
            alert(error)
        });
}

//data to fill the next 5 days of forecast cards
function forecastCards (response, searchCity){
    document.getElementById('weather-container').innerHTML = ''
    document.getElementById('weatherInfo').innerHTML = ''
        const todayEl = document.createElement('div')

        const temp = response.current.temp
        const humidity = response.current.humidity
        const windSpeed = response.current.wind_speed
        const uvi = addUV(response.current.uvi)
        const image = response.current.weather[0].icon
        const imageALT = response.current.weather[0].main
        const todayInnerHTML = ` 
            <h1>${searchCity} <br> ${today.toLocaleDateString("en-US",{year: "numeric", month: "numeric", day: "numeric"})}</h1>

            <img src="http://openweathermap.org/img/wn/${image}@2x.png" alt="${imageALT}">
            <div class='weatherDetail'>Temperature: ${temp}</div>
            <div class='weatherDetail'>Humidity: ${humidity}</div>
            <div class='weatherDetail'>Wind Speed: ${windSpeed}</div>
            <div class='weatherDetail'>UV Index: ${uvi}</div>
        `;
        todayEl.innerHTML = todayInnerHTML
        document.getElementById('weatherInfo').appendChild(todayEl)
        for (let i = 1; i < 6; i++) {

            let future_date = new Date(today)
            let date_options = {year: "numeric", month: "numeric", day: "numeric"};
            future_date.setDate(today.getDate() + i)
            const forecastEl = document.createElement('div')
            forecastEl.classList.add('weather-card')
            const date = `${future_date.toLocaleDateString("en-US", {weekday: "long"})}<br>${future_date.toLocaleDateString("en-US", date_options)}`
            const temp1 = response.daily[i].temp.max
            const humidity1 = response.daily[i].humidity
            const image1 = response.daily[i].weather[0].icon
            const imageALT1 = response.current.weather[0].main
            const cardInnerHTML = `
            <h1>${date}</h1> 
            <img src="http://openweathermap.org/img/wn/${image1}@2x.png" alt="${imageALT1}">
            <div class='weatherDetail'>Temperature: ${temp1}</div>
            <div class='weatherDetail'>Humidity: ${humidity1}</div>
            `
            forecastEl.innerHTML = cardInnerHTML
            document.getElementById('weather-container').appendChild(forecastEl)
        }
}

function updateHistory(response) {
    hysterectomy.innerHTML = ''
    hArray.unshift({
        id: response.id,
        city: response.name
    })
    hArray.forEach(id => {
        const historyEl = document.createElement('li')
        hInnerHTML = `<li data-id= ${id.id}>${id.city}</li>`
        historyEl.innerHTML= id.city
        document.getElementById('history').appendChild(historyEl)
    })
    while (hArray.length >= 5) {
        hArray.pop()
    }
    localStorage.setItem("history", JSON.stringify(hArray))
}


function addUV(UVI) {
    let uv; 
    if (UVI <= 2) {
        uv = `<span class='low'> ${UVI}</span>`
    } else if (UVI <= 6) {
        uv = `<span class='moderate'> ${UVI}</span>`
    } else if (UVI <= 8) {
        uv = `<span class='high'> ${UVI}</span>`
    } else if (UVI <= 11) {
        uv = `<span class='very-high'> ${UVI}</span>`
    } else {
        uv = `<span class='extreme'> ${UVI}</span>`
    }
    return uv;
}