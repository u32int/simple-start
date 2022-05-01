/*  -- configuration --

Define all the shortcuts that appear on the page and the corresponding shortcut key.
The layout must look like this:
    (...)
    "{Category_name}": {
        "trigger": "{key_to_activate_category}",
        "{website_key}": "https://example.com",
        (...)
    },
    (...)
*/
const shortcuts = {
    "Social": {
        "trigger": "o",
        "y": "https://youtube.com",
        "t": "https://twitter.com",
    },
    "Search": {
        "trigger": "s",
        "d": "https://duckduckgo.com",
        "g": "https://google.com",
    },
    "Wiki": {
        "trigger": "w",
        "w": "https://wikipedia.org",
    },
    "Dev": {
        "trigger": "d",
        "g": "https://github.com",
    },
}

// Hide or show the category name during the shortcut sequence.
// default - true
var shortcut_show_category_name = true;

// How many categories per row should be displayed in the always visible center
// table. (works well with 3 by default and 4 with more elements.)
// default - 3
var categories_per_row = 3;

// Hide or show the shortcut trigger in the center table.
// default - false
var show_shortcut_trigger_in_name = false

// Specify the length of the fade in animation in seconds.
// Setting it to zero disables the animation.
// default - 2
var fade_in_animation_length = 2;

// -- Themes --
const themes = {
    "default-blue": {
        "background": "#181a1b",
        "center-background": "#1a1a1a",
        "primary": "#007b9a",
        "text": "#c4c4c4",
        "shadow": "#0e0e0e",
        "center-img": "default-dark.jpg",
    },
    "default-darker": {
        "background": "#181a1b",
        "center-background": "#1a1a1a",
        "primary": "#707070",
        "text": "#c4c4c4",
        "shadow": "#0e0e0e",
        "center-img": "default-darker.jpg",
    },
    // https://en.wikipedia.org/wiki/Solarized
    "solarized-dark": {
        "background": "#002b36",
        "center-background": "#073642",
        "primary": "#eee8d5",
        "text": "#839496",
        "shadow": "#001a21",
        "center-img": "solarized-dark.jpg",
    },
    "solarized-light": {
        "background": "#fdf6e3",
        "center-background": "#eee8d5",
        "primary": "#586e75",
        "text": "#657b83",
        "shadow": "#615e57",
        "center-img": "solarized-light.jpg",
    },
}

// current selected theme
theme = themes["solarized-light"];


// -- END configuration --

// Globals
var selected_layer;


function tableclear(thead, tbody) {
    thead.rows[0].remove();
    tbody.rows[0].remove();
    thead.insertRow();
    tbody.insertRow();
}

function showHelpMenu(thead, tbody) {
    tableclear(thead, tbody);
    thead_trow = thead.rows[0];
    tbody_trow = tbody.rows[0];

    let helptext = thead_trow.insertCell();
    helptext.setAttribute("colspan", "100");
    helptext.outerHTML = "<td> ? Help </td>";

    for (const key in shortcuts) {
        let newcell = tbody_trow.insertCell();
        text = document.createTextNode(shortcuts[key].trigger + ": " + key);
        newcell.appendChild(text);
    }
}

// Returns true if shortcut exists
function showModetable(input_key, thead, tbody) {
    tableclear(thead, tbody);
    thead_trow = thead.rows[0];
    tbody_trow = tbody.rows[0];

    var curr_shortcut, category_name = null;
    for (const key in shortcuts) {
        if (shortcuts[key].trigger == input_key) {
            curr_shortcut = shortcuts[key];
            category_name = key;
        }
    }
    // Exits the function if input_key has no corresponding trigger.
    if (!curr_shortcut) return false;

    if (shortcut_show_category_name) {
        let category_cell = thead_trow.insertCell();
        category_cell.setAttribute("colspan", "100");
        category_cell.appendChild(document.createTextNode(category_name));
    }

    for (const key in curr_shortcut) {
        if (key === "trigger" || key.endsWith("-name")) continue;
        newcell = tbody_trow.insertCell();
        let site_name = curr_shortcut[key].split("//")[1];
        // shorten "reddit.com/r/example" -> "r/example"
        site_name = site_name.replace(new RegExp("^" + "reddit.com/"), '')
        text = document.createTextNode(key + ": " + site_name);
        newcell.appendChild(text);
    }
    selected_layer = category_name;
    return true;
}

