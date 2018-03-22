'use strict';


const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/note');
const seedNotes = require('../db/seed/notes');
const expect = chai.expect;

chai.use(chaiHttp);


describe('Notes API resource', function(){

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI);
  });
    

  beforeEach(function () {
    return Note.insertMany(seedNotes)
      .then(() => Note.createIndexes());
  });
    
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
    
  after(function () {
    return mongoose.disconnect();
  });



  describe('GET /api/notes', function () {
    it('should return the correct number of Notes', function () {
      // 1) Call the database and the API
      const dbPromise = Note.find();
      const apiPromise = chai.request(app).get('/api/notes');
      // 2) Wait for both promises to resolve using `Promise.all`
      return Promise.all([dbPromise, apiPromise])
      // 3) **then** compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should give a error of 400 if asked using wrong path', function() {

      const apiPromise = chai.request(app).get('/apid/notes');

      return apiPromise
        // .catch(err => err.response)
        .then(res => { 
          expect(res).to.have.status(404);
        })
        .catch(err => err.response);//Position of this doesn't matter
    }); 

  });


  describe('GET /api/notes/:id', function () {
    it('should return correct notes', function () {
      let data;
      // 1) First, call the database
      return Note.findOne().select('id title content')
        .then(_data => {
          data = _data;
          // 2) **then** call the API
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          // console.log('resssbodyy' , res.body.created);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'created');

          // 3) **then** compare
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });

    it('will return incorrect note', function () {
      // 1) First, call the database
      let resId, resTitle, resContent;
      return Note.findOne().select('id title content')
        .then(res => {
          //console.log(res.id + 1);
          // console.log('Note ID', Note.noteId);
          // console.log('noteId ', noteId);
          resId = res.id;
          resTitle = res.title;
          resContent = res.content;
          //console.log('Res INFO ', resId, resTitle, resContent);
          
          return Note.find({_id:'000000000000000000000001'})
            .then(res => {
              //console.log('Res2 INFO ', res.id, res.title, res.content);
              expect(res.id).to.not.equal(resId);
              expect(res.title).to.not.equal(resTitle);
              expect(res.content).to.not.equal(resContent);
            });
        });

    });
  });


  describe('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
        'tags': []
      };
      let body;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.include.keys('id', 'title', 'content');
          // 2) **then** call the database
          return Note.findById(body.id);
        })
        // 3) **then** compare
        .then(data => {
          expect(body.title).to.equal(data.title);
          expect(body.content).to.equal(data.content);
        });
    });

    it('should give an error when creating an invalid item', function() {
      const newItem = {'foo': 'bar'};

      let dbLen; 

      return Note.find()
        .then(res => {
          dbLen = res.length;
          return chai.request(app).post('/api/notes').send(newItem);
        })
        .catch(err => err.response)
        .then(res => {
          console.log('This is the message', res.body.message);
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body.message).to.equal('Missing `title` in request body')
          return Note.find();
        })
        .then(data => {
          expect(data.length).to.be.equal(dbLen);
        });
    });
  });




  describe('PUT endpoint', function() {

    it('should update fields you send over', function() {
      const updateData = {
        title: 'fofofofofofofof',
        content: 'futuristic fusion'
      };

      return Note.findOne()
        .then(note => {
          updateData.id = note.id;

          return chai.request(app).put(`/api/notes/${note.id}`).send(updateData);
        })
        .then(res => {
          console.log('this is the status', res.status);
          expect(res).to.have.status(200);

          return Note.findById(updateData.id);
        })
        .then(note => {
          expect(note.title).to.equal(updateData.title);
          expect(note.content).to.equal(updateData.content);
        });
    });

    it('should not allow you to update without the valid object structure', function() {
      const updateData = {
        'foo': 'bar'
      };

      let updateItemId, originalBody;

      return Note.findOne()
        .then(note => {
          updateItemId = note.id;
          originalBody = note;

          return chai.request(app).put(`/api/notes/${note.id}`).send(updateData);
        })
        .catch(err => err.response)
        .then(res => {
          console.log('error status code', res.status);
          expect(res).to.have.status(400);
          return Note.findById(updateItemId);
        })
        .then(res => {
          expect(res.title).to.equal(originalBody.title);
          expect(res.content).to.equal(originalBody.content);
        });

    });

  });

  describe('DELETE endpoint', function() {

    it('delete a note by id', function() {

      let note;

      return Note.findOne()
        .then(res => {
          note = res;
          // console.log('note ID', note.id);

          return chai.request(app).delete(`/api/notes/${note.id}`);
        })
        
        .then(res => {
          // console.log('answer', res);
          expect(res).to.have.status(204);
        });

    });
  });

});

