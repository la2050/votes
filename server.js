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
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/data/", function (request, response) {

  fetch(process.env.API_URL)
    .then(res => {
      console.log(res)
      return res.json()
    })
    .then(json => {
      console.log(json);

      let data = parseData(json);
    
      response.send(data);
    });
  
});


function parseData(myJson) {

  const goals = ['learn', 'create', 'play', 'connect', 'live']
  let totals = {}
  let votes = (myJson)

  totals.numberOfVoters = votes.length

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
  votes.forEach(function(vote) {
    goals.forEach(function(goal) {
      updateTotal(goal, vote.data[goal])
    })
  })
  
  return totals
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
