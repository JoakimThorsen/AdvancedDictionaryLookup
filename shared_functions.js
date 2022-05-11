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

function toggleOptions() {
    var options = document.getElementById("options");
    var checkboxes = document.getElementById("checkboxes");
    
    options.checked = !options.checked;
    checkboxes.style.display = options.checked ? 'block' : 'none';
}

function deepCopy(input) {
    if(input == null) return null;
    if(Array.isArray(input)) {
        let result = [];
        for(let index in input) {            
            result.push(deepCopy(input[index]));
        }        
        return result;
    }
    if(typeof input == 'object') {
        let result = {};
        
        for(let [key, value] of Object.entries(input)) {
            result[key] = deepCopy(value);
        }        
        return result;
    }

    return input;
}
function unMap(inputString, map) {
    return inputString.replace(
        new RegExp(`[${Object.keys(map).join('')}]`, 'g'),
        letter => map[letter]
    )
}
function escapeRegexChars(string) {
    return string.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&");
}