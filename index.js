var express = require('express')
var MySQLhandler = require('./MySQLhandler')
var ejs = require ('ejs')
var bodyParser = require('body-parser')

var app = express()

app.use(bodyParser.urlencoded({ extended: false}))

app.set('view engine', 'ejs')

const {body, validationResult, check} = require('express-validator')

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
})

app.get('/listModules/edit/:mid', (req, res) => {
    console.log(req.params.mid)
    MySQLhandler.getSpecificModule(req.params.mid)
    .then((result) => {
        //res.render('editModule', {module: result})
        res.send(result)
    })
    .catch((error) => {
        res.send(error)
    })
})

app.get('/listStudents', (req, res) => {
    MySQLhandler.getStudents()
    .then((result) => {
        res.render('showStudents', {students:result})
    })
    .catch((error) => {
        res.send(error)
    })
})

app.get('/listStudents/delete/:sid', (req, res) => {
    MySQLhandler.deleteStudent(req.params.sid)
    .then((result) => {
        res.redirect("/listStudents")
    })
    .catch((error) => {
        console.log(error.errno)
        if (error.errno == 1451) {
            res.render('deleteError', {student_id:req.params.sid})
        }
    })
})

app.get('/addStudent', (req, res) => {
    res.render('addStudent', {errors:undefined, mySqlError: undefined})
})

app.post('/addStudent', 
[check('student_id').isLength({min: 4, max:4}).withMessage("Please enter 4 character student ID"),
check('student_name').isLength({min:5}).withMessage("Student name must be a minimum of 5 characters"),
check('student_gpa').isFloat({min:0.0, max: 4.0}).withMessage("GPA should be between 0.0 and 4.0")],
(req, res) => {
    var errors = validationResult(req)
    console.log(errors)
    if (!errors.isEmpty()) {
        res.render('addStudent', {errors: errors.errors, mySqlError: undefined})
    }
    else {
        MySQLhandler.addStudent(req.body.student_id, req.body.student_name, req.body.student_gpa)
        .then((result) => {
            res.redirect("/listStudents")
        })
        .catch((error) => {
            console.log(error)
            res.render('addStudent', {errors: undefined, mySqlError: error.sqlMessage})
        })
    }
})

app.get('/listLecturers', (req, res) => {
    res.redirect("/")
})

app.listen(3000, () => {
    console.log("Listening on port 3000")
})