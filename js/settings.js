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
        console.log('Cant render popup without cardId');
        return;
    }

    console.log('Rendering popup for card ' + cardId);

    var card = await window.Trello.get('/cards/' + cardId);
    if (!card || !card.idBoard || !card.idList) {
        console.log('Cant get boardId or listId for card ' + cardId);
        return;
    }

    var actionInfos = await BuildActionInfosByCard(card);

    var ctx = document.getElementById('cardLifestyleCanvas').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: actionInfos.map(x => x.Name),
            datasets: [{
                backgroundColor: 'rgb(24, 249, 114)',
                borderColor: 'rgb(24, 249, 114)',
                label: 'days',
                data: actionInfos.map(x => x.Days)
            }]
        },

        // Configuration options go here
        options: {}
    });

    var table = $('<table>').addClass('foo');
    var th = $('<tr>');
    var tr = $('<tr>');
    for (var i = 0; i < actionInfos.length; ++i) {

        th.append($('<td>').text(actionInfos[i].Name));
        tr.append($('<td>').text(Math.floor(actionInfos[i].Days)));

        currentDate = actionInfos[i].Date;
    }

    table.append(th);
    table.append(tr);
    $('#cardLifestyle').replaceWith(table);

    console.log('Rendered popup for card ' + cardId);
});
