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

async function GetCardActions(cardId) {
  return await window.Trello.get('/cards/' + cardId + '/actions?filter=moveCardToBoard,createCard,updateCard:idList&limit=1000');
}