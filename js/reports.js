async function DownloadCardReport(boardId, from, to) {
    var boardActions = await GetBoardCardActions(boardId, from, to);

    var rows = await GetCardDetailReport(boardActions, boardId);

    var now = new Date();
    var board = await window.Trello.get('/boards/' + boardId);
    var csvName = 'Cards_'
        + dateToSortableString(now) + '_'
        + board.name + '.csv';
    DownloadCsv(rows, csvName);
}

async function DownloadListReport(boardId, from, to) {
    var boardActions = await GetBoardCardActions(boardId, from, to);

    var rows = await GetListDetailReport(boardActions, boardId);

    var now = new Date();
    var board = await window.Trello.get('/boards/' + boardId);
    var csvName = 'Lists_'
        + dateToSortableString(now) + '_'
        + board.name + '.csv';
    DownloadCsv(rows, csvName);
}

async function CardsHtmlReport(boardId, from, to) {
    var boardActions = await GetBoardCardActions(boardId, from, to);

    var rows = await GetListDetailReport(boardActions, boardId);

    AddTableByRows(rows, 'cardsHtmlTableId');
}

async function GetCardDetailReport(boardActions, boardId) {
    var cards = boardActions.filter(x => x.data.card).map(x => x.data.card);
    var cardIds = cards.map(x => x.id);
    cardIds = distinct(cardIds);
    var cardNamesByIds = toDict(cards.reverse(), x => x.id, x => x.name);

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
    sortBy(actionIdsHeaderRow, x => x);

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
            : ('' + cardDaysById[x]).replace(/\./g, ','))));//заменяем точки на запятые
    }

    return rows;
}

async function GetListDetailReport(boardActions, boardId) {
    var listsWithOpen = await GetBoardLists(boardId);
    var listsWithClosed = await GetBoardListsWithClosedCards(boardId);
    var currentBoard = await GetBoard(boardId);

    var listNameByIds = {};
    var boardNameByListIds = {};
    var dateSnapshots = [];
    var now = new Date();
    var nowStr = dateToSortableString(now);

    var snapshot = { Cards: {} };
    var listIds = [];
    var lists = listsWithOpen.concat(listsWithClosed);
    var archiveListId = 'archiveId';
    listNameByIds[archiveListId] = 'Archive';
    boardNameByListIds[archiveListId] = currentBoard.name;
    for (var i = 0; i < lists.length; ++i) {
        var list = lists[i];
        listIds.push(list.id);
        listNameByIds[list.id] = list.name;
        boardNameByListIds[list.id] = currentBoard.name;

        var cards = list.cards || [];
        for (var j = 0; j < cards.length; ++j) {
            var card = cards[j];

            var cardListId = card.idList;
            if (card.closed) {
                cardListId = archiveListId;
            }
            snapshot.Cards[card.id] = { ListId: cardListId };
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
        if (action.type == 'createCard' || action.type == 'copyCard') {
            createdCardIdsThisDay.push(cardId);
        }
    }

    var otherListIds = distinct(boardActions.filter(x => x.data && x.data.list && x.data.list.id).map(x => x.data.list.id));
    var headerListIds = distinct(listIds.concat(otherListIds)).concat(archiveListId);
    sortBy(headerListIds, x => x);

    for (var i = 0; i < headerListIds.length; ++i) {
        var listId = headerListIds[i];
        if (listNameByIds[listId]) {
            continue;
        }

        var list = await GetTrelloList(listId);
        listNameByIds[listId] = (list && list.name) || 'UnknownList ' + listId;

        var board = list && list.idBoard && await GetBoard(list.idBoard);
        boardNameByListIds[listId] = (board && board.name) || '';
    }

    sortBy(dateSnapshots, x => x.Day);
    var rows = [];
    rows.push(['TrelloList']
        .concat(headerListIds
            .map(x => boardNameByListIds[x] + ' - ' + (listNameByIds[x] || ('UnknownList' + x)))
        )
    );

    for (var i = 0; i < dateSnapshots.length; ++i) {
        var snapshot = dateSnapshots[i];
        var snapshotCards = getArrayFromMap(snapshot.Snapshot.Cards);
        rows.push([snapshot.Day].concat(headerListIds.map(function (listId) {
            return snapshotCards.filter(x => x.Value && x.Value.ListId == listId).length;
        })));
    }
    return rows;
}
