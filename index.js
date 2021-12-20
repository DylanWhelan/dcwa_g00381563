var express = require('express')
var MySQLDAO = require('./MySQLDAO')
var mongoDAO = require('./mongoDAO')
var ejs = require('ejs')
var bodyParser = require('body-parser')

var app = express()

app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'ejs')

const { body, validationResult, check } = require('express-validator')

app.get('/', (req, res) => {
    res.render('showHome')
})

app.get('/listModules', (req, res) => {
    MySQLDAO.getModules()
        .then((result) => {
            res.render('showModules', { modules: result })
        })
        .catch((error) => {
            res.send(error)
        })
})

app.get('/listModules/edit/:mid', (req, res) => {
    MySQLDAO.getSpecificModule(req.params.mid)
        .then((result) => {
            let module = result[0]
            res.render('editModule', { module: module, errors: undefined })
        })
        .catch((error) => {
            res.send(error)
        })
})

app.post('/listModules/edit/',
    [check('module_name').isLength({ min: 5 }).withMessage("Module name must be a minimum of 5 characters"),
    check('module_credits').isInt().isIn([5, 10, 15]).withMessage("GPA should be between 0.0 and 4.0")],
    (req, res) => {
        var errors = validationResult(req)
        if (!errors.isEmpty()) {
        }
        else {
            MySQLD.updateModule(req.body.module_id, req.body.module_name, req.body.module_credits)
                .then((result) => {
                    res.redirect("/listModules")
                })
                .catch((error) => {
                    console.log(error)
                    res.render('addStudent', { errors: undefined, mySqlError: error.sqlMessage })
                })
        }
    })

app.get('/listStudents', (req, res) => {
    MySQLDAO.getStudents()
        .then((result) => {
            res.render('showStudents', { students: result })
        })
        .catch((error) => {
            res.send(error)
        })
})

app.get('/listStudents/delete/:sid', (req, res) => {
    MySQLDAO.deleteStudent(req.params.sid)
        .then((result) => {
            res.redirect("/listStudents")
        })
        .catch((error) => {
            console.log(error.errno)
            if (error.errno == 1451) {
                res.render('deleteError', { student_id: req.params.sid })
            }
        })
})

app.get('/addStudent', (req, res) => {
    res.render('addStudent', { errors: undefined, mySqlError: undefined })
})

app.post('/addStudent',
    [check('student_id').isLength({ min: 4, max: 4 }).withMessage("Please enter 4 character student ID"),
    check('student_name').isLength({ min: 5 }).withMessage("Student name must be a minimum of 5 characters"),
    check('student_gpa').isFloat({ min: 0.0, max: 4.0 }).withMessage("GPA should be between 0.0 and 4.0")],
    (req, res) => {
        var errors = validationResult(req)
        console.log(errors)
        if (!errors.isEmpty()) {
            res.render('addStudent', { errors: errors.errors, mySqlError: undefined })
        }
        else {
            MySQLDAO.addStudent(req.body.student_id, req.body.student_name, req.body.student_gpa)
                .then((result) => {
                    res.redirect("/listStudents")
                })
                .catch((error) => {
                    console.log(error)
                    res.render('addStudent', { errors: undefined, mySqlError: error.sqlMessage })
                })
        }
    })

app.get('/listLecturers', (req, res) => {
    mongoDAO.getLecturers()
        .then((documents) => {
            res.render('showLecturers', { lecturers: documents })
        })
        .catch((error) => {
            res.send(error)
        })
})

app.get('/addLecturer', (req, res) => {
    res.render('addLecturer', { errors: undefined, deptError: undefined, mongoError: undefined })
})

app.post('/addLecturer',
    [check('lecturer_id').isLength({ min: 4, max: 4 }).withMessage("Lecturer ID must be 4 characters"),
    check('lecturer_name').isLength({ min: 5 }).withMessage("Lecturer name must be a minimum of 5 characters"),
    check('lecturer_dept').isLength({ min: 3, max: 3 }).withMessage("Department must be 3 characters")],
    (req, res) => {
        var errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.render('addLecturer', { errors: errors.errors, deptError: undefined, mongoError: undefined })
        }
        else {
            MySQLDAO.getModules()
                .then((result) => {
                    var deptIsValid = false
                    result.forEach((module) => {
                        if (req.body.lecturer_dept == module.mid) {
                            deptIsValid = true;
                        }
                    })
                    if (deptIsValid == false) {
                        res.render('addLecturer', { errors: undefined, stringError: "Department does not exist" })
                    }
                    else {
                        mongoDAO.addLecturer(req.body.lecturer_id, req.body.lecturer_name, req.body.lecturer_dept)
                            .then((result) => {
                                res.redirect("/listLecturers")
                            }).catch((error) => {
                                res.render('addLecturer', { errors: undefined, stringError: "duplicate of already existing lecturer id" })
                            })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    })

app.listen(3000, () => {
    console.log("Listening on port 3000")
})