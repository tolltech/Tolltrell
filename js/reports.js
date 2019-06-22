async function GetCardDetailReport(boardActions, boardId) {
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

    return rows;
}

async function GetListDetailReport(boardActions, boardId) {
    var lists = await GetBoardLists(boardId);

    var listByIds = {};
    var dateSnapshots = {};
    var now = new Date();
    var nowStr = dateToSortableString(now);

    var snapshot = { Cards: {} };
    for (var i = 0; i < lists.length; ++i) {
        var list = lists[i];
        listByIds[list.id] = list.name;
        var cards = list.cards || [];
        for (var j = 0; j < cards.length; ++j) {
            var card = cards[j];
            snapshot.Cards[card.id] = { ListId: card.idList };
        }
    }
    dateSnapshots[nowStr] = snapshot;

    var listIds = distinct(boardActions.filter(x => x.data && x.data.list && x.data.list.id).map(x => x.data.list.id));

    for (var i = 0; i < listIds.length; ++i) {
        var listId = listIds[i];
        if (listByIds[listId]) {
            continue;
        }

        var list = await GetList(listId);
        listByIds[listId] = list.name;
    }

    var rows = [];
    rows.push(['TrelloList'].concat(listIds.map(x => x)));
    var snapshots = getArrayFromMap(dateSnapshots);
    for (var i = 0; i < snapshots.length; ++i) {
        var snapshot = snapshots[i];
        var snapshotCards = getArrayFromMap(snapshot.Value.Cards);
        rows.push([snapshot.Key].concat(listIds.map(function (listId) {
            return snapshotCards.filter(x => x.Value.ListId == listId).length;
        })));
    }
    return rows;
}
