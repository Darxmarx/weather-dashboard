var city= ""; //stores searched city

//query selectors
var searchCity = $("#search-city");
var searchBtn = $("#search-button");
var clearBtn = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidity = $("#humidity");
var currentWindSpeed = $("#wind-speed");
var currentUvIndex = $("#uv-index");
var sCity = [];

var APIKey = "6f0b8ef5066bd374b8e3cc7ecf08e140"; //personal api key

// searches the city to see if it exists in the entries from the storage
function find(c) {
    for (var i = 0; i < sCity.length; i++){
        if (c === sCity[i]) {
            return -1;
        }
    }
    return 1;
}

//displays current weather, and 5-day forecast
function displayWeather(event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        currentWeather(city);
    }
}

//AJAX call
function currentWeather(city){
    //decalre url with parameters, city query, and api key
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function(response){

        console.log(response);//logs response to console to check info was received correctly
        
        //api generates appropriate icon for weather
        var weatherIcon = response.weather[0].icon;
        var iconUrl ="https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
        var date=new Date(response.dt*1000).toLocaleDateString();
        //parse response for name of city, date, and image appropriate for weather
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconUrl+">");
        
        //parse response for current temp, change to Fahrenheit    
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2)+"&#8457");
        $(currentHumidity).html(response.main.humidity+"%"); //humidity
        var ws = response.wind.speed; //wind speed
        var windsmph = (ws*2.237).toFixed(1); //change wind speed to mph
        $(currentWindSpeed).html(windsmph+"MPH");

        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod == 200){
            sCity = JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity == null){
                sCity = [];
                sCity.push(city
                );
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    sCity.push(city);
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}

//uv index response function
function UVIndex(ln,lt) {
    //url for uv index
    var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(currentUvIndex).html(response.value);
            });
}
    
//5-day forecast function
function forecast(cityId) {
    var queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityId + "&appid=" + APIKey;
    $.ajax({
        url: queryforcastURL,
        method: "GET"
    }).then(function(response) {
        
        for (i=0;i<5;i++){
            var date = new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode = response.list[((i+1)*8)-1].weather[0].icon;
            var iconUrl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
            var tempK = response.list[((i+1)*8)-1].main.temp;
            var tempF = (((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity = response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate" + i).html(date);
            $("#fImg" + i).html("<img src=" + iconUrl + ">");
            $("#fTemp" + i).html(tempF + "&#8457");
            $("#fHumidity" + i).html(humidity + "%");
        }
        
    });
}

//add searched city to search history
function addToList(c) {
    var listEl = $("<li>" + c + "</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c);
    $(".list-group").append(listEl);
}

//function that displays information for previous search
function invokePastSearch(event){
    var liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }

}

//loads from local storage
function loadlastCity(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity !== null){
        sCity = JSON.parse(localStorage.getItem("cityname"));
        for(i = 0; i <sCity.length; i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}

//clears search history and local storage
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}

//button event listeners
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);
