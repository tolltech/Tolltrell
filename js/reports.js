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

async function GetListDetailReport(boardActions) {

    sortBy(boardActions, x => new Date(x.date));

    var firstAction = boardActions[0];
    var currentDate = new Date(firstAction.date);

    for (var i = 0; i < boardActions.length; ++i) {
        var action = boardActions[i];

    }

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
