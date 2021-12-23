var express = require('express')
var MySQLDAO = require('./MySQLDAO')
var mongoDAO = require('./mongoDAO')
var ejs = require('ejs')
var bodyParser = require('body-parser')

var app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs')

const { body, validationResult, check } = require('express-validator')

// This gets the user the home page
app.get('/', (req, res) => {
    res.render('showHome')
})

// This method will display all contained modules
app.get('/listModules', (req, res) => {
    MySQLDAO.getModules()
        .then((result) => {
            res.render('showModules', { modules: result })
        })
        .catch((error) => {
            res.send(error)
        })
})

// This method will send the user the page to edit a modules information
app.get('/listModules/edit/:mid', (req, res) => {
    // This sql query is put in to ensure that the form is pre filled with relevant information
    MySQLDAO.getSpecificModule(req.params.mid)
        .then((result) => {
            let module = result[0]
            res.render('editModule', { module: module, errors: undefined })
        })
        .catch((error) => {
            res.send(error)
        })
})

// This is the post method for the update module
app.post('/listModules/edit/:mid',
    [check('module_name').isLength({ min: 5 }).withMessage("Module name must be a minimum of 5 characters"),
    check('module_credits').isIn([5, 10, 15]).withMessage("Credit values must be either 5, 10 or 15")],
    (req, res) => {
        // Results of the input validation
        var errors = validationResult(req)
        // If the errors is not empty then errors have occured and hence the user will be asked to fill in the form again
        if (!errors.isEmpty()) {
            // The sql query is needed again to pre-populate the form for the user.
            MySQLDAO.getSpecificModule(req.params.mid)
                .then((result) => {
                    let module = result[0]

                    // I convert the errors array to a basic string array to simplify the code in the ejs
                    arrayToPass = []
                    errors.errors.forEach((error) => arrayToPass.push(error.msg))

                    res.render('editModule', { module: module, errors: arrayToPass })
                })
                .catch((error) => {
                    res.send(error)
                })
        }
        // If the inputs were valid the module is updated
        else {
            MySQLDAO.updateModule(req.body.module_id, req.body.module_name, req.body.module_credits)
                .then((result) => {
                    res.redirect("/listModules")
                })
                .catch((error) => {
                    res.send(error)
                })
        }
    })

// Here is the method which lists the students associated with a module
app.get('/listModules/students/:mid', (req, res) => {
    MySQLDAO.getModuleStudents(req.params.mid)
    .then((result) => {
        // The result of the query is output to the user
        res.render('showModuleStudents', { students : result})
    })
    .catch((error) => {
        res.send(error)
    })
})

// This shows the showStudents page and populates with the sql query
app.get('/listStudents', (req, res) => {
    MySQLDAO.getStudents()
        .then((result) => {
            // The result is passed into to populate the dynamic table
            res.render('showStudents', { students: result })
        })
        .catch((error) => {
            res.send(error)
        })
})

// method to delete a student, student is is specified in :sid
app.get('/listStudents/delete/:sid', (req, res) => {
    // the delete query is called here with sid passed in
    MySQLDAO.deleteStudent(req.params.sid)
        .then((result) => {
            // Redirects to student list
            res.redirect("/listStudents")
        })
        .catch((error) => {
            // sends the user to error display page, mentioning reasoning and id of student
            res.render('deleteError', { student_id: req.params.sid })
        })
})

// This gives the user the addStudent view
app.get('/addStudent', (req, res) => {
    res.render('addStudent', { errors: undefined, mySqlError: undefined })
})


// This is the addStudent post method
app.post('/addStudent',
    [check('student_id').isLength({ min: 4, max: 4 }).withMessage("Please enter 4 character student ID"),
    check('student_name').isLength({ min: 5 }).withMessage("Student name must be a minimum of 5 characters"),
    check('student_gpa').isFloat({ min: 0.0, max: 4.0 }).withMessage("GPA should be between 0.0 and 4.0")],
    (req, res) => {
        // Should the information passed in by the user have failed any of the validation middleware checks, said errors shall be pushed to the array
        var errors = validationResult(req)
        if (!errors.isEmpty()) {
            // If there were errors detected, the addStudent view is sent back to the user with errors mentioned
            res.render('addStudent', { errors: errors.errors, mySqlError: undefined })
        }
        else {
            MySQLDAO.addStudent(req.body.student_id, req.body.student_name, req.body.student_gpa)
                .then((result) => {
                    // If the student was successfully added, the user is redirected to the listStudents view
                    res.redirect("/listStudents")
                })
                .catch((error) => {
                    // If there was an error with the sql, the user is sent back to the addStudent view, with errors being detailed on the page
                    res.render('addStudent', { errors: undefined, mySqlError: error.sqlMessage })
                })
        }
    })

// this is the method to list the lecturers
app.get('/listLecturers', (req, res) => {
    // The mongo query is passed in through here to get the lecturers
    mongoDAO.getLecturers()
        .then((documents) => {
            // The user is then sent the show lecturers page with the lecturers passed in
            res.render('showLecturers', { lecturers: documents })
        })
        .catch((error) => {
            res.send(error)
        })
})

// This is the method sent to use the user when they click go to add lecturers
app.get('/addLecturer', (req, res) => {
    res.render('addLecturer', { errors: undefined, deptError: undefined, mongoError: undefined })
})

// The add lecturer method, is enshrined within
app.post('/addLecturer',
    [check('lecturer_id').isLength({ min: 4, max: 4 }).withMessage("Lecturer ID must be 4 characters"),
    check('lecturer_name').isLength({ min: 5 }).withMessage("Lecturer name must be a minimum of 5 characters"),
    check('lecturer_dept').isLength({ min: 3, max: 3 }).withMessage("Department must be 3 characters")],
    (req, res) => {
        // the errors array works the same as for addStudents, same with the !errors.isEmpty
        var errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.render('addLecturer', { errors: errors.errors, deptError: undefined, mongoError: undefined })
        }
        else {
            MySQLDAO.getModules()
                .then((result) => {
                    var deptIsValid = false
                    // The dept entered by the user is compared to the module ids stored in the module table
                    result.forEach((module) => {
                        if (req.body.lecturer_dept == module.mid) {
                            deptIsValid = true;
                        }
                    })
                    // If there was no matching department found, the user is redirected to the addLecturers page again and warned that no such Department existed
                    if (deptIsValid == false) {
                        res.render('addLecturer', { errors: undefined, stringError: "Department does not exist" })
                    }
                    else {
                        mongoDAO.addLecturer(req.body.lecturer_id, req.body.lecturer_name, req.body.lecturer_dept)
                            .then((result) => {
                                // If there was no error with the mongo insert, the user is redirected to the listLecturers view to see the newly updated table
                                res.redirect("/listLecturers")
                            }).catch((error) => {
                                // If there was an error with a duplicate key, the user is sent back to the addLecturer view and is warned
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