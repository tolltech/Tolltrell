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

document.getElementById('save').addEventListener('click', function () {

  //https://api.trello.com/1/cards/id/actions

  console.log('getting actions');
  console.log(t.arg('name'));
  var s = window.Trello.get('/cards/' + t.card('id').get('id') + '/actions')
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
