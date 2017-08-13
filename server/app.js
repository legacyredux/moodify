// dependencies
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');
const Promise = require('bluebird');
// other module exports
const auth = require('./auth.js');
const mmHelpers = require('./musixMatchHelpers.js');
const spotifyHelpers = require('./spotifyHelpers.js');
const watsonHelpers = require('./watsonHelpers.js');
const db = require('../database');
const config = require('../config/index.js');
const googleBookHelpers = require('./googleBookHelpers.js');

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((id, done) => {
  db.User.findById(id, (err, user) => {
    done(err, user);
  });
});

const app = express();
let accessTime;

passport.use(new SpotifyStrategy({
  clientID: config.SPOTIFY.clientId,
  clientSecret: config.SPOTIFY.secret,
  callbackURL: config.SPOTIFY.cbURL,
}, (accessToken, refreshToken, profile, done) => {
  accessTime = accessToken;
  db.User.findOrCreate({
    username: profile.username,
    password: profile.id,
  }, (err, result) =>
    done(err, result));
  // done(null, profile);
}));

// ////////////////////////////////////////////////////////////// //
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'ssshhh', resave: false, saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/../react-client/dist`));
// routes
let sess = {};

app.get('/auth/spotify',
  passport.authenticate('spotify', { scope: ['user-read-email', 'user-read-recently-played', 'user-top-read'], showDialog: true }),
  (req, res) => {
    console.log('This should not be called: ', res);
  });

app.get('/auth/spotify/callback',
  // passport.authenticate('spotify', { failureRedirect: 'https://lahumeur.herokuapp.com/login' }),
  passport.authenticate('spotify', { failureRedirect: 'https://localhost:8080/login' }),
  (req, res) => {
    res.redirect(config.REDIRECT);
  });

app.get('/recentlyplayed', (req, res) => {
  const url = 'https://api.spotify.com/v1/me/player/recently-played';

  axios(url, { headers: { Authorization: `Bearer ${accessTime}` } })
  .then((result) => {
    const playListEntry = result.data.items;
    let songArray = { track_list: [] };

    playListEntry.forEach((x) => {
      let songData = {
        track: {
          track_name: x.track.name,
          artist_name: x.track.album.artists[0].name,
        },
      };

      if (songArray.track_list.length < 10) {
        songArray.track_list.push(songData);
      }
    });
    return songArray;
  })
  .then(data => res.send(data))
  .catch((err) => {
    console.log('error retrieving playlists TRACKS from spotify ', err);
    res.send(err);
  });
});


const spotifyApi = new SpotifyWebApi({
  clientId: config.SPOTIFY_CLIENT_API_KEY,
  clientSecret: config.SPOTIFY_CLIENT_SECRET_API_KEY });

spotifyApi.clientCredentialsGrant()
 .then((data) => {
   console.log(`The access token expires in ${data.body.expires_in}`);
   spotifyApi.setAccessToken(data.body.access_token);
 }, (err) => {
   console.log('Something went wrong when retrieving an access token', err.message);
 });

app.post('/signup', auth.createUser, (req, res) => {
  sess = req.session;
  sess.username = req.body.username;
  res.send({ statusCode: 200 });
});

app.post('/login', auth.verifyUser, (req, res) => {
  sess = req.session;
  sess.username = req.body.username;
  res.send({ statusCode: 200 });
});

// modified check
app.get('/check', (req, res) => {
  if (req.session.username || req.session.passport) {
    res.send({ statusCode: 200 });
  } else {
    res.send({ statusCode: 404 });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('logged out!');
});

// Query last database entry for date
// Compare most recent data to today's date
// if day does not much, query the database
app.get('/newreleases', (req, res) => {
  spotifyApi.getNewReleases({ limit: 20, offset: 0, country: 'US' })
    .then((data) => {
      const topTenData = {
        songs: data.body.albums.items,
        dateadded: Date.now(),
      };
      const newTopTenEntry = new db.TopTenSongs(topTenData);
      newTopTenEntry.save((err) => {
        if (err) { console.log('Error saving TopTenSong data'); }
      });
      res.send(data.body.albums.items);
    });
}, (err) => {
  console.log('could not get new releases', err);
});

app.post('/books', (req, res) =>
  googleBookHelpers.getBookDescriptionByTitleAndAuthor(req.body.title, req.body.artist)
  .then((data) => {
    if (data.length === 0) { res.send({ errorMessage: 'No Search Results' }); }
    res.send(data);
  })
  .catch((error) => { res.send(error); }));


app.post('/search', (req, res) =>
  mmHelpers.searchByTitleAndArtist(req.body.title, req.body.artist)
  .then((data) => {
    if (data.track_list.length === 0) { res.send({ errorMessage: 'No Search Results' }); }
    res.send(data);
  })
  .catch((error) => { res.send(error); }));

app.post('/fetchLyricsByTrackId', (req, res) => {
  const trackId = req.body.trackId;
  return mmHelpers.getLyricsByTrackId(trackId)
  .then((lyrics) => {
    res.send(lyrics);
  })
  .catch((error) => { res.send(error); });
});

app.post('/processBook', (req, res) => {
  const input = req.body;

  const bookTitleAndAuthor = [input.author_name, input.book_name];
  let watsonData = {};

  return watsonHelpers.queryWatsonToneHelper(input.description)
  .then((data) => {
    watsonData.book_id = input.book_id;
    watsonData.anger = data.anger;
    watsonData.disgust = data.disgust;
    watsonData.fear = data.fear;
    watsonData.joy = data.joy;
    watsonData.sadness = data.sadness;
    watsonData.analytical = data.analytical;
    watsonData.confident = data.confident;
    watsonData.tentative = data.tentative;
    watsonData.openness = data.openness;
    watsonData.conscientiousness = data.conscientiousness;
    watsonData.extraversion = data.extraversion;
    watsonData.agreeableness = data.agreeableness;
    watsonData.emotionalrange = data.emotionalrange;
  })
  .then(() => {
    const bookEntry = new db.Book(input);
    bookEntry.save((err) => {
      if (err) { console.log('SAVE BOOK ERROR: ', err); }
    });
  })
  .then(() => {
    if (req.session.passport) {
      return db.User.where({ username: req.session.passport.user.username }).update({ $push: { books: input.book_id } });
    }
    throw new Error('error');
  })
  .then(() => {
    res.json([bookTitleAndAuthor, input.description, watsonData, input.img]);
  })
  .catch((err) => {
    console.log('Error processbook: ', err);
  });
});

app.post('/process', (req, res) => {
  const input = req.body;
  const songNameAndArtist = [input.artist_name, input.track_name];
  let watsonData = {};

  return mmHelpers.getLyricsByTrackId(input.track_id)
  .then((data) => {
    const lyrics = data.lyrics.lyrics_body;
    input.lyrics = lyrics.slice(0, (lyrics.indexOf('*******')));
  })
  .then(() =>
    watsonHelpers.queryWatsonToneHelper(input.lyrics))
  .then((data) => {
    watsonData = {
      track_id: input.track_id,
      anger: data.anger,
      disgust: data.disgust,
      fear: data.fear,
      joy: data.joy,
      sadness: data.sadness,
      analytical: data.analytical,
      confident: data.confident,
      tentative: data.tentative,
      openness: data.openness,
      conscientiousness: data.conscientiousness,
      extraversion: data.extraversion,
      agreeableness: data.agreeableness,
      emotionalrange: data.emotionalrange,
    };
    const newEntry = new db.Watson(watsonData);
    newEntry.save((err) => {
      if (err) { console.log('SAVE WATSON ERROR'); }
    });
  })
  .then(() => {
    if (req.session.passport.user.username) {
      return db.User.where({ username: req.session.passport.user.username }).update({ $push: { songs: input.track_id } });
    }
    throw new Error('some error');
  })
  .then(() =>
    spotifyHelpers.getSongByTitleAndArtist(input.track_name, input.artist_name))
  .then((spotifyData) => {
    input.spotify_uri = spotifyData;

    const songEntry = new db.Song(input);
    songEntry.save((err) => {
      if (err) { console.log(`SAVE SONG ERROR: ${err}`); }
    });
  })
  .then(() => {
    res.json([songNameAndArtist, input.lyrics, watsonData, input.spotify_uri]);
  })
  .catch((error) => {
    console.log('/PROCESS ERROR: ', error);
    res.send(error);
  });
});


app.get('/pastSearches', (req, res) => {
  /* ************************************************************************************* */
  console.log('received request for pas searches');
  const username = req.session.user || req.session.passport.user.username;
  return new Promise((resolve, reject) => {
    db.User.where({ username }).findOne((err, user) => {
      if (err) { reject(err); }
      const songs = user !== null ? user.songs : [];
      const books = user !== null ? user.books : [];
      resolve(songs.concat(books));
    });
  })

  .then((searches) => {
    let previousSearches = [];
    return new Promise((resolve, reject) => {
      if (searches.length > 0) {
        searches.forEach((ID, index) => {
          if (typeof ID === 'number') {
            db.Song.where({ track_id: ID }).findOne((err, songData) => {
              if (err) { reject(err); }
              previousSearches.push({
                track_id: ID,
                track_name: songData.track_name,
                artist_name: songData.artist_name,
              });
              if (index === searches.length - 1) {
                resolve(previousSearches);
              }
            });
          } else {
            db.Book.where({ book_id: ID }).findOne((err, bookData) => {
              if (err) { reject(err); }
              previousSearches.push({
                book_id: ID,
                book_name: bookData.book_name,
                author_name: bookData.author_name,
              });
              if (index === searches.length - 1) {
                resolve(previousSearches);
              }
            });
          }
        });
      } else {
        throw new Error('why is there no error handling');
      }
    })

    .then((previous) => {
      res.send(previous);
    })
    .catch((err) => {
      res.send({ errorMessage: `No Past Searches ${err}` });
    });
  })
  .catch((err) => {
    res.send({ errorMessage: `No Past Searches ${err}` });
  });
});

app.post('/loadPastSearchResults', (req, res) =>
  new Promise((resolve, reject) => {
    db.Song
    .find({ track_id: req.body.track_id })
    .exec((err, data) => {
      if (err) { reject(err); }
      resolve(data[0]);
    });
  })
  .then((songData) => {
    let output = [];
    output.push(songData);
    db.Watson
    .find({ track_id: req.body.track_id })
    .exec((err, watsonData) => {
      output.push(watsonData[0]);
      res.send(output);
    });
  })
  .catch(err => res.send(err)));

module.exports = app;
