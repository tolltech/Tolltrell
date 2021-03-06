function distinct(array) {
    return array.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    })
}

function includesAnyLowerCase(src, subStrings) {
    if (!src || !subStrings || !subStrings.length) {
        return false;
    }

    for (var i = 0; i < subStrings.length; ++i) {
        if (src.toLowerCase().includes(subStrings[i].toLowerCase())) {
            return true;
        }
    }

    return false;
}

function sumDays(actions) {
    return actions.reduce(function (map, cardAction) {
        var current = map[cardAction.Id];
        map[cardAction.Id] = current ? current + cardAction.Days : cardAction.Days;
        return map;
    }, {});
}

function sumDaysExcludeWeekend(actions) {
    return actions.reduce(function (map, cardAction) {
        var current = map[cardAction.Id];
        map[cardAction.Id] = current ? current + cardAction.DaysExcludeWeekend : cardAction.DaysExcludeWeekend;
        return map;
    }, {});
}

function toDict(array, getKey, getValue) {
    return array.reduce(function (map, item) {
        map[getKey(item)] = getValue(item);
        return map;
    }, {});
}

function sortBy(array, getKey) {
    array.sort(function (a, b) {
        var keyA = getKey(a),
            keyB = getKey(b);
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });
}

function intToString(num, size) {
    var s = num + '';
    size = size || 2;
    while (s.length < size) s = '0' + s;
    return s;
}

function dateToSortableString(date) {
    return date.getFullYear() + '-'
        + intToString(date.getMonth() + 1) + '-'
        + intToString(date.getDate());
}

function addDays(date, daysCount) {
    date.setDate(date.getDate() + daysCount);
}

function getArrayFromMap(s) {
    return Object.entries(s).map(function (x) {
        var s2 = {};
        s2.Key = x[0];
        s2.Value = x[1];
        return s2;
    });
}

function cloneObject(o) {
    return JSON.parse(JSON.stringify(o));
}

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

function AddTableByRows(rows, htmlId) {
    var table = $('<table>');
    for (var i = 0; i < rows.length; ++i) {
        var tr = $('<tr>');
        for (var j = 0; j < rows[i].length; ++j) {
            tr.append($('<td>').text(rows[i][j]));
        }
        table.append(tr);
    }
    $('#' + htmlId).replaceWith(table);
}