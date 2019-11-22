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

        var listsDiv = $('#listsDivId');
        listsDiv.html('');

        for (var i = 0; i < lists.Length; ++i) {
            var list = lists[i];

            var listDiv = $('<div>');
            listDiv.attr('listId', list.id);

            var spanListName = $('<span>');
            spanListName.text(list.name);
            var spanInput = $('<span><input type="text" style="width: 40px"></span>');
            var spanButton = $('<span> <button class="mod-primary">Set WIP</button></span>');

            listDiv.append(spanListName);
            listDiv.append(spanInput);
            listDiv.append(spanButton);

            listsDiv.append(listDiv);
        }

        listsDiv.replaceWith(listsDiv);
    }
    catch (err) {
        ico.attr('src', RED_ICON);
        var errorDiv = $('#' + prefix + 'ErrorId');
        errorDiv.html(JSON.stringify(err));
        return;
    }
});