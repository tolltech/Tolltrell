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
describe('GetDeltaDaysHalf', function () {
  describe('WithoutWeekend Half', function () {
    var fs = require('fs');
    var vm = require('vm');
    var path = './js/businesshelper.js';

    var code = fs.readFileSync(path);
    vm.runInThisContext(code);

    var monday1 = new Date(2020, 3, 6); // 6 april
    monday1 = addHours(monday1, 12);

    it('0', function () {
      assert.equal(GetDeltaDays(monday1, monday1, true), 0);
    });

    it('1', function () {
      assert.equal(GetDeltaDays(monday1, addDays(monday1, 1), true), 1);
    });

    it('5 - friday', function () {
      assert.equal(GetDeltaDays(monday1, addDays(monday1, 4), true), 4);
    });

    it('5 monday - satturday', function () {
      var satturday = addDays(monday1, 5);
      var actual = GetDeltaDays(monday1, satturday, true);
      assert.equal(actual, 4.5);
    });

    it('5 monday - sunday', function () {
      var sunday = addDays(monday1, 6);
      var actual = GetDeltaDays(monday1, sunday, true);
      assert.equal(actual, 4.5);
    });

    it('5 monday - monday', function () {
      var monday2 = addDays(monday1, 7);
      var actual = GetDeltaDays(monday1, monday2, true);
      assert.equal(actual, 5);
    });

    it('5 monday - tuesday', function () {
      var tuesday = addDays(monday1, 8);
      var actual = GetDeltaDays(monday1, tuesday, true);
      assert.equal(actual, 6);
    });

    it('17 monday - long wednesday', function () {
      var longWednesday = addDays(monday1, 23);
      var actual = GetDeltaDays(monday1, longWednesday, true);
      assert.equal(actual, 17);
    });

    it('0.5 monday - half of monday', function () {
      var halfDayAdded = addHours(monday1, 12);
      var actual = GetDeltaDays(monday1, halfDayAdded, true);
      assert.equal(actual, 0.5);
    });

    it('1.5 monday - half of tuesday', function () {
      var tuesdayWithHalf = addHours(addDays(monday1, 1), 12);
      var actual = GetDeltaDays(monday1, tuesdayWithHalf, true);
      assert.equal(actual, 1.5);
    });

    it('1.5 monday - half satturday', function () {
      var satturdayWithHalf = addHours(addDays(monday1, 5), 12);
      var actual = GetDeltaDays(monday1, satturdayWithHalf, true);
      assert.equal(actual, 4.5);
    });

    it('1.5 monday - half sunday', function () {
      var satturdayWithHalf = addHours(addDays(monday1, 6), 12);
      var actual = GetDeltaDays(monday1, satturdayWithHalf, true);
      assert.equal(actual, 4.5);
    });

    it('1.5 monday - half next monday', function () {
      var satturdayWithHalf = addHours(addDays(monday1, 7), 12);
      var actual = GetDeltaDays(monday1, satturdayWithHalf, true);
      assert.equal(actual, 5.5);
    });

    it('1.5 monday - half day', function () {
      var halfDayAdded = addHours(monday1, 12);
      var actual = GetDeltaDays(monday1, halfDayAdded, true);
      assert.equal(actual, 0.5);
    });

    var satturday1 = new Date(2020, 3, 11); //11 april
    satturday1 = addHours(satturday1, 12);
    it('satturday - half day', function () {
      var halfDayAdded = addHours(satturday1, 12);
      var actual = GetDeltaDays(satturday1, halfDayAdded, true);
      assert.equal(actual, 0);
    });

    it('satturday - sunday half day', function () {
      var halfDayAdded = addHours(addDays(satturday1, 1), 12);
      var actual = GetDeltaDays(satturday1, halfDayAdded, true);
      assert.equal(actual, 0);
    });

    it('satturday - monday', function () {
      var monday = addHours(addDays(satturday1, 2), 0);
      var actual = GetDeltaDays(satturday1, monday, true);
      assert.equal(actual, 0.5);
    });

    it('satturday - monday half day', function () {
      var mondayHalf = addHours(addDays(satturday1, 2), 12);
      var actual = GetDeltaDays(satturday1, mondayHalf, true);
      assert.equal(actual, 1);
    });

    it('satturday - next monday half day', function () {
      var mextMondayHalf = addHours(addDays(satturday1, 9), 12);
      var actual = GetDeltaDays(satturday1, mextMondayHalf, true);
      assert.equal(actual, 6);
    });    
  });
});