function init_links_table() {
    let links_table = document.getElementById("links");
    let prev_len = -1;
    var headrow;
    var linkrows = [];

    let curr_len = 0;
    for (category in shortcuts) {
        if (curr_len % categories_per_row == 0) {
            headrow = links_table.insertRow();
            linkrows = [];
            prev_len = -1;
        } 

        let objlen = Object.keys(shortcuts[category]).length - 1;
        let counter = 0;

        for (shortcut in shortcuts[category]) {
            if (shortcut == "trigger" || shortcut.endsWith("-name")) continue;

            let site_name;
            let site_link = shortcuts[category][shortcut];
            if ((shortcut + "-name") in shortcuts[category]) {
                site_name = shortcuts[category][shortcut + "-name"]
            } else {
                site_name = site_link.split("//")[1];
                if (site_name.startsWith("reddit.com")) {
                    // shorten "reddit.com/r/example" -> "r/example"
                    site_name = site_name.replace(new RegExp("^" + "reddit.com/"), '')
                } else {
                    site_name = site_name.split(".");
                    site_name = site_name[site_name.length-2];
                }
            }
            let row
            if (linkrows.length > counter) {
                row = linkrows[counter];
            } else {
                row = links_table.insertRow();
                linkrows.push(row);
                if (prev_len < objlen && (curr_len - 1) % categories_per_row == 0) {
                    row.insertCell().outerHTML = "<td></td>";
                    row = linkrows[counter];
                }
           }

            row.insertCell().outerHTML = "<td>" + "<a href=\"" + site_link + "\">" + site_name + "</a>" + "</td>";
            counter++;
        }

        for (let i = 0; i < prev_len - objlen; i++) {
            linkrows[counter + i].insertCell().outerHTML = "<td></td>";
        }

        let headrow_text = show_shortcut_trigger_in_name ? 
            "<th> "  + " (" + shortcuts[category]["trigger"] + ") " +  category + "</th>" :
            "<th> " + category + "</th>";

        headrow.insertCell().outerHTML = headrow_text;
        curr_len += 1;
        prev_len = objlen;
    }
}

function load_theme() {
    let center = document.getElementById("center");
    // animations
    center.style.animation = "fadein " + fade_in_animation_length + "s";
    // the image
    let img = document.getElementById("center-img");
    let imgpath = "imgs/" + theme["center-img"];
    img.setAttribute("src", imgpath);
    // colors
    center.style.boxShadow = "7px 9px 1px 1px " + theme["shadow"];
    document.body.style.backgroundColor = theme["background"];
    center.style.backgroundColor = theme["center-background"];
    // the thead
    document.getElementById("modetable").children[0].style.color = theme["primary"];
    // the tbody
    document.getElementById("modetable").children[1].style.color = theme["text"];

    let tds = document.getElementById("links").getElementsByTagName("a");
    for (i = 0; i < tds.length; i++) tds[i].style.color = theme["text"];

    let ths = document.getElementById("links").getElementsByTagName("th");
    for (i = 0; i < ths.length; i++) ths[i].style.color = theme["primary"];
}

window.onload = function() {
    init_links_table();
    load_theme();
    let mode = "normal";
    var table = document.getElementById("modetable");
    var thead = table.getElementsByTagName("thead")[0];
    var tbody = table.getElementsByTagName("tbody")[0];
    
    window.onkeydown = function(event) {
        let key = event.key;
        switch (mode) {
            case "normal":
                if (key == "?") {
                    showHelpMenu(thead, tbody);
                    break;
                }
                if (showModetable(key, thead, tbody)) {
                    mode = "go";
                }
                break;
            case "go":
                if (key == "Escape") {
                    tableclear(thead, tbody);
                    mode = "normal";
                    break; 
                }
                if (key in shortcuts[selected_layer]) {
                    window.location.href = shortcuts[selected_layer][key];
                } else {
                    tableclear(thead, tbody);
                    mode = "normal";
                }
                break;
        }
    };
};   
