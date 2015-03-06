# wmcn api 0.1 documentation

##Users

###Basic routes:

| url | method | action | url params | success | error | data params |
|:---|:---:|:---:|:---:|:---:|
| `/users`| GET  | return an array of all user documents | none | 200, `{users: [...]}` | 500 | none |
| `/users` | POST | add a user to the database | none | 201, `{_id: ...}` | 403, user exists; 500; | `req.body` contains user information - name, hash, mac info, email, phone |
| `/users` | PUT | update all users | none | 200, `'xxx users updated'` | 500 | none |
| `/users` | DEL | delete  user collection | none | 200, `'xxx users deleted'` | 500 | `req.body` contains user information to be updated - have server check for fields to be updated? upsert? |
| `/users/:id`| GET  | returns one user document|  `id`: user's unique mongo OID | 200, `{_id:...}` | 500, error loading user; 404, user not found | none |
| `/users/:id`| PUT  | update one user|  `id`: user's unique mongo OID | 200, `{_id:...}` | 500, error updating; 404, user not found| `req.body` contains params  |
| `/users:id` | DEL | delete a user | `id`: user's unique mongo OID | 200, `'user deleted'` | 500, error deleting; 404, user not found  | none |

###Advanced routes:

| url | method | action | url params | success | error | data params |
|:---|:---:|:---:|:---:|:---:|
| `/users/active` | GET | return all currently active users (i.e., `user.hash != null`) | none | 200, `{active users: [...]}` | 500, error fetching; 404, no active users (in between semesters?) | none |


 



##Shows

###Basic routes:

| url | method | action | url params | success | error | data params |
|:---|:---:|:---:|:---:|:---:|
| `/shows` | GET | return all shows | none | 200, `{shows: [...]}` | 500 | none |
| `/shows` | POST | add a new show | none | 201, `{_id: ...}` | 500; 403, show exists | `req.body` contains show info - blurb, hosts, title, timeslot |
| `/shows` | PUT | update all shows | none | 200, `'xxx shows updated'` | 500 | `req.body` contains fields to be updated |
| `/shows` | DEL | delete all shows |none | 200, `'xxx shows updated'` | 500 | none |
| `/shows/:id`| GET  | return one show |  `id`: show's unique mongo OID | 200, `{_id:...}` | 500, error loading show; 404, show not found | none |
| `/shows/:id`| PUT  | update one show|  `id`: show's unique mongo OID | 200, `{_id:...}` | 500, error updating; 404, show not found| `req.body` contains params  |
| `/shows/:id` | DEL | delete a show | `id`: show's unique mongo OID | 200, `'show deleted'` | 500, error deleting; 404, show not found  | none |


###Advanced routes:

| url | method | action | url params | success | error | data params |
|:---|:---:|:---:|:---:|:---:|
| `/shows/active` | GET | return all currently active shows (i.e., 0 <= timeslot <= 167) | none | 200, `{active shows: [...]}` | 500, error fetching; 404, no active shows (in between semesters?) | none |
| `/shows/:id/hosts` | GET | returns the user documents associated with a given show | `id`: unique OID | 200, `{users: [...]}` | 500; 404, couldnt find users/show | none |



##Playlists

###Basic routes: 

| url | method | action | url params | success | error | data params |
|:---|:---:|:---:|:---:|:---:|
| `/playlists` | GET | return all playlists | none | 200, `{playlists: [...]}` | 500 | none |
| `/playlists` | POST | add a new playlist | none | 201, `{_id: ...}` | 500; 403, playlist exists **(how?)** | show_id, host_id, date, content |
| `/playlists` | PUT | update all playlists | none | 200, `"xxx playlists updated"` | 500 | `req.body` contains parameters and values to be updated | 
| `/playlists` | DEL | delete all playlists | none | 200, `"xxx playlists deleted"` | 500 | none |
| `/playlists/:id` | GET | return one playlist | `id`: playlist's unique mongo OID | 200, `{_id:...}` | 500, error loading; 404, pl not found |none|
| `/playlists/:id` | PUT | update one playlist | `id`: playlist's unique mongo OID | 200, `{_id:...}` | 500, error updating; 404, pl not found | content: either JSON pairs or plain string **(tbd)** - other info inaccessible|
| `/playlists/:id` | DEL | delete one playlist | `id`: playlist's unique mongo OID | 200, `playlist deleted` | 500, error deleting; 404, pl not found | none|


##Applications

###Basic routes:

| url | method | action | url params | success | error | data params |
|:---|:---:|:---:|:---:|:---:|
| `/applications` | GET | return all pending applications | none | 200, `{apps: [...]}` | 500 | none |
| `/applications` | POST | add a new application | none | 201, `{_id:...}` | 500 | user subdoc, show subdoc, app subdoc; indexed by `show.title` |
| `/applications` | PUT | update all pending applications | none | 200, `xxx applications updated` | 500 | `req.body` contains update params |
| `/applications` | DEL | delete all pending applications | none | 200, `'xxx applications deleted'` | 500 | none |
| `/applications/:id` | GET | return one pending applications | `id`: app's mongo OID | 200, `{_id:...}` | 500, error fetching; 404, not found | none |
| `/applications/:id` | PUT | update a pending app | none | 200, `{_id...}` | 500, error updating; 404, not found | `req.body` contains params: **possibly only timeslot update-able? or availability?** |
| `/applications/:id` | DEL | Delete an application | none | 200, `'app deleted'` | 500, error deleting; 404, not found | none |

