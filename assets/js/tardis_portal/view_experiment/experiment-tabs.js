/* eslint global-strict: 0, strict: 0, object-shorthand: 0 */
/* global s */

import { expSharingAjaxReady } from "./share/share.js";

export function populateExperimentTabs() {
    var loadingHTML = "<img src=\"/static/images/ajax-loader.gif\"/><br />";
    var tabIdPrefix = "experiment-tab-";

    function getTabIdFromName(tabName) {
        return tabIdPrefix + tabName;
    }

    function getTabNameFromId(tabId) {
        return s.strRight(s.lstrip(tabId, "#"), tabIdPrefix);
    }

    // Create new tab content panes programatically
    // Note: We're doing this before the bottom of the document has loaded!
    $("#experiment-tabs li a").each(function(i, v) {
        // Generate an ID for each tab
        var tabName = s.trim(s.dasherize($(v).attr("title") || i), "_-");
        // Grab the link HREF, then replace with the ID
        var url = $(v).attr("href");
        $(v).attr("href", "#" + getTabIdFromName(tabName));

        // Create and insert content pane (if not preloaded)
        var tabContents;
        if ($("#" + getTabIdFromName(tabName)).length === 0) {
            tabContents = $("<div></div>")
                .attr("id", getTabIdFromName(tabName))
                .addClass("tab-pane");
            tabContents.html(loadingHTML);
            $(".tab-content").append(tabContents);
        } else {
            tabContents = $("#" + getTabIdFromName(tabName))
                .addClass("tab-pane")
                .addClass("preloaded");
        }

        // Set up reload for the tab pane
        $("#" + getTabIdFromName(tabName)).on("experiment-change", function() {
            var tabPane = $(this);

            // Skip loading if already loaded
            if (tabPane.hasClass("preloaded")) {
                tabPane.removeClass("preloaded");
                return;
            }

            // Load content for the pane, based on the link HREF
            $.ajax({
                url: url,
                dataType: "html",
                success: function(data) {
                    tabPane.html(data);
                    const tab = url.substring(url.lastIndexOf("/") + 1);
                    if (tab === "share") {
                        expSharingAjaxReady();
                    }
                }
            });
        });

        // Selected tab name
        $(v).click(function() {
            window.location.hash = getTabNameFromId($(v).attr("href"));
        });
    });

    // Trigger initial pane content loading
    $(".tab-pane").each(function() {
        var expChangeEvent = new Event("experiment-change");
        $(this)[0].dispatchEvent(expChangeEvent);
    });

    var showTabForWindowLocation = function() {
        // Get selected tab using window location
        var tabHref = "#" + tabIdPrefix + s.ltrim(window.location.hash, "#");
        var selected = $("#experiment-tabs li a[href=\"" + tabHref + "\"]");
        // Show selected tab if we have one, otherwise show the first tab
        if (selected.length === 1) {
            selected.tab("show");
        } else {
            $("#experiment-tabs li a:first").tab("show");
        }
    };

    // Once the document has finished loading, we can use Bootstrap Tab plugin
    $(function() {
        // Create tabs and show first
        $("#experiment-tabs li a:last").tab();
        showTabForWindowLocation();
    });

    // Handle back and forward buttons for tab locations
    $(window).bind("hashchange", showTabForWindowLocation);
}

$(document).ready(function() {
    populateExperimentTabs();
});
