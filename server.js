var express = require('express');
var app = express();

var path = require('path');
var Twit = require('twit');
app.use(express.static(path.join(__dirname, 'public')));

var T = new Twit({
  consumer_key: '5Apzs2qA0DROj6ZgS739D8vMx',
  consumer_secret: 'yNnzFA44HFdpc8Slczmc9upYe9NseKLktuoU2VsxFavPmvy25g',
  access_token: '773566720384589824-fTGvAMeIxMIBA87C99W8wQ4dScgFTGB',
  access_token_secret: 'jU60UD5r7eXzUriqcjSi37cvNzVnn9TkQ3Ui9dhGVDVej'
});


app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});


var server = require('http').Server(app);
var io = require('socket.io')(server);

var query = {};
var retweet={};
var reply={};

io.on('connection', function(socket) {
  query[socket.id] = {};

  console.log("socket connected");

  socket.on('q', function(data) {
    retweet[socket.id]=data.rt || false;
    reply[socket.id]=data.rep ||false;
    var ip=data.q;
    console.log("###inside query on");
    console.log(retweet[socket.id] + " " + reply[socket.id]);


    if (!query[socket.id][ip]) {
      console.log('We just got a new search term', ip);

      var stream = T.stream('statuses/filter', {
        track: ip
      });

      



      stream.on('tweet', function(tweet) {
       
        console.log("\n");

        console.log("Runig for id " + tweet.id  ); 
        
        


          if(retweet[socket.id]==true || retweet[socket.id]!=undefined){

        T.post('statuses/retweet/:id', { id: tweet.id_str }, function (err, data, response) {
            
        console.log("in func rt for id " + tweet.id  ); 
        
            if(err){
              console.log("error in retweeting "+ tweet.id );
            } 
            else{
              console.log("retweeting the tweet "+ tweet.id); 
               T.post('statuses/destroy/:id', { id: data.id_str }, function (err, data, response) {
            if(err){
              console.log("error in destroying tweet");
            }else{
                 console.log("deleted successfully");
           
            }
            });
            }
             //console.log(data);
        });

      }

        





      if(reply[socket.id]==true || reply[socket.id]!=undefined){


        var replyto=tweet.user.screen_name;
       

        T.post('statuses/update', { status: "@"+replyto+ " Please ignore.This is twitter API testing. Thanku for using word " + ip +" in your tweet." }, function(err, data, response) {
          
        console.log("in func post for id " + tweet.id  ); 
        
            if(err){
            console.log("****************There is an error in replying to that tweet");
          }
          else{

        console.log("rep for id " + tweet.id  ); 
        
            console.log("*************************successfully replied");
            //console.log(data);
          }
          
        });

      }




    
        socket.emit('tweetfound_' + ip, tweet);
      
      });

      stream.on('limit', function(limitMessage) {
        console.log('Limit for User : ' + socket.id + ' on query ' + ip + ' has rechead!');
      });

      stream.on('warning', function(warning) {
        console.log('warning', warning);
      });

      stream.on('reconnect', function(request, response, connectInterval) {
        console.log('reconnect :: connectInterval', connectInterval)
      });

      stream.on('disconnect', function(disconnectMessage) {
        console.log('disconnect', disconnectMessage);
      });

      query[socket.id][ip] = stream;
    }
  });

  socket.on('status',function(ip){
    
    console.log("event rec");

  T.post('statuses/update', { status: ip.content }, function(err, data, response) {
    if(err) console.log(err);
    else{
      console.log(data);
      console.log("emiting updated");
      socket.emit('updated',{data: data});
    }
  
     });

});

  socket.on('remove', function(ip) {
    query[socket.id][ip].stop();
    delete query[socket.id][ip];
    console.log('Removed Search >>', ip);
  });



  socket.on('disconnect', function() {
    for (var k in query[socket.id]) {
      query[socket.id][k].stop();
      delete query[socket.id][k];
    }
    delete query[socket.id];
    console.log('deleting all active searches for user with id', socket.id);
  });

});


var port_number = server.listen(process.env.PORT || 3000);
server.listen(port_number)
