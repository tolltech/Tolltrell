/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var fruitSelector = document.getElementById('fruit');
var vegetableSelector = document.getElementById('vegetable');

function GetUrlParam(partamName) {
    var url = window.location.search.substring(1);
    var urlParams = url.split('&');
    for (var i = 0; i < urlParams.length; ++i) {
        var name = urlParams[i].split('=');
        if (name[0] == partamName) {
            return name[1];
        }
    }
}

t.render(async function () {
    var cardId = GetUrlParam('cardId');

    if (!cardId) {
        console.log('Cant rendere popup without cardId');
        return;
    }

    var card = await window.Trello.get('/cards/' + cardId);
    if (!card || !card.idBoard) {
        console.log('Cant get boardId for card ' + cardId);
        return;
    }

    var actions = await window.Trello.get('/cards/' + cardId + '/actions?filter=all');

    var createAction = actions.find(x => x.type == 'createCard');
    if (!createAction || !createAction.date) {
        console.log('Cant get createAction for card ' + cardId);
        return;
    }

    var createDate = createAction.date;

    var dates = [];
    var boards = {};
    var currentIterationKey;
    for (var i = actions.length - 1; i >= 0; --i) {
        var action = actions[i];
        if (!action.date || !action.data) {
            continue;
        }

        if (action.type == 'updateCard' && action.data.listBefore) {
            currentIterationKey = action.data.listBefore.name;
        } else if (action.type == 'moveCardToBoard' && action.data.boardSource) {
            var boardId = action.data.boardSource.id;
            var board = boardId && (boards[boardId] || await window.Trello.get('/boards/' + boardId));
            currentIterationKey = board && board.name || 'Unknown board';
        }

        dates.push({ Name: currentIterationKey, Date: action.date });
    }

    console.log(JSON.stringify(dates));

    console.log('Rendered popup for card ' + cardId);
});
