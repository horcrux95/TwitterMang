twitterApp = angular.module('twitterApp', ['ngMaterial', 'btford.socket-io','ngRoute'])

            .config(['$routeProvider', function($routeProvider){
                $routeProvider
                .when('/testing',{
                  templateUrl:'../views/status.html',
                  controller:"poststatus"
                })
                .when('/twit',{
                  templateUrl: '../views/twitter.html',
                  controller : "AppCtrl",
                })
                .otherwise({redirectTo:'/twit'});
            }])
  


  .factory('socket', function(socketFactory) {
    return socketFactory({
      ioSocket: io.connect('http://localhost:3000')
    });
  })
  .controller('AppCtrl', ['$scope', 'socket', function($scope, socket) {
    $scope.rt;
    $scope.rep;
    $scope.rt_status="Enable retweet";
    $scope.rep_status="Enable reply";
    $scope.tabs = [];
    $scope.selectedIndex = 0;
    $scope.onTabSelected = onTabSelected;

    $scope.addTab = function(title, q) {
      //alert("inside addTab");
      let a1=getrt();
      let a2=getrep();

      alert("a1 is and a2 is"+a1 + " " + a2);
      //alert($scope.rt);
      var tabs = $scope.tabs;
      var style = 'tab' + (tabs.length % 4 + 1);
      var tab = {
        title: title,
        active: true,
        style: style,
        q: q
      };
      if (!dupes(tab)) {
        //alert("inside dupes");
        tabs.push(tab);
        $scope.tContent = '';
        $scope.tTitle = '';
        spawnSearch(q,tab,a1,a2);
      } else {
        alert('A search with this query already exists');
      }
    };

    $scope.removeTab = function(tab) {
      var tabs = $scope.tabs;
      for (var j = 0; j < tabs.length; j++) {
        if (tab.title == tabs[j].title) {
          tabs.splice(j, 1);
          $scope.selectedIndex = (j == 0 ? 1 : j - 1);
          break;
        }
      }
    };

    $scope.submit = function($event) {
      if ($event.which !== 13) return;
      if ($scope.tTitle) {
        $scope.addTab($scope.tTitle, $scope.tContent);
      }
    };
    var getrt=function(){
      return $scope.rt;
    }

    var getrep=function(){
      return $scope.rep;
    }

    $scope.toggle_rt=function(){
        $scope.rt=!$scope.rt;
        alert($scope.rt);
      if($scope.rt==false || $scope.rt== null){
       
        $scope.rt_status="Enable retweet";
      }else{
        $scope.rt_status="Disable retweet";
      }
    }

    $scope.toggle_rep=function(){
        $scope.rep=!$scope.rep;
        alert($scope.rep);
      if($scope.rep==false || $scope.rep== null){
        
        $scope.rep_status="Enable reply";
      }else{
        $scope.rep_status="Disable reply";
      }
    }
    

    function onTabSelected(tab) {
      $scope.selectedIndex = this.$index;
      updateScope(tab);

    }

    function updateScope(tab) {
      if ($scope.tabs[$scope.selectedIndex] && $scope.tabs[$scope.selectedIndex].q == tab.q) {
        $scope.tweets = $scope['tweets_' + tab.q];
      }
    }

    function spawnSearch(q, tab,a1,a2) {
     //alert("inside spawnSearch");
     console.log("a1 and a2 are" + a1+a2);
      socket.emit('q', {q:q,rt:a1,rep:a2});
      $scope['tweets_' + q] = [];
      socket.on('tweetfound_' + q, function(tweet) {
        //alert("tweet recieved for " + q);
        console.log(q, tweet.id);
        if ($scope['tweets_' + q].length == 10) {
           $scope['tweets_' + q].shift();
          
            socket.emit('remove', tab.q);
      
        }
        $scope['tweets_' + q] = $scope['tweets_' + q].concat(tweet);

        updateScope(tab)
      });
    }

    function dupes(tab) {
      var tabs = $scope.tabs;
      for (var j = 0; j < tabs.length; j++) {
        if (tab.q == tabs[j].q) {
          return true;
        }
      }
      return false;
    }

    //$scope.addTab('interstellar', 'interstellar');
    //$scope.addTab('lucy', 'lucy');

  }])

  .controller('poststatus',['$scope','$http','socket',function($scope,$http,socket){

    $scope.status_content="";
    $scope.t={};
    $scope.display=false;
    $scope.showtweet= function(){
      if($scope.display==true)
        return true;
      else
        return false;
    }
    $scope.postTweet=function(content){ 

      socket.emit('status',{content:$scope.status_content});
        
   }
   socket.on('updated',function(data){
    alert("updated recieved");
    $scope.display=true;
    $scope.t=data;
   })

  }])
