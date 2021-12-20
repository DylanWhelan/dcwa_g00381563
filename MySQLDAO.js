const res = require('express/lib/response')
var mysql = require('promise-mysql')

var pool

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

module.exports = { getModules, getSpecificModule, updateModule, getStudents, addStudent, deleteStudent}
