var boards = {};
async function GetBoard(boardId){
    return boards[boardId] || (boards[boardId] = await window.Trello.get('/boards/' + boardId));
}

var lists = {};
async function GetList(listId){
    return lists[listId] || (lists[listId] = await window.Trello.get('/lists/' + listId));
}

async function BuildActionInfosByCard(card) {
    var cardId = card.id;
    var actions = await GetCardChangingActions(cardId);

    var otherBoardIds = actions
        .filter(x => x.type == 'moveCardToBoard' && x.data.boardSource && x.data.boardSource.id != card.idBoard)
        .map(x => x.data.boardSource.id)
        //this is distinct()
        .filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });

    for (var i = 0; i < otherBoardIds.length; ++i) {
        var boardActions = await GetBoardMovingActionsByCard(cardId, otherBoardIds[i]);
        actions = actions.concat(boardActions)
    }

    if (actions.length <= 0) {
        console.log('Not enough actions of card ' + card.name);
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

    var currentBoard = await window.Trello.get('/boards/' + card.idBoard);
    boards[card.idBoard] = currentBoard;

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

    var currentList = await GetList(card.idList);    
    actionInfos.push({ Name: currentList.name, Date: new Date() });

    var currentDate = createDate;
    for (var i = 0; i < actionInfos.length; ++i) {
        var delta = actionInfos[i].Date - currentDate;
        var deltaDays = Math.floor(delta / (1000 * 60 * 60 * 24));
        actionInfos[i].Days = deltaDays;

        currentDate = actionInfos[i].Date;
    }
    return actionInfos;    
}