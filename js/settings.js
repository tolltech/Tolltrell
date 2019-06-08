/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

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

    console.log('Rendering popup for card ' + cardId);

    var card = await window.Trello.get('/cards/' + cardId);
    if (!card || !card.idBoard || !card.idList) {
        console.log('Cant get boardId or listId for card ' + cardId);
        return;
    }

    var actions = await GetCardChangeingActions(cardId);

    var otherBoardIds = actions
        .filter(x => x.type == 'moveCardToBoard' && x.data.boardSource && x.data.boardSource.id != card.idBoard)
        .map(x => x.data.boardSource.id)
        //this is distinct()
        .filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });

    for (var i = 0; i < otherBoardIds.length; ++i) {
        var boardActions = await GetBoardMovingActions(cardId, otherBoardIds[i]);
        actions = actions.concat(boardActions)
    }

    actions.sort(function (a, b) {
        var keyA = new Date(a.date),
            keyB = new Date(b.date);
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });

    var createAction = actions.find(x => x.type == 'createCard');
    if (!createAction || !createAction.date) {
        console.log('Cant get createAction for card ' + cardId);
        return;
    }

    var createDate = new Date(createAction.date);

    var dates = [];
    var boards = {};
    var currentIterationKey;
    for (var i = 0; i < actions.length; ++i) {
        var action = actions[i];
        if (!action.date || !action.data) {
            continue;
        }

        if (action.type == 'updateCard' && action.data.listBefore) {
            currentIterationKey = action.data.listBefore.name;
        } else if (action.type == 'moveCardToBoard' && action.data.boardSource) {
            var boardId = action.data.boardSource.id;
            var board = boardId && (boards[boardId] || await window.Trello.get('/boards/' + boardId));
            boards[boardId] = board;

            currentIterationKey = board && board.name || 'Unknown board';
        } else if (action.type == 'moveCardFromBoard') {
            continue;
        }
        else {
            continue;
        }

        dates.push({ Name: currentIterationKey, Date: new Date(action.date) });
    }

    var currentList = await window.Trello.get('/lists/' + card.idList)
    dates.push({ Name: currentList.name, Date: new Date() });

    var currentDate = createDate;
    for (var i = 0; i < dates.length; ++i) {
        var delta = dates[i].Date - currentDate;
        var deltaDays = Math.floor(delta / (1000 * 60 * 60 * 24));
        dates[i].Days = deltaDays;

        currentDate = dates[i].Date;
    }

    var ctx = document.getElementById('cardLifestyleCanvas').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates.map(x => x.Name),
            datasets: [{
                backgroundColor: 'rgb(24, 249, 114)',
                borderColor: 'rgb(24, 249, 114)',
                label: 'days',
                data: dates.map(x => x.Days)
            }]
        },

        // Configuration options go here
        options: {}
    });

    var table = $('<table>').addClass('foo');
    var th = $('<tr>');
    var tr = $('<tr>');
    for (var i = 0; i < dates.length; ++i) {

        th.append($('<td>').text(dates[i].Name));
        tr.append($('<td>').text(dates[i].Days));

        currentDate = dates[i].Date;
    }

    table.append(th);
    table.append(tr);
    $('#cardLifestyle').replaceWith(table);

    console.log('Rendered popup for card ' + cardId);
});
