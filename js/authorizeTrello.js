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

async function GetCardChangeingActions(cardId) {
  return await window.Trello.get('/cards/' + cardId + '/actions?filter=moveCardToBoard,createCard,updateCard:idList&limit=1000');
}

async function GetBoardMovingActions(cardId, boardId) {
  var boardActions = await window.Trello.get('/boards/' + boardId + '/actions?filter=moveCardToBoard&limit=1000');
  return boardActions.filter(x => x.data.card && x.data.card.id == cardId);
}

async function GetAllCardActions(cardId) {
  return await window.Trello.get('/cards/' + cardId + '/actions?filter=all&limit=1000');
}