function find() {
    // var fetchUrl = "../wordle_words.txt";
    var fetchUrl = "../wordle_answers.txt";
    fetch(fetchUrl)
        .then(res => res.text())
        .then(dict => findWithDict(dict.split(/\r?\n/)));
}

function findWithDict(dict) {
    if(!stringParam("search") || stringParam("search").length == 0) {
        return false
    }
    searchWord = stringParam("search");
    
    result = {}
    dict.forEach(word => {
        pattern = assess(word, searchWord).map(letter => letter[1]).join('');
        console.log(pattern)
        pattern = pattern.replaceAll('correct','🟩').replaceAll('present','🟨').replaceAll('absent','⬛')
        result[pattern] ??= [];
        result[pattern].push(word);
    })

    result = Object.entries(result).sort((a, b) => b[1].length - a[1].length);
    console.log(result)
    result = result.map(word => `<h2>${word[0]} [${word[0].replaceAll('🟩','c').replaceAll('🟨','p').replaceAll('⬛','a')}] ${word[1].length} ${word[1]}</h2>`);

    $('#results').html(result.join(''));
}

// result = {}
// 'qwertyuiopasdfghjklzxcvbnm'.split('').forEach(letter => 
//     result[letter] = (dictionary.match(new RegExp(letter), 'gm') || []).length
// )
// result