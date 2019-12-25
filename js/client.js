/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

var TOLLTECHER_ICON = './images/icon.png';
var TOLLTECHER_ICON_RED = './images/iconred.png';

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

var getWipLimitBadges = async function (t) {
  var cardId = await t.card('id').get('id');
  var card = await GetCard(cardId);
  var listId = card.idList;
  var list = await  GetList(listId);
  var softLimit = list.softLimit;
  var cards = await GetListCards(listId);

  if (softLimit && cards && cards.length && softLimit > cards.length){
    return [{
      title: 'WIP LIMIT EXCEEDED',
      text: 'WIP',
      icon: TOLLTECHER_ICON_RED
    }];
  }

  return [];
};

var getCardReport = async function (t) {
  var boardId = await t.board('id').get('id');
  await DownloadCardReport(boardId);
};

var getListReport = async function (t) {
  var boardId = await t.board('id').get('id');
  await DownloadListReport(boardId);
};

var reportBoardButtonCallback = async function (t) {
  var boardId = await t.board('id').get('id');
  return t.popup({
    title: 'Reports',
    url: './reports.html?boardId=' + boardId,
    height: 184 // we can always resize later, but if we know the size in advance, its good to tell Trello
  });
};

var listsBoardButtonCallback = async function (t) {
  var boardId = await t.board('id').get('id');
  return t.popup({
    title: 'Lists',
    url: './lists.html?boardId=' + boardId,
    height: 184 // we can always resize later, but if we know the size in advance, its good to tell Trello
  });
};

TrelloPowerUp.initialize({
  'card-badges': function (t, options) {
    return getBadges(t).concat(getWipLimitBadges(t));
  },
  'card-detail-badges': function (t, options) {
    return getBadges(t).concat(getWipLimitBadges(t));
  },

  'board-buttons': function (t, options) {
    return [
    //   {
    //   icon: TOLLTECHER_ICON,
    //   text: 'Cards Details',
    //   callback: function (t, options) {
    //     return getCardReport(t);
    //   }
    // }, 
    {
      icon: TOLLTECHER_ICON,
      text: 'Toll Lists',
      callback: function (t, options) {
        return listsBoardButtonCallback(t);
      }
    }, 
    {
      icon: TOLLTECHER_ICON,
      text: 'Toll Reports',
      callback: function (t, options) {
        return reportBoardButtonCallback(t);
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