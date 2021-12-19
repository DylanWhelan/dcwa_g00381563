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

var deleteStudent = function(student_id) {
    console.log(student_id)
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

module.exports = { getModules, getStudents, deleteStudent}
