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


// http://expressjs.com/en/starter/basic-routing.html
// app.get("/bars/", function (request, response) {
//   response.sendFile(__dirname + '/views/bars.html');
// });

// https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays-in-javascript#34980419
function flatten(arr) {
  return [].concat(...arr)
}

app.get("/data/", function (request, response) {

  let promises = []

  let per_page = 500
  let estimated_records = 15000
  let estimated_subscribe_records = 1500
  
  for (var index = 1; index <= estimated_records / per_page; index++) {
    promises.push(
      new Promise(resolve => {
        fetch(`${process.env.API_URL}&per_page=${per_page}&page=${index}`).then(res => { resolve(res.json()) })
      })
    )
  }
  
  Promise.all(promises)
    .then(json => {
      // console.log(json);

      new Promise(resolve => {
        fetch(`${process.env.API_URL_SUBSCRIBE}&per_page=${estimated_subscribe_records}&page=1`).then(res => { resolve(res.json()) })
      })
      .then(subscribers => {

        let data = parseData(flatten(json), subscribers);

        response.send(data);
      })
    
    });

  /*
  fetch("http://localhost:3000/votes-1.json")
    .then(res => {
      // console.log(res)
      return res.json()
    })
    .then(json => {
      // console.log(json);

      let data = parseData(json);
    
      response.send(data);
    });
  */
  
});


/*
app.get("/data/", function (request, response) {

  fetch(process.env.API_URL + "&per_page=1000&page=1")
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
*/




function parseData(myJson, subscribersJson) {

  const goals = ['learn', 'create', 'play', 'connect', 'live']
  let totals = {}
  let voters = (myJson)
  let subscribers = (subscribersJson)
  var numberOfSubscribers = subscribers.length

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

  const precision = 'day' // 'nanosecond'

  function updateVotes(goal, timestamp) {
    if (precision === 'day') {
      timestamp = timestamp.split('T')[0]; // Timestamp Example: 2018-05-06T06:59:56.295Z
    }
    if (!time[timestamp])             time[timestamp] = {}
    if (!time[timestamp][goal])       time[timestamp][goal] = {}
    if (!time[timestamp][goal].votes) time[timestamp][goal].votes = 0
    time[timestamp][goal].votes++

    if (!time[timestamp].total)       time[timestamp].total = {}
    if (!time[timestamp].total.votes) time[timestamp].total.votes = 0
    time[timestamp].total.votes++
  }
  
  voters.forEach(function(vote) {
    if (vote.data.subscribe_email_list.toLowerCase() === "yes") {
      numberOfSubscribers++
    }
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
  
  
  let votesOverTime = { precision: precision }

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

      if (time[timestamp].total) {
        if (!votesOverTime.total) votesOverTime.total = []
        votesOverTime.total.push({
          timestamp: timestamp,
          // voters: time[timestamp][goal].voters,
          votes: time[timestamp].total.votes
        })
      }
    }
  }
  
  // console.log('*** time')
  console.dir(votesOverTime)
  
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  goals.forEach(function(goal) {
    totals[goal].sort(function(a, b) {
      // a is less than b by some ordering criterion
      if (a.votes < b.votes) {
        return 1;
      }
      // a is greater than b by the ordering criterion
      if (a.votes > b.votes) {
        return -1;
      }
      // a must be equal to b
      return 0;
    })
  })

  totals.numberOfSubscribers = numberOfSubscribers
  
  return {
    totals: totals,
    time: votesOverTime
  }
}


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
