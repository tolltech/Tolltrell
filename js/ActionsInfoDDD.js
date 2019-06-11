var boards = {};
async function GetBoard(boardId) {
    return boards[boardId] || (boards[boardId] = await window.Trello.get('/boards/' + boardId));
}

var lists = {};
async function GetList(listId) {
    return lists[listId] || (lists[listId] = await window.Trello.get('/lists/' + listId));
}

var boardsMovingActions = {};
async function GetBoardsMovingActions(cardId, boardId) {
    var allActions = boardsMovingActions[boardId] || (boardsMovingActions[boardId] = await GetBoardMovingActionsByCard(boardId));
    return allActions.filter(x => x.data.card && x.data.card.id == cardId);
}

async function BuildActionInfosByCard(card) {
    var cardId = card.id;
    var actions = await GetCardChangingActions(cardId);

    var otherBoardIds = actions
        .filter(x => x.type == 'moveCardToBoard' && x.data.boardSource && x.data.boardSource.id != card.idBoard)
        .map(x => x.data.boardSource.id);
    otherBoardIds = distinct(otherBoardIds);

    for (var i = 0; i < otherBoardIds.length; ++i) {
        var boardActions = await GetBoardsMovingActions(cardId, otherBoardIds[i]);
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
        } else if (action.type == 'moveCardToBoard') {
            var boardId = action.data.boardSource.id;
            //карту сдвинули с "текущей" доски, должны узнать ее лист
            if (boardId == currentBoard.id && i > 0) {
                var prevAction = actions[i - 1];
                actionInfo.List = (prevAction.data.listAfter && prevAction.data.listAfter.name)
                    || (prevAction.data.list && prevAction.data.list.name);
            }

            var board = boardId && await GetBoard(boardId);
            actionInfo.Board = board && board.name || 'Unknown board';
        } else if (action.type == 'moveCardFromBoard') {
            continue;
        }
        else {
            continue;
        }

        actionInfo.Name = actionInfo.List || actionInfo.Board;
        actionInfos.push(actionInfo);
    }

    var lastAction = actions[actions.length - 1];
    var lastActionName = (lastAction.data.listAfter && lastAction.data.listAfter.name)
        || (lastAction.data.list && lastAction.data.list.name)
        || currentBoard.name;
    
    actionInfos.push({ Name: lastActionName, Date: new Date() });

    var currentDate = createDate;
    for (var i = 0; i < actionInfos.length; ++i) {
        var delta = actionInfos[i].Date - currentDate;
        var deltaDays = delta / (1000.0 * 60 * 60 * 24);
        actionInfos[i].Days = deltaDays;

        currentDate = actionInfos[i].Date;
    }
    return actionInfos;
}