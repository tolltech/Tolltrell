/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

var GRAY_ICON = './images/icon-gray.svg';

var getBadges = function(t){
  return t.card('id')
  .get('id')
  .then(function(cardId){
    console.log('We just loaded the card name and id for fun: ' + cardId);

    return [{      
      title: 'Detail Badge', // for detail badges only
      text: 'Static',
      icon: GRAY_ICON, // for card front badges only
      color: null
    }];
  });
};

TrelloPowerUp.initialize({
  'card-badges': function(t, options){
    return getBadges(t);
  },
  'card-detail-badges': function(t, options) {
    return getBadges(t);
  },

  /*        
      
      🔑 Authorization Capabiltiies 🗝
      
      The following two capabilities should be used together to determine:
      1. whether a user is appropriately authorized
      2. what to do when a user isn't completely authorized
      
  */
  'authorization-status': function(t, options){
    return t.get('member', 'private', 'token')
    .then(function(token){
      if(token){
        return { authorized: true };
      }
      return { authorized: false };
    });
  },
  'show-authorization': function(t, options){
    let trelloAPIKey = '9b4a96d318dd1d5e851440173c2074fc';

    if (trelloAPIKey) {
      return t.popup({
        title: 'My Auth Popup',
        args: { apiKey: trelloAPIKey }, 
        url: './authorize.html',
        height: 140,
      });
    } else {
      console.log("🙈 Looks like you need to add your API key to the project!");
    }
  }
});

console.log('Loaded by: ' + document.referrer);