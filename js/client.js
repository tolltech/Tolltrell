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

  var cardInfo = await window.Trello.get('/cards/' + cardId);

  var actions = await GetCardChangingActionsCached(cardId);
  var lastListAction = actions.find(x => x.data && x.data.listAfter);
  var moveToBoardAction = actions.find(x => x.type == 'moveCardToBoard');
  var createCardAction = actions.reverse().find(x => x.type = 'createCard');
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

  var boardActions = await GetBoardCardActions(boardId);
  var cards = boardActions.filter(x => x.data.card).map(x => x.data.card);
  var cardIds = cards.map(x => x.id);
  cardIds = distinct(cardIds);
  var cardNamesByIds = toDict(cards, x => x.id, x => x.name);

  var actionsByCard = {};
  var nameIds = [];
  var nameByIds = {};
  var actionInfoByIds = {};
  for (var i = 0; i < cardIds.length; ++i) {
    var cardId = cardIds[i];
    var actions = await BuildActionInfosByCard(cardId, boardId);

    actionsByCard[cardId] = {};
    actionsByCard[cardId].Actions = actions;
    actionsByCard[cardId].CardName = cardNamesByIds[cardId] || 'Unknown card' + cardId;

    for (var j = 0; j < actions.length; ++j) {
      nameByIds[actions[j].Id] = actions[j].Name;
      actionInfoByIds[actions[j].Id] = actions[j];
      nameIds.push(actions[j].Id);
    }
  }

  var actionIdsHeaderRow = distinct(nameIds);

  var rows = [];
  //header = 'Card, ... actions
  rows.push(['TrelloList'].concat(actionIdsHeaderRow.map(x => nameByIds[x])));

  var boardNamesRow = [];
  for (var i = 0; i < actionIdsHeaderRow.length; ++i) {
    var actionInfoId = actionIdsHeaderRow[i];
    var actionInfo = actionInfoByIds[actionInfoId];
    var boardName;
    if (actionInfo.Board) {
      boardName = actionInfo.Board;
    }
    else if (actionInfo.ListId) {
      var list = await GetList(actionInfo.ListId);
      if (list.idBoard) {
        var board = await GetBoard(list.idBoard);
        boardName = board && board.name;
      }
    }
    boardNamesRow.push(boardName || 'Unknown board')
  }

  rows.push(['TrelloBoard'].concat(boardNamesRow));

  for (var i = 0; i < cardIds.length; ++i) {
    var cardId = cardIds[i];
    var cardActions = actionsByCard[cardId];

    var cardDaysById = sumDays(cardActions.Actions);

    rows.push([cardActions.CardName].concat(actionIdsHeaderRow.map(x => cardDaysById[x] === undefined
      ? 0
      : ('' + cardDaysById[x]).replace(/\./g, ','))));
  }

  var now = new Date();
  var board = await window.Trello.get('/boards/' + boardId);
  var csvName = now.getFullYear() + '-'
    + intToString(now.getMonth() + 1) + '-'
    + intToString(now.getDate()) + '_'
    + board.name + '.csv';
  DownloadCsv(rows, csvName);

  console.log('Generated report for board ' + boardId);
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