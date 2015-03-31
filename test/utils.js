var faker = require('faker');

// var makeRandomStatus = function makeRandomStatus() {
//   var fakeStatus = {};
//   fakeStatus.id = faker.finance.mask();
//   fakeStatus.owner = faker.finance.mask();
//   fakeStatus.latitude = faker.address.latitude();
//   fakeStatus.longitude = faker.address.longitude();
//   fakeStatus.time = faker.random.number(60);
//   return fakeStatus;
// }

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

module.exports.makeRandomUser = makeRandomUser;
// module.exports.makeRandomStatus = makeRandomStatus;