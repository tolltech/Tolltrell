/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

var TOLLTECHER_ICON = './images/icon.png';

var getBadges = async function (t) {
  var cardId = await t.card('id').get('id');

  var cardInfo = await window.Trello.get('/cards/' + cardId);

  var actions = await GetCardChangeingActions(cardId);
  var lastListAction = actions.find(x => x.data && x.data.listAfter);
  var moveToBoardAction = actions.find(x => x.type == "moveCardToBoard");
  var createCardAction = actions.reverse().find(x => x.type = "createCard");
  //todo: выделить в ДДД класс работу с датами
  var createCardOrBoardAction = moveToBoardAction || createCardAction;

  if (!lastListAction && !createCardOrBoardAction) {
    console.log('No list changing or createCard action for ' + cardInfo.name);
    return [];
  }

  var lastDate = lastListAction ? new Date(lastListAction.date) : new Date(createCardOrBoardAction.date);
  var listTimeMiliseconds = new Date() - lastDate;
  var listTimeDays = Math.floor(listTimeMiliseconds / (1000 * 60 * 60 * 24));

  return [{
    title: 'Days',
    text: listTimeDays,
    icon: TOLLTECHER_ICON,
    callback: function (context) {
      return context.popup({
        title: 'Card Lifestyle',
        url: './settings.html?cardId=' + cardId,
        height: 200
      });
    }
  }];
};

var getReport = async function (t) {
  var boardId = await t.board('id').get('id');

  console.log('Generating report for board ' + boardId);

  const rows = [
    ["name1", "cuty1", "other info"],
    ["name2", "cuty2", "other info2"]
  ];

  let csv = 'data:text/csv;charset=utf-8'
  + rows.map(x=>x.join(",").join('\r\n'));

  var url = encodeURI(csv);
  window.open(url);
};

TrelloPowerUp.initialize({
  'card-badges': function (t, options) {
    return getBadges(t);
  },
  'card-detail-badges': function (t, options) {
    return getBadges(t);
  },

  'board-buttons': function (t, options) {
    return [{
      icon: TOLLTECHER_ICON,
      text: 'Cards life',
      callback: function (t, options) {
        return getReport(t);
      }
    }];
  }
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