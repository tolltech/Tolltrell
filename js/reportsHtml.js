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
});

var downloadFunc = async function (prefix, downloadInnerFunc) {
    var boardId = GetUrlParam('boardId');

    if (!boardId) {
        console.log('Cant render popup without boardId');
        return;
    }
    try {
        var ico = $('#' + prefix + 'ReportIconId');
        ico.attr('src', GRAY_ICON);

        await downloadInnerFunc(boardId);
    }
    catch (err) {
        ico.attr('src', RED_ICON);
        var errorDiv = $('#' + prefix + 'ErrorId');
        errorDiv.html(JSON.stringify(err));
        return;
    }

    ico.attr('src', GREEN_ICON);
    t.closePopup();
}

document.getElementById('cardReportButton', DownloadCardReport).addEventListener('click', async function () {
    await downloadFunc('card');
});

document.getElementById('listReportButton', DownloadListReport).addEventListener('click', async function () {
    await downloadFunc('list');
});