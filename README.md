# wmcn-api
RESTful API server for [WMCN](http://wmcn.fm)

## Setup

###Install

```shell
$ git clone https://github.com/wmcn-fm/wmcn-api.git
$ cd wmcn-api/
$ npm install
```

###Configure
Development/production  settings are accessible at `config/settings.json`, and configured in
`config/config.js` depending on the node environment.

In dev mode, set up the database locally:

```
$ postgres /usr/local/var/postgres
$ createdb wmcn_test	# in a new window
$ node lib/setTables.js
```

`dropdb wmcn_test` clears the database (remember to set up the tables again too!)

###Run

```
$ DEBUG=wmcn-api NODE_ENV=development USER=username PW=devpw npm start
	# app runs on localhost:3001 w/ nodemon, prints full error stack, 
	# uses local postgres instance

$ sudo NODE_ENV=production USER=username PW=productionpw npm start
	# app runs on localhost:81, using remote production db
```

## v0.1 documentation

###Routes

- [`/users`](#users)
	- [`/:id`](#users-id)
		- [`/shows`](#users-shows)
			- [`/current`](#users-shows-current)
		- [`/articles`](#users-articles)
- [`/shows`](#shows)
	- [`/:id`](#shows-id)
		- [`/hosts`](#shows-hosts)
		- [`/playlists`](#shows-playlists)
- [`/playlists`](#pl)
	- [`/:id`](#pl-id)
	- [`?limit`](#pl-limit)
- [`/schedule`](#schedule)
	- [`/:timeslot`](#schedule-ts)
	- [`/current`](#schedule-current)
- [`/applications`](#applications)
- [`/hosts`](#hosts)
- [`/articles`](#articles)

####Users
##### <a name="users">`/users`</a>

- **Method**: `GET`
	- **Description**: get all users in the table
	- **Request params**: *none*
	- **Request body**: *none*
	- **Request queries**:
		- **optional**: `email`: user email address
		- **example**: `http://api.wmcn.fm/v0/users?email=wmcn@macalester.edu`
	- **Response**:
		- **Success**:
			- **Status code**: `200`
			- **Response body**: `{users: [...]}`
			- **Description**: An array of user rows
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: "user <email> doesn't exist"}` [if using email query]

- **Method**: `POST`
	- **Description**: add one user to the table
	- **Request params**: *none*
	- **Request body**: `user` object containing:
		- **required**:
			- `first_name` (string), `last_name` (string),
			- `phone` (string), `email` (unique string), `hash` (string [hashed pw])
		- **optional**:
			- `grad_year` (int), `mac_id` (int), `iclass` (int), 
	- **Response**:
		- **Success**: 
			- **Status code**: `201`
			- **Response body**: `{"result":"1 user created."}`
		- **Error**:
			- **Status code**: `403`
			- **Response body**: `{error: user <email> already exists}`

- **Method**: `PUT`
	- **NOTE**: in development; see [issue #2](https://github.com/wmcn-fm/wmcn-api/issues/2)

- **Method**: `DELETE`
	- **Description**: delete all users in the database
	- **Request params**: *none*
	- **Request body**: *none*
	- **Response**: 
		- **Success**:
			- **Status code**: `204`
			- **Response body**: `{result: "<number> users deleted."}`
		- **Error**:
			- **Status code**: `500`
			- **Response body**: `{error: "..."}`

##### <a name="users-id">`/users/:id`</a>

- **Method**: `GET`
	- **Description**: get one user
	- **Request params**: `id`: user id number
	- **Request body**: *none*
	- **Response**:
		- **Success**: 
			- **Status code**: `200`
			- **Response body**: `{user: ...}`
			- **Description**: one user row, in JSON form
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: "user <id> doesn't exist"}`

- **Method**: `PUT`
	- **NOTE**: in development; see issue [#2](https://github.com/wmcn-fm/wmcn-api/issues/2)

- **Method**: `DELETE`
	- **Description**: delete one user
	- **Request params**: `id`: user id number
	- **Request body**: *none*
	- **Response**:
		- **Success**: 
			- **Status code**: `204`
			- **Response body**: `{result: "1 user deleted."}`
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: user <id> doesn't exist}`

##### <a name="users-shows">`/users/:id/shows`</a>

- **Method**: `GET`
	- **Description**: get all shows a given user has hosted
	- **Request params**: `id`: user id
	- **Request body**: *none*
	- **Response**:
		- **Success**: 
			- **Status code**: `200`
			- **Response body**: `{shows: [...]}`
			- **Description**: JSON object `shows`, an array of show rows
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: user <id> doesn't exist.}`

##### <a name="users-shows-current">`/users/:id/shows/current`</a>

- **Method**: `GET`
	- **Description**: get current shows a user hosts
	- **Request params**: `id`: user id
	- **Request body**: *none*
	- **Response**:
		- **Success**: 
			- **Status code**: `200`
			- **Response body**: `{shows: [...]}`
			- **Description**: JSON object `shows`, an array of show rows
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: user <id> doesn't have any current shows.}`
			- **NOTE**: improper error handling; see [issue #6](https://github.com/wmcn-fm/wmcn-api/issues/6)

##### <a name="users-articles">`/users/:id/articles`</a>

- **Method**: `GET`
	- **NOTE**: in development. see [issue 7](https://github.com/wmcn-fm/wmcn-api/issues/7)
	- **Description**: get a list of articles written by the user


####Shows

##### <a name="shows">`/shows`</a>

- **Method**: `GET`
	- **Description**: get all shows in the table
	- **Request params**: *none*
	- **Request body**: *none*
	- **Response**:
		- **Success**:
			- **Status code**: `200`
			- **Response body**: `{shows: [...]}`
			- **Description**: An array of show rows
		- **Error**:
			- **Status code**: `500`
			- **Response body**: `{error: "..."}`

- **Method**: `POST`
	- **Description**: add one show to the table
	- **Request params**: *none*
	- **Request body**: `show` object containing:
		- **required**:
			- `title` (string), `blurb` (string), `timeslot` (int array)
	- **Response**:
		- **Success**: 
			- **Status code**: `201`
			- **Response body**: `{"result":"1 show created."}`
		- **Error**:
			- **Status code**: `403`
			- **Response body**: `{error: show <title> already exists}`
			- **NOTE**: improper error handling (doesn't check to make sure show exists) - see [issue 8](https://github.com/wmcn-fm/wmcn-api/issues/8)

- **Method**: `PUT`
	- **NOTE**: in development; see [issue #2](https://github.com/wmcn-fm/wmcn-api/issues/2)

- **Method**: `DELETE`
	- **Description**: delete all shows in the database
	- **Request params**: *none*
	- **Request body**: *none*
	- **Response**: 
		- **Success**:
			- **Status code**: `204`
			- **Response body**: `{result: "<number> shows deleted."}`
		- **Error**:
			- **Status code**: `500`
			- **Response body**: `{error: "..."}`

##### <a name="shows-id">`/shows/:id`</a>

- **Method**: `GET`
	- **Description**: get one show
	- **Request params**: `id`: show id number
	- **Request body**: *none*
	- **Response**:
		- **Success**: 
			- **Status code**: `200`
			- **Response body**: `{show: ...}`
			- **Description**: one show row, in JSON form
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: "show <id> doesn't exist"}`

- **Method**: `PUT`
	- **NOTE**: in development; see issue [#2](https://github.com/wmcn-fm/wmcn-api/issues/2)

- **Method**: `DELETE`
	- **Description**: delete one show
	- **Request params**: `id`: show id number
	- **Request body**: *none*
	- **Response**:
		- **Success**: 
			- **Status code**: `204`
			- **Response body**: `{result: "1 show deleted."}`
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: show <id> doesn't exist}`

##### <a name="shows-hosts">`/shows/:id/hosts`</a>

- **Method**: `GET`
	- **Description**: Get user documents for the show's hosts
	- **Request params**: `id`: show id
	- **Request body**: *None*
	- **Response**:
		- **Success**: 
			- **Status code**: `200`
			- **Response body**: `{users: [...]}`
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: show <id> doesn't exist.}`
			- **NOTE**: improper error handling; see [issue 6](https://github.com/wmcn-fm/wmcn-api/issues/6)

##### <a name="shows-playlists">`/shows/:id/playlists`</a>
- **Method**: `GET`
	- **Description**: Get all playlists associated with a given show
	- **Request params**: `id`: show id
	- **Request body**: *None*
	- **Request queries**:
		- **optional**: `limit`: int
		- **example**: `http://api.wmcn.fm/v0/users?limit=5`
	- **Response**:
		- **Success**: 
			- **Status code**: `200`
			- **Response body**: `{playlists: [...]}`
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: show <id> doesn't exist.}`
			- **NOTE**: improper error handling; see [issue 6](https://github.com/wmcn-fm/wmcn-api/issues/6)


####Playlists

##### <a name="pl">`/playlists`</a>
- **Method**: `GET`
	- **Description**: get all playlists in the table
	- **Request params**: *none*
	- **Request body**: *none*
	- **Response**:
		- **Success**:
			- **Status code**: `200`
			- **Response body**: `{playlists: [...]}`
			- **Description**: An array of playlist rows
		- **Error**:
			- **Status code**: `500`
			- **Response body**: `{error: "..."}`

- **Method**: `POST`
	- **Description**: add one playlist to the table
	- **Request params**: *none*
	- **Request body**: `playlist` object containing:
		- **required**:
			- `show_id` (int, valid show ID), `content` (string)
	- **Response**:
		- **Success**: 
			- **Status code**: `201`
			- **Response body**: `{"result":"1 playlist created."}`
		- **Error**:
			- **Status code**: `500`
			- **Response body**: `{error: '...''}`

- **Method**: `PUT`
	- **NOTE**: in development; see [issue #2](https://github.com/wmcn-fm/wmcn-api/issues/2)

- **Method**: `DELETE`
	- **Description**: delete all playlists in the database
	- **Request params**: *none*
	- **Request body**: *none*
	- **Response**: 
		- **Success**:
			- **Status code**: `204`
			- **Response body**: `{result: "<number> playlists deleted."}`
		- **Error**:
			- **Status code**: `500`
			- **Response body**: `{error: "..."}`

##### <a name="pl-id">`/playlists/:id`</a>

- **Method**: `GET`
	- **Description**: get one playlist
	- **Request params**: `id`: playlist id number
	- **Request body**: *none*
	- **Response**:
		- **Success**: 
			- **Status code**: `200`
			- **Response body**: `{playlist: ...}`
			- **Description**: one playlist row, in JSON form
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: "playlist <id> doesn't exist"}`

- **Method**: `PUT`
	- **NOTE**: in development; see issue [#2](https://github.com/wmcn-fm/wmcn-api/issues/2)

- **Method**: `DELETE`
	- **Description**: delete one playlist
	- **Request params**: `id`: playlist id number
	- **Request body**: *none*
	- **Response**:
		- **Success**: 
			- **Status code**: `204`
			- **Response body**: `{result: "1 playlist deleted."}`
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: playlist <id> doesn't exist}`

##### <a name="pl-limit">`/playlists/?limit`</a>
- **Method**: `GET`
	- **Description**: get a particular number of playlists
	- **Request params**: `limit`: integer
	- **Request body**: *none*
	- **Response**:
		- **Success**: 
			- **Status code**: `200`
			- **Response body**: `{playlists: [...]}`
		- **Error**:
			- **Status code**: `500`
			- **Response body**: {error: '...'}

####Schedule
##### <a name="schedule">`/schedule`</a>
- **Method**: `GET`
	- **Description**: get all current shows
	- **Request params**: *none*
	- **Request body**: *none*
	- **Response**:
		- **Success**:
			- **Status code**: `200`
			- **Response body**: `{shows: [...]}`
			- **Description**: An array of show rows
		- **Error**:
			- **Status code**: `500`
			- **Response body**: `{error: "..."}`

- **Method**: `POST`
	- **Description**: add one show to the schedule
	- **Request params**: *none*
	- **Request body**: `show` object containing:
		- **required**:
			- `timeslot`: int, range 0-167; `show_id`: valid show id number
	- **Response**:
		- **Success**: 
			- **Status code**: `201`
			- **Response body**: `{"result":"1 show added to the schedule."}`
		- **Error**:
			- **Status code**: `500`
			- **Response body**: `{error: '...'}`

- **Method**: `DELETE`
	- **Description**: delete the schedule
	- **Request params**: *none*
	- **Request body**: *none*
	- **Response**: 
		- **Success**:
			- **Status code**: `204`
			- **Response body**: `{result: "<number> schedule relations deleted."}`
		- **Error**:
			- **Status code**: `500`
			- **Response body**: `{error: "..."}`

##### <a name="schedule-ts">`/schedule/:timeslot`</a>
- **Method**: `GET`
	- **Description**: get the show at a given time
	- **Request params**: `timeslot`: int, range 0-167
	- **Request body**: *none*
	- **Response**:
		- **Success**: 
			- **Status code**: `200`
			- **Response body**: `{show: ...}`
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: No show exists at hour <timeslot>}`

- **Method**: `DELETE`
	- **Description**: delete the relationship between a show and a timeslot
	- **Request params**: `timeslot`: int, range 0-167
	- **Request body**: *none*
	- **Response**:
		- **Success**: 
			- **Status code**: `200`
			- **Response body**: `{"result": "cleared spot <timeslot>"}`
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: No show exists at hour <timeslot>}`

##### <a name="schedule-current">`/schedule/:current`</a>
- **NOTE**: in development; see [issue #16](https://github.com/wmcn-fm/wmcn-api/issues/16)
- **Method**: `GET`
	- **Description**: get the currently playing show
	- **Request params**: *none*
	- **Request body**: *none*
	- **Response**:
		- **Success**: 
			- **Status code**: `200`
			- **Response body**: `{show: ...}`
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: No show playing right now.}`


####Applications
##### <a name="applications">`/applications`</a>

- **Method**: `GET`
	- **Description**: get all applications in the table
	- **Request params**: *none*
	- **Request body**: *none*
	- **Response**:
		- **Success**:
			- **Status code**: `200`
			- **Response body**: `{applications: [...]}`
			- **Description**: An array of application rows
		- **Error**:
			- **Status code**: `404`
			- **Response body**: `{error: "no pending applications"}`

- **Method**: `POST`
	- **Description**: add one application to the table
	- **Request params**: *none*
	- **Request body**: `application` object containing:
		- **required**:
			- `first_name` (string array), `last_name` (string array),
			- `phone` (string array), `email` (unique string array), 
			- `title` (string), `blurb` (string), `availability` (int array), 
		- **optional**:
			- `grad_year` (int array), `mac_id` (int array), `iclass` (int array), 
			- `time_pref` (int), `description` (string)
	- **Response**:
		- **Success**: 
			- **Status code**: `201`
			- **Response body**: `{"result":"1 user created."}`
		- **Error**:
			- **Status code**: `403`
			- **Response body**: `{error: user <email> already exists}`

- **Method**: `PUT`
	- **NOTE**: in development; see [issue #2](https://github.com/wmcn-fm/wmcn-api/issues/2)

- **Method**: `DELETE`
	- **Description**: delete all applications in the database
	- **Request params**: *none*
	- **Request body**: *none*
	- **Response**: 
		- **Success**:
			- **Status code**: `204`
			- **Response body**: `{result: "<number> applications deleted."}`
		- **Error**:
			- **Status code**: `500`
			- **Response body**: `{error: "..."}`

####Hosts
##### <a name="hosts">`/hosts`</a>

- **Method**: `GET`
	- **Description**: get all user-show relationships
	- **Request params**: *none*
	- **Request body**: *none*
	- **Response**:
		- **Success**:
			- **Status code**: `200`
			- **Response body**: `{hosts: [...]}`
			- **Description**: An array of host rows
		- **Error**:
			- **Status code**: `500`
			- **Response body**: `{error: "..."}`

- **Method**: `POST`
	- **Description**: add one show-user relationship to the schedule
	- **Request params**: *none*
	- **Request body**: `rel` object containing:
		- **required**:
			- `user_id`: valid user id number; `show_id`: valid show id number
	- **Response**:
		- **Success**: 
			- **Status code**: `201`
			- **Response body**: `{"result":"1 relationship added to the table."}`
		- **Error**:
			- **Status code**: `403`
			- **Response body**: `{error: 'User <user id> already hosts show <show_id>'}`
			- **NOTE**: improper error handling; see [issue #13](https://github.com/wmcn-fm/wmcn-api/issues/13)

- **Method**: `PUT`
	- **NOTE**: in development; see [issue #2](https://github.com/wmcn-fm/wmcn-api/issues/2)

- **Method**: `DELETE`
	- **Description**: remove a host from a show
	- **Request params**: *none*
	- **Request body**: `show_id`: valid show id number [required]; `user_id`: valid user id number [required];
	- **Response**: 
		- **Success**:
			- **Status code**: `200`
			- **Response body**: `{result: "removed user <user_id> from show <show_id>"}`
		- **Error**:
			- **Status code**: `500`
			- **Response body**: `{error: "..."}`

####Articles
##### <a name="articles">`/articles`</a>
- **NOTE**: entire route in development; see [issue #14](https://github.com/wmcn-fm/wmcn-api/issues/14)


## Contributors

Will Kent-Daggett ([@wkentdag](https://github.com/wkentdag))

Developed as an independent study with Professor Bret Jackson, spring 2015

## License

MIT





