const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

const dbName = 'lecturersDB'
const collName = 'lecturers'

var lecturersDB
var lecturers

// The mongo local server is connected to here
MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((client) => {
        lecturersDB = client.db(dbName)
        lecturers = lecturersDB.collection(collName)
    })
    .catch((error) => {
        console.log(error)
    })

    // The documents from the lecturers table representing the lecturers are gathered here and passed in to the showLecturers page to populate the table
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

// Should all the validation in the index be passed, the add lecturer information will be passed in here to be inserted as a document,
// into the lecturer collection in the lecturerDB database
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