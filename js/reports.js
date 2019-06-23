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

    var listNameByIds = {};
    var dateSnapshots = [];
    var now = new Date();
    var nowStr = dateToSortableString(now);

    var snapshot = { Cards: {} };
    var listIds = [];
    for (var i = 0; i < lists.length; ++i) {
        var list = lists[i];
        listIds.push(list.id);
        listNameByIds[list.id] = list.name;
        var cards = list.cards || [];
        for (var j = 0; j < cards.length; ++j) {
            var card = cards[j];
            snapshot.Cards[card.id] = { ListId: card.idList };
        }
    }
    dateSnapshots.push({ Day: nowStr, Snapshot: snapshot });

    var createdCardIdsThisDay = [];
    for (var i = 0; i < boardActions.length; ++i) {
        var action = boardActions[i];
        var lastSnapshot = dateSnapshots[dateSnapshots.length - 1];

        var cardId = action.data.card.id;
        var listId = (action.data.listAfter && action.data.listAfter.id)
            || (action.data.list && action.data.list.id);

        if (!listId) {
            console.log('Cant determine list for action ' + JSON.stringify(action));
        }

        var actionDateStr = dateToSortableString(new Date(action.date));
        if (actionDateStr == lastSnapshot.Day) {
            lastSnapshot.Snapshot.Cards[cardId] = { ListId: listId };
        }
        else {
            var newSnapshot = { Cards: cloneObject(lastSnapshot.Snapshot.Cards) };

            newSnapshot.Cards[cardId] = { ListId: listId };

            if (createdCardIdsThisDay.indexOf(cardId) != -1) {
                console.log('Card ' + action.data.card.name + ' was created at ' + lastSnapshot.Day + ', but appears at ' + actionDateStr);
            }

            for (var j = 0; j < createdCardIdsThisDay.length; ++j) {
                var cId = createdCardIdsThisDay[j];
                newSnapshot.Cards[cId] = { ListId: undefined };
            }
            createdCardIdsThisDay = [];

            dateSnapshots.push({ Day: actionDateStr, Snapshot: newSnapshot });
        }
        if (action.type == 'createCard') {
            createdCardIdsThisDay.push(cardId);
        }
    }

    var otherListIds = distinct(boardActions.filter(x => x.data && x.data.list && x.data.list.id).map(x => x.data.list.id));
    listIds = distinct(listIds.concat(otherListIds));

    for (var i = 0; i < listIds.length; ++i) {
        var listId = listIds[i];
        if (listNameByIds[listId]) {
            continue;
        }

        var list = await GetTrelloList(listId);
        listNameByIds[listId] = (list && list.name) || 'UnknownList ' + listId;
    }

    sortBy(dateSnapshots, x => x.Day);
    var rows = [];
    rows.push(['TrelloList'].concat(listIds.map(x => listNameByIds[x] || ('UnknownList' + x))));
    for (var i = 0; i < dateSnapshots.length; ++i) {
        var snapshot = dateSnapshots[i];
        var snapshotCards = getArrayFromMap(snapshot.Snapshot.Cards);
        rows.push([snapshot.Day].concat(listIds.map(function (listId) {
            return snapshotCards.filter(x => x.Value && x.Value.ListId == listId).length;
        })));
    }
    return rows;
}
