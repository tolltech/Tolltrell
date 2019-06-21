/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

var TOLLTECHER_ICON = './images/icon.png';

function intToString(num, size) {
  var s = num + '';
  size = size || 2;
  while (s.length < size) s = '0' + s;
  return s;
}

var getBadges = async function (t) {
  var cardId = await t.card('id').get('id');
  var boardId = await t.board('id').get('id');
  var actions = await GetBoardsMovingActions(cardId, boardId);
  var lastAction = actions.length > 0 ? actions[0] : null;

  var lastDate = lastAction ? new Date(lastAction.date) : new Date();
  var listTimeMiliseconds = new Date() - lastDate;
  var listTimeDays = Math.floor(listTimeMiliseconds / (1000 * 60 * 60 * 24));

  return [{
    title: 'Days',
    text: '' + listTimeDays,
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

var getCardReport = async function (t) {
  var boardId = await t.board('id').get('id');
  var boardActions = await GetBoardCardActions(boardId);

  var rows = await GetCardDetailReport(boardActions, boardId);

  var now = new Date();
  var board = await window.Trello.get('/boards/' + boardId);
  var csvName = 'Cards_'
    + dateToSortableString(now) + '_'
    + board.name + '.csv';
  DownloadCsv(rows, csvName);
};

var getListReport = async function (t) {
  var boardId = await t.board('id').get('id');
  var boardActions = await GetBoardCardActions(boardId);

  var rows = await GetListDetailReport(boardActions);

  var now = new Date();
  var board = await window.Trello.get('/boards/' + boardId);
  var csvName = 'Lists_'
    + dateToSortableString(now) + '_'
    + board.name + '.csv';
  DownloadCsv(rows, csvName);
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
      text: 'Cards Details',
      callback: function (t, options) {
        return getCardReport(t);
      }
    }, {
      icon: TOLLTECHER_ICON,
      text: 'Lists Details',
      callback: function (t, options) {
        return getListReport(t);
      }
    }];
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
      console.log('🙈 Looks like you need to add your API key to the project!');
    }
  }
});

console.log('Loaded by: ' + document.referrer);