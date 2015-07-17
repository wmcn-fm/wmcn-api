var faker = require('faker');
var fake = {};

fake.makeRandomUser = function makeRandomUser() {
  var user = {};
  user.first_name = faker.name.firstName();
  user.last_name = faker.name.lastName();
  user.phone = fake.getRandomInt(100000000000000, 999999999999999).toString();
  user.email = faker.internet.email();
  user.hash = faker.internet.password();
  user.grad_year = fake.getRandomInt(1950, 2018);
  user.mac_id = fake.getRandomInt(100000000, 999999999);
  user.iclass = fake.getRandomInt(10000, 99999);
  return user;
}

fake.makeRandomShow = function makeRandomShow() {

  var show = {};
  show.title = faker.lorem.words().toString();
  show.blurb = '';
  for (var i=0; i<fake.getRandomInt(2, 8); i++) {
    show.blurb += faker.lorem.sentence();
  }

  return show;
}

fake.makeRandomScheduleRow = function makeRandomScheduleRow() {
  var rel = {};
  rel.timeslot = fake.getRandomInt(0, 167);
  rel.show_id = null;

  return rel;
}

fake.makeRandomPlaylist = function makeRandomPlaylist() {
  var pl = {};
  pl.content = '';
  pl.show_id = null;

  for (var i=0; i<fake.getRandomInt(2, 8); i++) {
    pl.content += faker.lorem.paragraph();
  }

  return pl;
}

fake.makeRandomApp = function makeRandomApp() {
  var a = {};
  a.first_name = [];
  a.last_name = [];
  a.phone = [];
  a.email = [];
  a.grad_year = [];
  a.mac_id = [];
  a.iclass = [];
  a.title = faker.lorem.words().toString();
  a.blurb = faker.lorem.sentence();
  a.availability = [];
  a.time_pref = 1;
  a.description = faker.lorem.sentences();

  for (var i=0; i<fake.getRandomInt(2, 30); i++) {
    a.availability.push(fake.getRandomInt(0, 167));
  }

  for (var i=0; i<fake.getRandomInt(1, 4); i++) {
    a.first_name.push(faker.name.firstName() );
    a.last_name.push(faker.name.lastName() );
    a.phone.push(fake.getRandomInt(100000000000000, 999999999999999).toString());
    a.email.push(faker.internet.email() );
    a.grad_year.push(fake.getRandomInt(1950, 2018));
    a.mac_id.push(fake.getRandomInt(100000000, 999999999) );
    a.iclass.push(fake.getRandomInt(10000, 99999));
  }

  return a;
}

fake.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = fake;
