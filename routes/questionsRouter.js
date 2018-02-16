var express = require('express');
var bodyParser = require('body-parser');

//Mongoose added
var mongoose = require('mongoose');
var Questions = require('../models/questions');

var Verify = require('./verify');

var questionsRouter = express.Router();
questionsRouter.use(bodyParser.json());

questionsRouter.route('/')
    .get(function (req, res, next) {
    console.log("getrouter", req.query);
    Questions.find({})
        .exec(function (err, question) {
        if (err) next(err);
        res.json(question);
    });
})

    .post(Verify.verifyOrdinaryUser, function (req, res, next) {
    console.log("got it");
    Questions.create(req.body, function (err, question) {
        if (err) next(err);
        console.log('Question created!');
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        res.end('Added the dish with id: ');
    });
})
    
    .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Questions.remove({}, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

questionsRouter.route('/:questionId')
    .get(function (req, res, next) {
    Questions.findById(req.params.questionId)
        .populate()
        .exec(function (err, question) {
        if (err) next(err);
        res.json(question);
    });
})

    .put(Verify.verifyOrdinaryUser, function (req, res, next) {
    console.log("req.body");
    Questions.findByIdAndUpdate(req.params.questionId, {
        $set: req.body
    }, {
        new: true
    }, function (err, question) {
        if (err) next(err);
        res.json(question);
    });
})

    .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Questions.findByIdAndRemove(req.params.questionId, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});


module.exports = questionsRouter;