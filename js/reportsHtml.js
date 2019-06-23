var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

t.render(async function () {

});

document.getElementById('cardReportButton').addEventListener('click', async function () {
    var boardId = GetUrlParam('boardId');

    if (!boardId) {
        console.log('Cant render popup without boardId');
        return;
    }
    DownloadCardReport(boardId);
});

document.getElementById('listReportButton').addEventListener('click', async function () {
    var boardId = GetUrlParam('boardId');

    if (!boardId) {
        console.log('Cant render popup without boardId');
        return;
    }
    DownloadListReport(boardId);
});