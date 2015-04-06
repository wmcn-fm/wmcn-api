var faker = require('faker');

var makeRandomUser = function makeRandomUser() {
  var fakeUser = {};
  fakeUser.id = faker.finance.mask();
  fakeUser.first_name = faker.name.firstName();
  fakeUser.last_name = faker.name.lastName();
  fakeUser.phone = faker.phone.phoneNumber();
  fakeUser.email = faker.internet.email();
  fakeUser.hash = faker.internet.password();
  fakeUser.grad_year = faker.finance.mask();
  fakeUser.mac_id = faker.random.number();
  fakeUser.iclass = faker.random.number();
  fakeUser.created = new Date();
  return fakeUser;
}

var makeRandomShow = function makeRandomShow() {
  var show = {};
  show.id = faker.finance.mask();
  show.title = faker.lorem.words();
  show.timeslot = faker.address.streetAddress();
  show.blurb = faker.lorem.sentence();
  show.created = new Date();

  return show;
}

var makeRandomPlaylist = function makeRandomPlaylist() {
  var pl = {};
  pl.id = faker.finance.mask();
  pl.content = faker.lorem.paragraph();
  pl.created = new Date();

  return pl;
}

module.exports.makeRandomUser = makeRandomUser;
module.exports.makeRandomShow = makeRandomShow;
module.exports.makeRandomPlaylist = makeRandomPlaylist;