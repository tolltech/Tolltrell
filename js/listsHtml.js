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
            var input = $('<input listId="' + list.id + '" type="number" style="width: 60px"/>');
            input.val(list.softLimit || '');
            var spanInput = $('<td>');
            spanInput.append(input);
            var button = $('<button listId="' + list.id + '" class="mod-primary">Set WIP</button>');
            button.click(async function (evt) {
                var listId = evt.target.attr('listId');
                await SetListSoftLimit(listId, $('input[listId="' + listId + '"]').val());
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