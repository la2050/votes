// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var fetch = require('node-fetch');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/votes/", function (request, response) {
  response.sendFile(__dirname + '/views/votes.html');
});

http://expressjs.com/en/starter/basic-routing.html
app.get("/time/", function (request, response) {
  response.sendFile(__dirname + '/views/time.html');
});

// http://expressjs.com/en/starter/basic-routing.html
// app.get("/bars/", function (request, response) {
//   response.sendFile(__dirname + '/views/bars.html');
// });

app.get("/data/", function (request, response) {

  fetch(process.env.API_URL)
    .then(res => {
      // console.log(res)
      return res.json()
    })
    .then(json => {
      // console.log(json);

      let data = parseData(json);
    
      response.send(data);
    });
  
});




function parseData(myJson) {

  const goals = ['learn', 'create', 'play', 'connect', 'live']
  let totals = {}
  let voters = (myJson)

  // let ttime = [{
  //   date: 'datestamp',
  //   votes: [5, 7, 9, 0, 1]
  //   voters: [2, 4, 8, 0, 1]
  // }]
  
  // let time = {
  //   'total': [{
  //     date: 'datestamp',
  //     votes: 12
  //   }],
  //   'learn': [{
  //     date: 'datestamp',
  //     votes: 5
  //   }],
  //   'create': [{
  //     date: 'datestamp',
  //     votes: 7
  //   }]
  // }

  let time = {}
  
  totals.numberOfVoters = voters.length

  function updateTotal(goal, finalist) {
    if (finalist && !finalist == '') {
      if (!totals[goal]) totals[goal] = []
      let match
      totals[goal].forEach(function(next) {
        if (next.finalist === finalist) match = next
      })
      if (match) match.votes++
      else totals[goal].push({ finalist: finalist, votes: 1 })
      // if (!totals[goal][finalist]) totals[goal][finalist] = 0
      // totals[goal][finalist]++
    }
  }

  // function updateVoters(goal, timestamp) {
  //   if (!time[timestamp]) time[timestamp] = {}
  //   if (!time[timestamp][goal]) time[timestamp][goal] = {}
  //   if (!time[timestamp][goal].voters) time[timestamp][goal].voters = 0
  //   time[timestamp][goal].voters++
  // }

  function updateVotes(goal, timestamp) {
    if (!time[timestamp]) time[timestamp] = {}
    if (!time[timestamp][goal]) time[timestamp][goal] = {}
    if (!time[timestamp][goal].votes) time[timestamp][goal].votes = 0
    time[timestamp][goal].votes++
  }
  
  voters.forEach(function(vote) {
    goals.forEach(function(goal) {
      // console.dir(vote)
      updateTotal(goal, vote.data[goal])
      //updateVoters(goal, vote['created_at'])

      let finalist = vote.data[goal]
      if (finalist && !finalist == '') {
        updateVotes(goal, vote['created_at'])
      }
    })
  })
  
  
  let votesOverTime = {}

  for (var timestamp in time) {
    if (time.hasOwnProperty(timestamp)) {
      // console.dir(time[timestamp])
      goals.forEach(function(goal) {
        if (time[timestamp][goal]) {
          if (!votesOverTime[goal]) votesOverTime[goal] = []
          votesOverTime[goal].push({
            timestamp: timestamp,
            // voters: time[timestamp][goal].voters,
            votes: time[timestamp][goal].votes
          })
        }
      })
    }
  }
  
  // console.log('*** time')
  console.dir(votesOverTime)
  
  return {
    totals: totals,
    time: votesOverTime
  }
}


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
