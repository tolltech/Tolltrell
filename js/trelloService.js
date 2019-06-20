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

async function GetCardChangingActions(cardId) {
  return await window.Trello.get('/cards/' + cardId + '/actions?filter=moveCardToBoard,createCard,updateCard:idList&limit=1000');
}

async function GetBoardCardActions(boardId) {
  return await window.Trello.get('/boards/' + boardId + '/actions?filter=moveCardToBoard,createCard,updateCard:idList&limit=1000');
}

async function GetAllCardActions(cardId) {
  return await window.Trello.get('/cards/' + cardId + '/actions?filter=all&limit=1000');
}