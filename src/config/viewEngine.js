import express from "express";

// var express = require('express'); => cách import express bằng cách cũ

let configViewEngine = (app) => {
    app.use(express.static("./src/public"))
    app.set("view engine", "ejs");    // jsp, blade for if else
    app.set("views", "./src/views")
}

module.exports = configViewEngine;