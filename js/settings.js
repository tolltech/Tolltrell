/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

function AddTable(actionInfos, htmlId) {
    var table = $('<table>').addClass('foo');
    var th = $('<tr>');
    var tr = $('<tr>');
    for (var i = 0; i < actionInfos.length; ++i) {

        th.append($('<td>').text(actionInfos[i].Name));
        tr.append($('<td>').text(Math.floor(actionInfos[i].Days * 100) / 100.0));
    }

    table.append(th);
    table.append(tr);
    $('#' + htmlId).replaceWith(table);
}

t.render(async function () {
    var cardId = GetUrlParam('cardId');

    if (!cardId) {
        console.log('Cant render popup without cardId');
        return;
    }

    var card = await window.Trello.get('/cards/' + cardId);
    if (!card || !card.idBoard) {
        console.log('Cant get boardId or listId for card ' + cardId);
        return;
    }

    var actionInfos = await BuildActionInfosByCard(card.id, card.idBoard);
    var nameByIds = toDict(actionInfos, x => x.Id, x => x.Name);
    var sumActionInfos = sumDays(actionInfos);
    //todo: спрятать внутрь sumDays
    sumActionInfos = Object.entries(sumActionInfos).map(function (x) {
        var s = {};
        s.Name = nameByIds[x[0]];
        s.Days = x[1];
        return s;
    });

    var ctx = document.getElementById('cardLifestyleCanvas').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sumActionInfos.map(x => x.Name),
            datasets: [{
                backgroundColor: 'rgb(24, 249, 114)',
                borderColor: 'rgb(24, 249, 114)',
                label: 'days',
                data: sumActionInfos.map(x => x.Days)
            }]
        },

        // Configuration options go here
        options: {}
    });

    AddTable(sumActionInfos, 'cardLifestyleSum');
    AddTable(actionInfos, 'cardLifestyle');
});
