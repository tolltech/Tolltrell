var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

t.render(async function () {

    try {
        var boardId = GetUrlParam('boardId');

        if (!boardId) {
            console.log('Cant render popup without boardId');
            return;
        }

        var lists = await GetBoardOpenLists(boardId);

        var listsDiv = $('#listsTableId');
        listsDiv.html('');

        for (var i = 0; i < lists.length; ++i) {
            var list = lists[i];

            var listDiv = $('<tr>');
            listDiv.attr('listId', list.id);

            var spanListName = $('<td>');
            spanListName.text(list.name);
            var inputId = 'wipInput' + list.id;
            var spanInput = $('<td><input id="' + inputId + '" type="text" style="width: 40px"/></td>');
            var button = $('<button id="button' + inputId + '" class="mod-primary">Set WIP</button>');
            button.click(async function () {
                await SetListSoftLimit(list.id, $('#' + inputId).val());
            });

            var spanButton = $('<td>');
            spanButton.append(button);

            listDiv.append(spanListName);
            listDiv.append(spanInput);
            listDiv.append(spanButton);

            listsDiv.append(listDiv);
        }

        listsDiv.replaceWith(listsDiv);
    }
    catch (err) {
        var errorDiv = $('#errorId');
        errorDiv.html(JSON.stringify(err));
        return;
    }
});