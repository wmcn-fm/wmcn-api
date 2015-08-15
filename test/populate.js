#!/usr/bin/env node

var superagent = require('superagent');
var config = require('../config/config')();
var root = config.api_root_url;
var fake = require('./fake');

//  create superuser
var token;
var will = {
  'first_name': 'Will',
  'last_name': 'Kent-Daggett',
  'phone': '5555555555',
  'email': 'willkentdaggett@gmail.com',
  'grad_year': 2015,
  'mac_id': '123456789',
  'iclass': '12345'
};

superagent.get(root + '/authenticate/dev')
.end(function(e, res) {
  if (e) return console.log(e);
  if (res.statusCode === 500 && res.body.error === 'unavailable in production mode') {
    return console.log('authenticate/dev is only available in development mode');
  }
  token = res.body.token;
  console.log(token);

  superagent.post(root + '/users')
  .send({user: will})
  .end(function(e, res) {
    if (e) return console.log(e);
    if (res.statusCode === 403) {
      superagent.get(root + '/users?email=' + will.email)
      .set('x-access-token', token)
      .end(function(e, res) {
        will = res.body.user;
      })
    } else {
      will = res.body.new_user;
    }

    console.log(will);
  })  //  end POST users
})  //  end get auth/dev
