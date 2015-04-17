var pg = require('pg');
var sql = require('sql');


//	DB connection

var user = process.env.USER;
var pw = process.env.PW;
var db = 'wmcntest';
var conString = "postgres://" + user + ":" + pw + "@localhost/" + db;

// if (process.env.NODE_ENV === 'development') {
// 	db = 'wmcntest';
// } else {
// 	db = 'wmcn-production';
// }


//	Table definitions

var users = sql.define({
	name: 'users',
	columns: [
		{
			name: 'id',
			dataType: 'serial',
			primaryKey: true
		},
		{
			name: 'first_name',
			dataType: 'varchar(100)',
			notNull: true
		},
		{
			name: 'last_name',
			dataType: 'varchar(100)',
			notNull: true
		},
		{
			name: 'phone',
			dataType: 'int',
			notNull: true
		},
		{
			name: 'email',
			dataType: 'varchar(30)',
			notNull: true,
			unique: true
		},
		{
			name: 'grad_year',
			dataType: 'int'
		},
		{
			name: 'mac_id',
			dataType: 'int'
		},
		{
			name: 'iclass',
			dataType: 'int'
		},
		{
			name: 'created',
			dataType: 'timestamp',
			default: 'current_timestamp'
		},
		{
			name: 'hash',
			dataType: 'varchar(24)',
			notNull: true
		}
	]
});

var shows = sql.define({
	name: 'shows',
	columns: [
		{
			name: 'id',
			dataType: 'serial',
			unique: true,
			notNull: true
		},
		{
			name: 'title',
			dataType: 'varchar(80)',
			notNull: true
		},
		{
			name: 'timeslot',
			dataType: 'int[]',
			notNull: true
		},
		{
			name: 'blurb',
			dataType: 'varchar(160)',
			notNull: true
		},
		{
			name: 'created',
			dataType: 'date',
			notNull: true
		}
	]
});

var playlists = sql.define({
	name: 'playlists',
	columns: [
		{
			name: 'id',
			dataType: 'serial',
			unique: true
		},
		{
			name: 'content',
			dataType: 'varchar(240)',
		},
		{
			name: 'created',
			dataType: 'timestamp',
			default: 'current_timestamp'
		}
	]
});

var applications = sql.define({
	name: 'applications',
	columns: [
		{
			name: 'id',
			dataType: 'serial',
			unique: true,
			notNull: true
		},
		{
			name: 'first_name',
			dataType: 'varchar(100)[]',
			notNull: true
		},
		{
			name: 'last_name',
			dataType: 'varchar(100)[]',
			notNull: true
		},
		{
			name: 'phone',
			dataType: 'int[]',
			notNull: true
		},
		{
			name: 'email',
			dataType: 'varchar(30)[]',
			notNull: true,
		},
		{
			name: 'grad_year',
			dataType: 'int[]'
		},
		{
			name: 'mac_id',
			dataType: 'int[]'
		},
		{
			name: 'iclass',
			dataType: 'int[]'
		},
		{
			name: 'created',
			dataType: 'timestamp',
			default: 'current_timestamp'
		},
		{
			name: 'title',
			dataType: 'varchar(80)',
			notNull: true
		},
		{
			name: 'blurb',
			dataType: 'varchar(160)',
			notNull: true
		},
		{
			name: 'availability',
			dataType: 'int[]',
			notNull: true
		},
		{
			name: 'time_pref',
			dataType: 'int'
		},
		{
			name: 'description',
			dataType: 'varchar(80)'
		}
	]
});

var hosts = sql.define({
	name: 'hosts',
	columns: [
		{
			name: 'user_id',
			dataType: 'serial',
			notNull: true
		},
		{
			name: 'show_id',
			dataType: 'serial',
			notNull: true
		}
	]
});

var authors = sql.define({
	name: 'authors',
	columns: [
		{
			name: 'show_id',
			dataType: 'serial',
			notNull: true
		},
		{
			name: 'user_id',
			dataType: 'serial'
		},
		{
			name: 'playlist_id',
			dataType: 'serial',
			notNull: true
		}
	]
});


//	Query generation

var queries = [];

queries.push(users.create().toQuery().text);
queries.push(shows.create().toQuery().text);
queries.push(playlists.create().toQuery().text);
queries.push(applications.create().toQuery().text);
queries.push(hosts.create().toQuery().text);
queries.push(authors.create().toQuery().text);

// console.log(queries);


//	Table instantiation

// pg.connect(conString, function(err, client, done) {
// 	if (err) {
// 		return err;
// 	}

// 	for (q in queries) {
// 		client.query(q, function(err, result) {
// 			if (err) {
// 				return err;
// 			}

// 			done();
// 		});
// 	}

// 	client.end();
// });



/////////////////

module.exports = conString;