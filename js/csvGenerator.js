async function DownloadCsv(rows) {
    var csv = 'data:text/csv;charset=utf-8'
        + rows.map(x => x.join('\t')).join('\r\n');

    var encodedUri = encodeURI(csv);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    var now = new Date();
    var board = await window.Trello.get('/boards/' + boardId);
    link.setAttribute('download', now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDay() + '_' + board.name + '.csv');
    document.body.appendChild(link); // Required for FF

    link.click();
}