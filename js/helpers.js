function distinct(array){
    return array.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    })
}