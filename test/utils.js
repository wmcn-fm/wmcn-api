var faker = require('faker');

var makeRandomUser = function makeRandomUser() {
  var user = {};
  user.first_name = faker.name.firstName();
  user.last_name = faker.name.lastName();
  // user.phone = faker.phone.phoneNumber();
  user.phone = 5039565794;
  user.email = faker.internet.email();
  user.hash = faker.internet.password();
  user.grad_year = faker.random.number(2018);
  user.mac_id = faker.random.number(999999999);
  user.iclass = faker.random.number(99999);
  user.created = new Date();
  return user;
}

var makeRandomShow = function makeRandomShow() {
  var show = {};
  show.title = faker.lorem.words().toString();
  show.timeslot = [faker.random.number(167)];
  show.blurb = faker.lorem.sentence();
  show.created = new Date();

  return show;
}

var makeRandomPlaylist = function makeRandomPlaylist() {
  var pl = {};
  pl.content = faker.lorem.paragraph();
  pl.created = new Date();

  return pl;
}

var makeRandomApp = function makeRandomApp() {
  var a = {};
  a.first_name = [];
  a.last_name = [];
  a.phone = [];
  a.email = [];
  a.grad_year = [];
  a.mac_id = [];
  a.iclass = [];
  a.created = new Date();
  a.title = faker.lorem.words().toString();
  a.timeslot = faker.random.number(167);
  a.blurb = faker.lorem.sentence();
  a.availability = [1, 2, 3, 4, 5, 101, 23, 45, 56, 89];
  a.timePref = 1;
  a.description = faker.lorem.sentences();

  for (var i=0; i<6; i++) {
    a.first_name.push(faker.name.firstName() );
    a.last_name.push(faker.name.lastName() );
    a.phone.push(faker.phone.phoneNumber() );
    a.email.push(faker.internet.email() );
    a.grad_year.push(faker.random.number(2018) );
    a.mac_id.push(faker.random.number(999999999) );
    a.iclass.push(faker.random.number(99999) );

    i++;
  }

  return a;
}

module.exports.makeRandomUser = makeRandomUser;
module.exports.makeRandomShow = makeRandomShow;
module.exports.makeRandomPlaylist = makeRandomPlaylist;
module.exports.makeRandomApp = makeRandomApp;