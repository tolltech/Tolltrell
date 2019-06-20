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
        var allActions = boardsMovingActions[boardId] || (boardsMovingActions[boardId] = await GetBoardCardActions(boardId));
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

function getListFromAction(action) {
    var actionList = action.data.listAfter || action.data.list;
    var listName = actionList && actionList.name;
    var listId = actionList && actionList.id;
    return { Name: listName, Id: listId };
}

function getBoardFromAction(action) {
    var actionBoard = action.data.board;
    var boardName = actionBoard && actionBoard.name;
    var boardId = actionBoard && actionBoard.id;
    return { Name: boardName, Id: boardId };
}

function getActionInfo(prevAction, date) {
    var actionInfo = {
        Date: new Date(date)
    };

    var prevActionList = getListFromAction(prevAction);
    actionInfo.List = prevActionList.Name;
    actionInfo.ListId = prevActionList.Id;

    var prevActionBoard = getBoardFromAction(prevAction);
    actionInfo.Board = prevActionBoard.Name || 'Unknown board ' + prevActionBoard.Id;
    actionInfo.BoardId = prevActionBoard.Id;

    actionInfo.Name = actionInfo.List || actionInfo.Board;
    actionInfo.Id = actionInfo.ListId || actionInfo.BoardId;

    return actionInfo;
}

async function BuildActionInfosByCard(cardId, boardId) {
    var actions = await GetBoardsMovingActions(cardId, boardId);

    var otherBoardIds = actions
        .filter(x => x.type == 'moveCardToBoard' && x.data.boardSource && x.data.boardSource.id != boardId)
        .map(x => x.data.boardSource.id);
    otherBoardIds = distinct(otherBoardIds);

    for (var i = 0; i < otherBoardIds.length; ++i) {
        var boardActions = await GetBoardsMovingActions(cardId, otherBoardIds[i]);
        actions = actions.concat(boardActions)
    }

    if (actions.length <= 0) {
        return [];
    }

    sortBy(actions, x => new Date(x.date));

    var firstAction = actions[0];
    var fisrstActionDate = new Date(firstAction.date);

    var actionInfos = [];
    for (var i = 1; i < actions.length; ++i) {
        var action = actions[i];
        var prevAction = actions[i - 1];

        var actionInfo = getActionInfo(prevAction, action.date);
        actionInfos.push(actionInfo);
    }

    var lastAction = actions[actions.length - 1];
    var lastActionInfo = getActionInfo(lastAction, new Date());
    actionInfos.push(lastActionInfo);

    var currentDate = fisrstActionDate;
    for (var i = 0; i < actionInfos.length; ++i) {
        var delta = actionInfos[i].Date - currentDate;
        var deltaDays = delta / (1000.0 * 60 * 60 * 24);
        actionInfos[i].Days = deltaDays;

        currentDate = actionInfos[i].Date;
    }
    return actionInfos;
}