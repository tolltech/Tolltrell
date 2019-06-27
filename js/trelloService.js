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

async function GetBoardCardActions(boardId) {
  return await window.Trello.get('/boards/' + boardId + '/actions?filter=moveCardToBoard,createCard,updateCard:idList&limit=1000');//updateCard:closed,deleteCard
}

async function GetBoardLists(boardId) {
  return await window.Trello.get('/boards/' + boardId + '/lists?cards=open');
}

async function GetBoardListsWithClosedCards(boardId) {
  return await window.Trello.get('/boards/' + boardId + '/lists?cards=closed');
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