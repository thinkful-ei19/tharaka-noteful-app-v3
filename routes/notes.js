'use strict';

const express = require('express');
// Create an router instance (aka "mini-app")
// const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEM ========== */
router.get('/notes', (req, res, next) => {

  const { searchTerm } = req.query;
  let filter = {};

  // if (searchTerm) {
  //   const re = new RegExp(searchTerm, 'i');
  //   filter.title = { $regex: re };
  // }

  if (searchTerm) {
    filter.$text = { $search: searchTerm };
    console.log('filter word ' , filter);
  }

  Note.find(filter)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });

  // Note.find({}, (err, result)=> {
  //   if(err) {
  //     res.status(400).json(err); //replace this with something else 
  //   } else {
  //     res.json(result);
  //   }

  // });

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {

  console.log('reqq ', req.params.id);

  const { id } = req.params;

  Note.findById(id)
    .then(result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(next);


});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {

  const {title, content} = req.body;
  const newItem = {title, content};
  
  if(!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }


  Note.create(newItem)
    .then(result => {
      res.location(`${req.originalURL}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(next);


  // res.location('path/to/new/document').status(201).json({ id: 2 });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {

  const {title, content} = req.body;
  const {id} = req.params;
  const updateItem = {title, content};

  if(!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  Note.findByIdAndUpdate(id, updateItem, {new: true})
    .then( result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(next);
 
  // res.json({ id: 2 });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {

  const { id } = req.params.id;

  Note.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });

});

module.exports = router;