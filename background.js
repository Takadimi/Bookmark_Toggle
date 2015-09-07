function removePreviouslySelectedBookmarks(bookmark_folder) {
    chrome.bookmarks.getTree(function(tree_result) { // Gets ROOT bookmark tree
        var bookmarks_bar = tree_result[0].children[0]; // Pulls out bookmarks bar as that is what we want as our relative root bookmark tree

        chrome.bookmarks.search({'title': bookmark_folder}, function(search_results) { // Find bookmark folder matching 'Personal' or 'Work'
            chrome.bookmarks.getChildren(search_results[0].id, function(children) { // Get array of child bookmarks from selected bookmark folder
                for (var i = 0; i < bookmarks_bar.children.length; i++) {
                    var bookmarks_bar_child = bookmarks_bar.children[i];
                    for (var j = 0; j < children.length; j++) {
                        if (bookmarks_bar_child.title == children[j].title && bookmarks_bar_child.url == children[j].url) {
                            // Remove bookmark as it matches bookmark in old selected folder
                            chrome.bookmarks.remove(bookmarks_bar_child.id);
                        }
                    }
                }
            });
        });
    });
}

function displaySelectedBookmarks(bookmark_folder) {
    chrome.bookmarks.search({'title': bookmark_folder} , function(results) {
        chrome.bookmarks.getChildren(results[0].id, function(children) {
            chrome.bookmarks.getTree(function(tree_result) {
                var bookmarks_bar = tree_result[0].children[0];

                for (var i = 0; i < children.length; i++) {
                    chrome.bookmarks.create({"parentId": bookmarks_bar.id,
                                             "index": i + 1,
                                             "title": children[i].title,
                                             "url": children[i].url});                 
                }

                isToggling = false; // Toggling completed
            });
        });
    });
}

// Global for making sure script is done before toggle is attempted again
var isToggling = false;

chrome.browserAction.onClicked.addListener(function(tab) {
    if (isToggling) {
        console.log("NOTICE: Trying to toggle before previous action finished. Ignoring...");
        return;
    }

    isToggling = true;

    chrome.storage.sync.get('toggle_state', function(items) {
        var currToggleState = items["toggle_state"];
        var newToggleState;

        if (currToggleState === 'Personal') {
            newToggleState = 'Work';
        } else {
            newToggleState = 'Personal';
        }

        removePreviouslySelectedBookmarks(currToggleState);

        chrome.storage.sync.set({"toggle_state": newToggleState}, function() {
            displaySelectedBookmarks(newToggleState);
        });
    });
});

// Instead of just assuming everything is correctly set up
// we could maybe do some checks for if the contents of either
// folder are being displayed on the bookmarks bar. If the FULL
// contents aren't on display, but a partial listing is, just 
// check if the bookmark exists before creating it again on display.