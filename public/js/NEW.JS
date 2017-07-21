T.get('followers/ids', { screen_name: 'tolga_tezel' },  function (err, data, response) {
  console.log(data)
})
//GETS ALL FOLLOWERS
T.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
  console.log(data)
})

//POSTS STAUS ON YOUR WALL
