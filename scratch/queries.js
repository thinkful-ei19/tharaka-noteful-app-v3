
'use strict';

const mongoose = require('mongoose');
// mongoose.Promise = global.Promise;
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');


//Find searched Notes
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     // const searchTerm = 'lady gaga';
//     // let filter = {};

//     // if (searchTerm) {
//     //   const re = new RegExp(searchTerm, 'i');
//     //   filter.title = { $regex: re };
//     // }

//     return Note.find({$text: {$search: 'government' }})
//       .sort('created')
//       .then(results => {
//         console.log(results);
//       })

//       .catch(console.error);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => {
//         console.info('Disconnected');
//       });
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

  

//Find by ID
// mongoose.connect(MONGODB_URI)
//   .then(() => {

//     let documentId = '000000000000000000000003';
    
//     return Note.findById({_id: documentId })
//       .then(results => {
//         console.log(results);
//       })
//       .catch(console.error);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => {
//         console.info('Disconnected');
//       });
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });


//Update



  

