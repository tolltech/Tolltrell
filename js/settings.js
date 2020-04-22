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

    var thisBoardActionInfos = actionInfos.filter(x => x.BoardId == card.idBoard);

    var sumActionInfos = sumDays(thisBoardActionInfos);
    //todo: спрятать внутрь sumDays
    sumActionInfos = Object.entries(sumActionInfos).map(function (x) {
        var s = {};
        s.Name = nameByIds[x[0]];
        s.Days = x[1];
        return s;
    });

    var sumActionInfosExcludeWeekends = sumDaysExcludeWeekend(thisBoardActionInfos);
    //todo: спрятать внутрь sumDays
    sumActionInfosExcludeWeekends = Object.entries(sumActionInfosExcludeWeekends).map(function (x) {
        var s = {};
        s.Name = nameByIds[x[0]];
        s.Days = x[1];
        return s;
    });

    AddTable(sumActionInfos, 'cardLifestyleSum');
    AddTable(sumActionInfosExcludeWeekends, 'cardLifestyleSumExcludeWeekend');
    AddTable(actionInfos, 'cardLifestyle');
});

async function downloadJsonFunc(){
    var cardId = GetUrlParam('cardId');
    var actions = await GetCardActions(cardId);
    DownloadCsvJson(actions, 'Card_ ' + cardId + '_actions.json');
}

async function downloadAllJsonFunc(){
    var cardId = GetUrlParam('cardId');
    var actions = await GetAllCardActions(cardId);
    DownloadCsvJson(actions, 'Card_ ' + cardId + '_all_actions.json');
}

document.getElementById('cardActionsButton').addEventListener('click', async function () {
    await downloadJsonFunc();
});

document.getElementById('cardAllActionsButton').addEventListener('click', async function () {
    await downloadAllJsonFunc();
});