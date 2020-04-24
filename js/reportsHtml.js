var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var WHITE_ICON = 'images/icon.png';
var GRAY_ICON = 'images/loader.gif';
var RED_ICON = 'images/iconred.png';
var GREEN_ICON = 'images/icongreen.png';

var clearFunc = async function (prefix) {
    var ico = $('#' + prefix + 'ReportIconId');
    ico.attr('src', WHITE_ICON);
    var errorDiv = $('#' + prefix + 'ErrorId');
    errorDiv.html('');
}

t.render(async function () {
    await clearFunc('card');
    await clearFunc('list');
    await clearFunc('cardsHtml');
});

var downloadFunc = async function (prefix) {
    var boardId = GetUrlParam('boardId');

    if (!boardId) {
        console.log('Cant render popup without boardId');
        return;
    }

    var from = $('#reportFrom').val();
    var to = $('#reportTo').val();
    
    var ico = $('#' + prefix + 'ReportIconId');
    try {
        ico.attr('src', GRAY_ICON);

        if (prefix == 'card') {
            await DownloadCardReport(boardId, from, to);
        }
        else if (prefix == 'list') {
            await DownloadListReport(boardId, from, to);
        }
        else if (prefix == 'cardsHtml') {
            await CardsHtmlReport(boardId, from, to);
        }
        else {
            throw 'Unable to download report for ' + prefix;
        }
    }
    catch (err) {
        ico.attr('src', RED_ICON);
        var errorDiv = $('#' + prefix + 'ErrorId');
        errorDiv.html(JSON.stringify(err));
        return;
    }

    ico.attr('src', GREEN_ICON);
    if (prefix != 'cardsHtml') {
        t.closePopup();
    }
}

async function downloadJsonFunc(){
    var boardId = GetUrlParam('boardId');
    var actions = await GetBoardCardActions(boardId);
    DownloadCsvJson(actions, 'Board_' + boardId + '_actions.json');
}

document.getElementById('cardReportButton').addEventListener('click', async function () {
    await downloadFunc('card');
});

document.getElementById('listReportButton').addEventListener('click', async function () {
    await downloadFunc('list');
});

document.getElementById('cardsHtmlReportButton').addEventListener('click', async function () {
    await downloadFunc('cardsHtml');
});

document.getElementById('boardActionsButton').addEventListener('click', async function () {
    await downloadJsonFunc();
});