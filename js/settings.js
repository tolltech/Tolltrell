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
    if (!card || !card.idBoard || !card.idList) {
        console.log('Cant get boardId or listId for card ' + cardId);
        return;
    }

    var actions = await window.Trello.get('/cards/' + cardId + '/actions?filter=moveCardToBoard,createCard,updateCard&limit=1000');

    var createAction = actions.find(x => x.type == 'createCard');
    if (!createAction || !createAction.date) {
        console.log('Cant get createAction for card ' + cardId);
        return;
    }

    var createDate = new Date(createAction.date);

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
        } else {
            continue;
        }

        dates.push({ Name: currentIterationKey, Date: new Date(action.date) });
    }

    var currentList = await window.Trello.get('/lists/' + card.idList)
    dates.push({ Name: currentList.name, Date: new Date() });

    console.log(JSON.stringify(dates));

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
                label: 'Card days',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
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
