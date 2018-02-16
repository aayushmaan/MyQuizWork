var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var optionSchema = new Schema({
    Id : {
        type:Number
    },
    questionId: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    isAnswer: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

// create a schema
var questionSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    Id : {
        type:Number
    },
    QuestionTypeId:{
        type: Number
    },
    options: [optionSchema],
    points: {
        type:Number
    }
    }, {
    timestamps: true
});
// the schema is useless so far
// we need to create a model using it
var Questions = mongoose.model('Questions', questionSchema);
// make this available to our Node applications
module.exports = Questions;
