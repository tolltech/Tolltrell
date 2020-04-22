function addDays(date, daysCount) {
  var newDate = new Date(date);
  newDate.setDate(newDate.getDate() + daysCount);
  return newDate;
}

function addHours(date, hoursCount) {
  var newDate = new Date(date);
  newDate.setTime(newDate.getTime() + (hoursCount * 60 * 60 * 1000));
  return newDate;
}

var assert = require('assert');
describe('GetDeltaDays', function () {
  describe('Simple', function () {
    var fs = require('fs');
    var vm = require('vm');
    var path = './js/businesshelper.js';

    var code = fs.readFileSync(path);
    vm.runInThisContext(code);

    var firstJan = new Date(2020, 0, 1);
    var secondJan = new Date(2020, 0, 2);

    it('1', function () {
      assert.equal(GetDeltaDays(firstJan, secondJan), 1);
    });

    it('0', function () {
      assert.equal(GetDeltaDays(firstJan, firstJan), 0);
    });

    it('0.5', function () {
      assert.equal(GetDeltaDays(firstJan, new Date(2020, 0, 1, 12)), 0.5);
    });

    it('1.5', function () {
      assert.equal(GetDeltaDays(firstJan, new Date(2020, 0, 2, 12)), 1.5);
    });

    it('35.5', function () {
      assert.equal(GetDeltaDays(firstJan, new Date(2020, 1, 5, 12)), 35.5);
    });      
  });
});