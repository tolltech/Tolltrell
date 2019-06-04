/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

var TOLLTECHER_ICON = './images/icon.png';

var getBadges = async function (t) {
  var cardId = await t.card('id').get('id');

  console.log('Getting card info for: ' + cardId);

  var cardInfo = await window.Trello.get('/cards/' + cardId);

  console.log('Get card info for: ' + cardId + ' with name ' + cardInfo.name);

  var actions = await window.Trello.get('/cards/' + cardId + '/actions?filter=all');
  var lastListAction = actions.find(x => x.data && x.data.listAfter && x.date);
  var createCardOrBoardAction = actions.find(x => (x.type = "createCard" || x.type == "moveCardToBoard") && x.date);

  if (!lastListAction && !createCardOrBoardAction){    
    console.log('No list changing or createCard action for ' + cardInfo.name);
    return [];
  }

  console.log('Find last list changing action for ' + cardInfo.name + '. ' + JSON.stringify(lastListAction));
  console.log('Find createCardOrboard action for ' + cardInfo.name + '. ' + JSON.stringify(createCardOrBoardAction));

  var lastDate = lastListAction ? new Date(lastListAction.date) : new Date(createCardOrBoardAction.date);
  var listTimeMiliseconds = new Date() - lastDate;
  var listTimeDays = Math.floor(listTimeMiliseconds / (1000 * 60 * 60 * 24));

  return [{
    title: 'Days left',
    text: listTimeDays,
    icon: TOLLTECHER_ICON,
    callback: function(context) {
      return context.popup({
        title: 'Card Lifestyle',
        url: './settings.html?cardId=' + cardId,
        height: 200
      });
    }
  }];
};

TrelloPowerUp.initialize({
  'card-badges': function (t, options) {
    return getBadges(t);
  },
  'card-detail-badges': function (t, options) {
    return getBadges(t);
  },

  /*        
      
      🔑 Authorization Capabiltiies 🗝
      
      The following two capabilities should be used together to determine:
      1. whether a user is appropriately authorized
      2. what to do when a user isn't completely authorized
      
  */
  'authorization-status': function (t, options) {
    return t.get('member', 'private', 'token')
      .then(function (token) {
        if (token) {
          return { authorized: true };
        }
        return { authorized: false };
      });
  },
  'show-authorization': function (t, options) {
    let trelloAPIKey = '9b4a96d318dd1d5e851440173c2074fc';

    if (trelloAPIKey) {
      return t.popup({
        title: 'Tolltrell Auth Popup',
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