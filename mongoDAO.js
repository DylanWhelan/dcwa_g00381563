const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

const dbName = 'lecturersDB'
const collName = 'lecturers'

var lecturersDB
var lecturers

MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((client) => {
        lecturersDB = client.db(dbName)
        lecturers = lecturersDB.collection(collName)
    })
    .catch((error) => {
        console.log(error)
    })

var getLecturers = function() {
    return new Promise((resolve, reject) => {
        var cursor = lecturers.find()
        cursor.toArray()
        .then((documents) => {
            resolve(documents)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

var addLecturer = function(lecturer_id, lecturer_name, lecturer_dept) {
    return new Promise((resolve, reject) => {
        lecturers.insertOne({"_id": lecturer_id, "name": lecturer_name, "dept":lecturer_dept})
        .then((result) => {
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

module.exports = { getLecturers, addLecturer }