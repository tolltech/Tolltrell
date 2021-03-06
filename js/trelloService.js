var authenticationSuccess = function () {
  console.log('Successful authentication');
};

var authenticationFailure = function () {
  console.log('Failed authentication');
};

window.Trello.authorize({
  type: 'popup',
  name: 'Tolltrell',
  scope: {
    read: 'true',
    write: 'false'
  },
  expiration: 'never',
  success: authenticationSuccess,
  error: authenticationFailure
});

async function GetBoardCardActions(boardId, from, to) {
  var result = await window.Trello.get('/boards/' + boardId + '/actions?filter=moveCardToBoard,createCard,copyCard,updateCard:idList,updateCard:closed&limit=1000');

  if (from) {
    result = result.filter(x => !x.date || new Date(x.date) >= from);
  }

  if (to) {
    result = result.filter(x => !x.date || new Date(x.date) <= to);
  }

  return result;
}

async function GetCardActions(cardId) {
  return await window.Trello.get('/cards/' + cardId + '/actions?filter=moveCardToBoard,createCard,copyCard,updateCard:idList,updateCard:closed&limit=1000');
}

async function GetAllCardActions(cardId) {
  return await window.Trello.get('/cards/' + cardId + '/actions?limit=1000');
}

async function GetBoardLists(boardId) {
  return await window.Trello.get('/boards/' + boardId + '/lists?cards=open');
}

async function GetBoardOpenLists(boardId) {
  return await window.Trello.get('/boards/' + boardId + '/lists?filter=open');
}

async function GetBoardListsWithClosedCards(boardId) {
  return await window.Trello.get('/boards/' + boardId + '/lists?cards=closed');
}

async function SetListSoftLimit(listId, softLimit) {
  return await window.Trello.put('/lists/' + listId + '/softLimit?value=' + softLimit);
}

async function GetListCards(listId) {
  return await window.Trello.get('/lists/' + listId + '/cards');
}

async function GetTrelloList(listId) {
  try {
    return await window.Trello.get('/lists/' + listId);
  }
  catch (err) {
    if (err && err.status == 404) {
      return null;
    }
    throw err;
  }
}