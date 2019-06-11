function distinct(array){
    return array.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    })
}

function sumDays(actions){
    return actions.reduce(function (map, cardAction) {
        var current = map[cardAction.Name];
        map[cardAction.Name] = current ? current + cardAction.Days : cardAction.Days;
        return map;
      }, {});
}