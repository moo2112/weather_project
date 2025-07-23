require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/weather", async (req, res) => {
  const city = req.body.city;
  const apiKey = process.env.WEATHER_API_KEY;
  try {
    const geoURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    const geoRES = await axios.get(geoURL);
    if (geoRES.data.length === 0) {
      res.render("result", {
        city,
        rain: null,
        error: "The city doesn't exist",
      });
    }
    const { lat, lon } = geoRES.data[0];
    const forcastURL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const forcastRES = await axios.get(forcastURL);

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowSTR = tomorrow.toISOString().split("T")[0];
    const forcasts = forcastRES.data.list.filter((item) =>
      item.dt_txt.startsWith(tomorrowSTR)
    );
    let willRain = false;
    for (let forcast of forcasts) {
      for (let weather of forcast.weather) {
        if (weather.main.toLowerCase() === "rain") {
          willRain = true;
        }
      }
    }
    res.render("result", {
      city,
      rain: willRain,
      error: null,
    });
  } catch (err) {
    console.log(err.message);
    res.render("result", { city, rain: null, error: "an error occured" });
  }
});
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
