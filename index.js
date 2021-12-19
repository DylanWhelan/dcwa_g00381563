var express = require('express')
var MySQLhandler = require('./MySQLhandler')
var ejs = require ('ejs')
var bodyParser = require('body-parser')

var app = express()

const {body, validationResult, Result} = require('express-validator')

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/pages/homepage.html")
})

app.get('/listModules', (req, res) => {
    MySQLhandler.getModules()
    .then((result) => {
        res.send(result)
    })
    .catch((error) => {
        res.send(error)
    })

    console.log(req.path)
})

app.get('/listStudents', (req, res) => {
    res.redirect("/")
    console.log(req.path)
})

app.get('/listLecturers', (req, res) => {
    res.redirect("/")
    console.log(req.path)
})

app.listen(3000, () => {
    console.log("Listening on port 3000")
})