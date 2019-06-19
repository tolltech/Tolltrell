var boards = {};
async function GetBoard(boardId) {
    try {
        return boards[boardId] || (boards[boardId] = await window.Trello.get('/boards/' + boardId));
    }
    catch (err) {
        if (err && err.status == 404) {
            return null;
        }
        throw err;
    }
}

var lists = {};
async function GetList(listId) {
    return lists[listId] || (lists[listId] = await window.Trello.get('/lists/' + listId));
}

var boardsMovingActions = {};
async function GetBoardsMovingActions(cardId, boardId) {
    try {
        var allActions = boardsMovingActions[boardId] || (boardsMovingActions[boardId] = await GetBoardMovingActionsByCard(boardId));
        return allActions.filter(x => x.data.card && x.data.card.id == cardId);
    }
    catch (err) {
        if (err && err.status == 404) {
            console.log('Error while get actions for board ' + boardId + ' Error ' + JSON.stringify(err));
            return [];
        }
        throw err;
    }
}

var cardsChangingActionsCache = {};
async function GetCardChangingActionsCached(cardId) {
    return cardsChangingActionsCache[cardId] || (cardsChangingActionsCache[cardId] = await GetCardChangingActions(cardId));
}

async function BuildActionInfosByCard(card) {
    var cardId = card.id;
    var actions = await GetCardChangingActionsCached(cardId);

    var otherBoardIds = actions
        .filter(x => x.type == 'moveCardToBoard' && x.data.boardSource && x.data.boardSource.id != card.idBoard)
        .map(x => x.data.boardSource.id);
    otherBoardIds = distinct(otherBoardIds);

    for (var i = 0; i < otherBoardIds.length; ++i) {
        var boardActions = await GetBoardsMovingActions(cardId, otherBoardIds[i]);

        if (boardActions.length == 0) {
            console.log('Found 0 board actions for board ' + otherBoardIds[i]);
            console.log('SourceActions ' + JSON.stringify(actions));
        }

        actions = actions.concat(boardActions)
    }

    if (actions.length <= 0) {
        return [];
    }

    actions.sort(function (a, b) {
        var keyA = new Date(a.date),
            keyB = new Date(b.date);
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });

    var createAction = actions.find(x => x.type == 'createCard')
        || actions[0];
    if (!createAction) {
        console.log('Cant get createAction for card ' + cardId);
        return [];
    }

    var createDate = new Date(createAction.date);

    var currentBoard = await GetBoard(card.idBoard);

    var actionInfos = [];
    for (var i = 0; i < actions.length; ++i) {
        var action = actions[i];
        if (!action.date || !action.data || action.id == createAction.id) {
            continue;
        }

        var actionInfo = {
            Date: new Date(action.date)
        };

        if (action.type == 'updateCard' && action.data.listBefore) {
            actionInfo.List = action.data.listBefore.name;
            actionInfo.ListId = action.data.listBefore.id;
        } else if (action.type == 'moveCardToBoard') {
            var boardId = action.data.boardSource.id;
            //карту сдвинули с "текущей" доски, должны узнать ее лист
            if (boardId == currentBoard.id && i > 0) {
                var prevAction = actions[i - 1];
                var list = prevAction.data.listAfter || prevAction.data.list;
                actionInfo.List = list && list.name;
                actionInfo.ListId = list && list.id;
            }

            var board = boardId && await GetBoard(boardId);
            actionInfo.Board = board && board.name || 'Unknown board ' + boardId;
            actionInfo.BoardId = boardId;
        } else if (action.type == 'moveCardFromBoard') {
            continue;
        }
        else {
            continue;
        }

        actionInfo.Name = actionInfo.List || actionInfo.Board;
        actionInfo.Id = actionInfo.ListId || actionInfo.BoardId;
        actionInfos.push(actionInfo);
    }

    var lastAction = actions[actions.length - 1];
    var lastActionList = lastAction.data.listAfter || lastAction.data.list;
    var lastActionName = (lastActionList && lastActionList.name)
        || currentBoard.name;
    var lastActionId = (lastActionList && lastActionList.id)
        || currentBoard.id;

    actionInfos.push({ Name: lastActionName, Date: new Date(), Id: lastActionId, ListId: lastActionList && lastActionList.id, BoardId: currentBoard.Id });

    var currentDate = createDate;
    for (var i = 0; i < actionInfos.length; ++i) {
        var delta = actionInfos[i].Date - currentDate;
        var deltaDays = delta / (1000.0 * 60 * 60 * 24);
        actionInfos[i].Days = deltaDays;

        currentDate = actionInfos[i].Date;
    }
    return actionInfos;
}