var assert = require('assert');
describe('Test', function () {
  describe('Should', function () {
    it('green', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });

    it('red', function () {
      assert.equal([1, 2, 3].indexOf(4), 1);
    });    
  });
});