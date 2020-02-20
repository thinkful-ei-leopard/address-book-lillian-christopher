'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const uuid = require('uuid/v4');

const { NODE_ENV } = require('./config');
const app = express();

const morganOption = (NODE_ENV === 'production') 
  ? 'tiny' 
  : 'common';

app.use(morgan(morganOption));
app.use(express.json());
app.use(cors());
app.use(helmet());

const addresses = [];

app.get('/address', (req, res) => {
  res.json(addresses);
});

app.post('/address', (req, res) => {
  const { 
    firstName,
    lastName,
    address1,
    address2='',
    city,
    state,
    zip
  } =req.body;

  if(!firstName) {
    return res
      .status(400)
      .send('First name required');
  }

  if(!lastName) {
    return res
      .status(400)
      .send('Last name required');
  }

  if(!address1) {
    return res
      .status(400)
      .send('Address required');
  }

  if(!city) {
    return res
      .status(400)
      .send('City required');
  }

  if(!state) {
    return res
      .status(400)
      .send('State required');
  }

  if(!zip) {
    return res
      .status(400)
      .send('Zip required');
  }

  if(state.length !== 2) {
    return res 
      .status(400)
      .send('Must be state abbreviation');
  }

  if(zip.length !== 5) {
    return res
      .status(400)
      .send('Zip must be 5 characters');
  }

  const id = uuid();
  const newAddress = {
    id,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip
  };

  addresses.push(newAddress);

  res
    .status(201)
    .location(`http://localhost:8000/address/${id}`)
    .json(newAddress);

});

app.delete('/address/:id', (req, res) => {
  const { addressId } = req.params;

  const index = addresses.findIndex( a => a.id === addressId);

  if (index === -1) {
    return res
      .status(404)
      .send('Address not found');
  }

  addresses.splice(index, 1);

  res
    .status(204)
    .end();

});

app.use(function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;