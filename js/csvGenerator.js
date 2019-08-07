function DownloadCsv(rows, name) {
    var csv = 'data:text/plain;charset=utf-8,'
        + encodeURIComponent(rows.map(x => x.join('\t')).join('\n'));

    var link = document.createElement('a');
    link.setAttribute('href', csv);    
    link.setAttribute('download', name);
    link.style.display = 'none';
    document.body.appendChild(link); // Required for FF

    link.click();
}

function DownloadCsvJson(json, name) {
    var csv = 'data:text/plain;charset=utf-8,'
        + encodeURIComponent(JSON.stringify(json));

    var link = document.createElement('a');
    link.setAttribute('href', csv);    
    link.setAttribute('download', name);
    link.style.display = 'none';
    document.body.appendChild(link); // Required for FF

    link.click();
}