/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

var GRAY_ICON = './images/icon-gray.svg';

// {
//   "id": "58611f2931f777456e7206af",
//   "idMemberCreator": "50054988ea13d8071f28a3e8",
//   "data": {
//     "listAfter": {
//       "name": "released",
//       "id": "56dfd7278eb32e245d4b3272"
//     },
//     "listBefore": {
//       "name": "bugs",
//       "id": "56d548991f3b41ab96396c27"
//     },
//     "board": {
//       "shortLink": "PH23sklp",
//       "name": "Tollrech",
//       "id": "56d54894534aef0454465578"
//     },
//     "card": {
//       "shortLink": "bbE2vtLa",
//       "idShort": 5,
//       "name": "дляфабрикметодбыстройинициализации",
//       "id": "57d8f27a96b27161f1c01d11",
//       "idList": "56dfd7278eb32e245d4b3272"
//     },
//     "old": {
//       "idList": "56d548991f3b41ab96396c27"
//     }
//   },
//   "type": "updateCard",
//   "date": "2016-12-26T13: 46: 17.186Z",
//   "limits": {
    
//   },
//   "memberCreator": {
//     "id": "50054988ea13d8071f28a3e8",
//     "avatarHash": "68be867b91412ee0749c1832b4ce4f1e",
//     "avatarUrl": "https: //trello-avatars.s3.amazonaws.com/68be867b91412ee0749c1832b4ce4f1e",
//     "fullName": "PavelAleksandrov",
//     "idMemberReferrer": "4f4e2b75d22354721281d39a",
//     "initials": "PA",
//     "nonPublic": {
      
//     },
//     "nonPublicAvailable": false,
//     "username": "pavelaleksandrov"
//   }
// }

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