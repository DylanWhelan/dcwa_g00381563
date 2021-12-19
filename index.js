var express = require('express')
var MySQLhandler = require('./MySQLhandler')
var ejs = require ('ejs')
var bodyParser = require('body-parser')

var app = express()

app.set('view engine', 'ejs')

const {body, validationResult, Result} = require('express-validator')

app.get('/', (req, res) => {
    res.render('showHome')
})

app.get('/listModules', (req, res) => {
    MySQLhandler.getModules()
    .then((result) => {
        res.render('showModules', {modules:result})
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