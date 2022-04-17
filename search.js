function search() {
    var fetchUrl;
    switch(stringParam("dict")) {
        default:
        case "wiktionary":
            fetchUrl = "wikitionary_30k_words.txt";
            break;
        case "wordle": 
            fetchUrl = "wordle_words.txt";
            break;
        case "full":
            fetchUrl = "words.txt"
            break;
    }
    // const dict = fetch(fetchUrl).then(res => res.text().split('\n'));
    fetch(fetchUrl)
        .then(res => res.text())
        // .then(res => res.split('\n'))
        // .then(res => res.text().split('\n'))
        .then(dict => searchWithDict(dict.split(/\r?\n/)));
}

function searchWithDict(dict) {
    if(!stringParam("search") || stringParam("search").length == 0) {
        return false
    }
    searchString = stringParam("search");
    
    regex = '';
    usedBackreferences = [];
    nextCharIsEscaped = false;
    // Create a regular expression based on input:
    for (let i = 0; i < searchString.length; i++) {
        const letter = searchString[i];
        if(nextCharIsEscaped) {
            regex += letter;
            nextCharIsEscaped = false;
        }
        else if(letter == '\\') {
            nextCharIsEscaped = true;
        }
        else if(letter == "_") {
            regex += '.';        // If unknown character: append wildcard to regex
        }
        else if(!isNaN(letter) && letter < 10) {       // Check if Number
            console.log(letter);
            if(!usedBackreferences.includes(letter)) { // If unused number: create a new backreference
                if(checkboxParam("uniqueunknowns") & letter > 1){  // If unique unknowns is enabled: create negative backreference lookaheads to make sure no other backreferences are identical
                    for(j = letter - 1; j > 0; j--) {
                        regex += '(?!\\' + j + ')';
                    }
                }
                regex += '(.)';
                
                usedBackreferences.push(letter);        // Add to list of used numbers
            } else {
                regex += '\\' + letter;                // If previously used number: refer to relevant backreference.
            }
        }
        else { regex += letter; }                      // Otherwise (if normal letter): append character to regex 

    };

    // regex = str_replace(array_slice(badChars, 1, 2), array_slice(replacementChars, 1, 2), regex);
    // Assembling full regex based on extra parameters:
    regex = 
          (checkboxParam("leadingchars") ? '' : '^')     // Beginning tail
        + regex
        + (checkboxParam("trailingchars") ? '' : '$')     // End tail
    
    
    // Add case insensitivity flag unless case sensitivity is specified.
    regex = new RegExp(regex, checkboxParam("casesensitive") ? '' : 'i');

    result = dict.filter(word => regex.test(word));
    
    // Show regex
    if(checkboxParam("showregex")){
        $('#regex').html(regex);
    };

    // Filter for word length if specified and greater than 0
    if(stringParam("maxlen")) { result = result.filter(word => word.length <= parseInt(stringParam("maxlen")))}
    if(stringParam("minlen")) { result = result.filter(word => word.length >= parseInt(stringParam("minlen")))}

    result = result.map(word => `<h2>${word}</h2>`);
    
    $('#results').html(result.join(''));
}

urlParams = new URLSearchParams(window.location.search);

function checkboxParam(param) {
    param = param.toLowerCase();
    if($(`input[type=checkbox]#${param}`).length) {
        return urlParams.get(param) !== null;
    }
    return false;
}
function stringParam(param) {
    return urlParams.get(param);
}

function toggleOptions() {
    var options = document.getElementById("options");
    var checkboxes = document.getElementById("checkboxes");
    
    options.checked = !options.checked;
    checkboxes.style.display = options.checked ? 'block' : 'none';
}

function processURL() {
    $('input').each((_, option) => {
        switch($(option).attr("type")) {
            case "checkbox":
                $(option).prop("checked", checkboxParam($(option).attr("id"))).change();
                break;
            case "radio":
                $(option).prop("checked", stringParam($(option).attr("name")) == $(option).attr("id"));
                break;
            case "number":
            case "text":
                $(option).val(stringParam($(option).attr("id")));
        }
    });
    if(checkboxParam("options")) {
        $('#checkboxes')[0].style.display = "block";
    }
}