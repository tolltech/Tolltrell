/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var fruitSelector = document.getElementById('fruit');
var vegetableSelector = document.getElementById('vegetable');

t.render(function () {
  return new Promise(function (resolve, reject) {
    resolve( console.log('Popup popuped!') );
  });
});

function GetUrlParam(partamName) {
  var url = window.location.search.substring(1);
  var urlParams = url.split('&');
  for (var i = 0; i < urlParams.length; ++i) {
    var name = urlParams[i].split('=');
    if (name[0] == partamName) {
      return name[1];
    }
  }
}

document.getElementById('save').addEventListener('click', function () {

  //https://api.trello.com/1/cards/id/actions

  var cardId = GetUrlParam('cardId');

  console.log('getting actions of acardId' + cardId);

  var s = window.Trello.get('/cards/' + cardId + '/actions')
    .then(function (s1, s2, s3) {
      console.log('get actions');
      console.log(s1);
      console.log(s2);
      console.log(s3);
    });

  return t.set('board', 'private', 'vegetable', vegetableSelector.value)
    .then(function () {
      return t.set('board', 'shared', 'fruit', fruitSelector.value);
    })
    .then(function () {
      t.closePopup();
    })
})
