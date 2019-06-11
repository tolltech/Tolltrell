function DownloadCsv(rows, name) {
    var csv = 'data:text/csv;charset=utf-8'
        + rows.map(x => x.join(';')).join('\n');

    var encodedUri = encodeURI(csv);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);    
    link.setAttribute('download', name);
    document.body.appendChild(link); // Required for FF

    link.click();
}