function distinct(array){
    return array.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    })
}

function sumDays(actions){
    return actions.reduce(function (map, cardAction) {
        var current = map[cardAction.Id];
        map[cardAction.Id] = current ? current + cardAction.Days : cardAction.Days;
        return map;
      }, {});
}

function toDict(array, getKey, getValue){
    return array.reduce(function (map, item) {
        map[getKey(item)] = getValue(item);
        return map;
      }, {});
}