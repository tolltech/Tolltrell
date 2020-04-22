function GetDeltaDays(fromDate, toDate, withoutWeekend) {
    var acc = 0;
    var currentDate = new Date(fromDate);
    if (withoutWeekend) {
        while (true) {
            if (currentDate >= toDate) {
                return acc / (1000.0 * 60 * 60 * 24);
            }

            var prevDate = new Date(currentDate);
            //add 1 day
            currentDate.setDate(currentDate.getDate() + 1);
            if (currentDate > toDate) {
                currentDate = new Date(toDate);
            }

            if (IsWeekend(prevDate) && IsWeekend(currentDate)) {
                continue;
            }

            var startOfDay = new Date(currentDate);
            startOfDay.setHours(0, 0, 0, 0);
            if (IsWeekend(prevDate)) {
                acc += currentDate - startOfDay;
            }
            else if (IsWeekend(currentDate)) {
                acc += startOfDay - prevDate;
            }
            else {
                acc += currentDate - prevDate;
            }
        }
    }
    else {
        var delta = toDate - fromDate;
        return delta / (1000.0 * 60 * 60 * 24);
    }
}

function IsWeekend(date) {
    return date.getDay() == 0 || date.getDay() == 6;
}