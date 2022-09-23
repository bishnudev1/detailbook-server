const mongoose = require('mongoose');

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;

const storySchema = new mongoose.Schema({
    title: {
        required:true,
        type: String
    },
    desc: {
        required:true,
        type:String,
    },
    name: {
        type: String,
        required:true
    },
    date: {
        default: today,
        type: String
    }
});


const Stories = new mongoose.model('stories',storySchema);

module.exports = Stories;