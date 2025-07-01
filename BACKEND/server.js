const express = require("express");
//const { connectToMongoDB } = require("./Connections/url");
//const urlRoute = require("./Routes/url");
const app = express();

const PORT = 8000;

// connectToMongoDB("mongodb://127.0.0.1:27017/short-url")
// .then(() => console.log("MongoDB Connected"))
// .catch(err => console.log("Mongo Error:", err));

//Middleware..Plugin
app.use(express.urlencoded({extended: false}));

//app.use("/url", urlRoute);


app.listen(PORT, () => console.log(`Serever Started at PORT:${PORT}`));