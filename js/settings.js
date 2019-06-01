/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var fruitSelector = document.getElementById('fruit');
var vegetableSelector = document.getElementById('vegetable');

t.render(function () {
  return Promise.all([
    t.get('board', 'shared', 'fruit'),
    t.get('board', 'private', 'vegetable')
  ])
    .spread(function (savedFruit, savedVegetable) {
      if (savedFruit && /[a-z]+/.test(savedFruit)) {
        fruitSelector.value = savedFruit;
      }
      if (savedVegetable && /[a-z]+/.test(savedVegetable)) {
        vegetableSelector.value = savedVegetable;
      }
    })
    .then(function () {
      t.sizeTo('#content')
        .done();
    })
});

function GetURLParameter(sParam)
{
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++)
  {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam)
    {
      return sParameterName[1];
    }
  }
}​

document.getElementById('save').addEventListener('click', function () {

  //https://api.trello.com/1/cards/id/actions

  var cardId = GetURLParameter('cardId');

  console.log('getting actions of acardId' + cardId);

  var s = window.Trello.get('/cards/' + cardId + '/actions')
  .then(function(s1,s2,s3){
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
