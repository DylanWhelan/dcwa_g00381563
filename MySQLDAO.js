const res = require('express/lib/response')
var mysql = require('promise-mysql')

var pool

// The mysql local server is connected to here and the connection pool is created
mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'collegeDB'
})
    .then((result) => {
        pool = result
    })
    .catch((error) => {
        console.log(error)
    })

// All the modules are grabbed from the modules table here to be shown in the show modules table
var getModules = function () {
    return new Promise((resolve, reject) => {
        pool.query('select * from module')
        .then((result) => {
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

// Here a specific module chosen by module_id is returned, to be used in the edit module page
var getSpecificModule = function (module_id) {
    return new Promise((resolve, reject)=> {
        var myQuery = {
            sql: 'select * from module where mid = ?',
            values: [module_id]
        }
        pool.query(myQuery)
        .then((result) => {
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

// Here the update query for the module is stored, to be carried out should all validation criteria be satisfied
var updateModule = function (module_id, module_name, module_credits) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'update module set name = ?, credits = ? where mid = ?',
            values: [module_name, module_credits, module_id]
        }
        pool.query(myQuery)
        .then((result) => {
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

// This is the only sql query in the app that draws from two tables, matching the student idea from the student_module table to the students in the student table
var getModuleStudents = function (module_id) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'select s.sid, s.name, s.gpa, sm.mid from student s left join student_module sm on s.sid = sm.sid where sm.mid = ?',
            values: [module_id]
        }
        pool.query(myQuery)
        .then((result) => {
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

// Here the students are gathered from the student table and passed out to populate the showStudents page
var getStudents = function () {
    return new Promise((resolve, reject) => {
        pool.query('select * from student')
        .then((result) => {
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

// Should the addStudent criteria be satisfied the information is passed here to an insert query, to be added to the student table
var addStudent  = function(student_id, student_Name, student_GPA) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'insert into student values (?, ?, ?)',
            values: [student_id, student_Name, student_GPA]
        }
        pool.query(myQuery)
        .then((result) => {
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

// Should the delete link be clicked for a student, this query shall be passed in, and should they have no associated modules they shall be removed from the table
// Otherwise they shall remain and the user shall be warned that they have associated modules
var deleteStudent = function(student_id) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'delete from student where sid = ?',
            values: [student_id]
        }   
        pool.query(myQuery)
        .then((result) => {
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

module.exports = { getModules, getSpecificModule, getModuleStudents, updateModule, getStudents, addStudent, deleteStudent}
