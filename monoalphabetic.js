function decode() {
    fetchUrl = "wikitionary_30k_words.txt";
    fetch(fetchUrl)
        .then(res => res.text())
        .then(dict => decodeWithDict(dict.split(/\r?\n/)));
}
function decodeWithDict(dict) {

    if(!stringParam("decrypt")) {
        return false;
    }
    
    var rawInput = stringParam("decrypt")
    var input = rawInput
        .replace(/[\.,?!;:]/g, "")
        .split(" ")

    // # take input and sort words by length 
    // # (should be a good enough estimate for complexity)
    console.log(JSON.stringify(input));
    var input = input.sort((a,b) => b.length - a.length);
    console.log(JSON.stringify(input));
    
    result = decryptNextWord(input,  {}, 0);
    console.log(result)
    function decryptNextWord(input, _cipherMap, depth) {
        var cipherMap = deepCopy(_cipherMap);
        
        // # replace possibly known letters
        currentWord = unMap(input[depth], cipherMap);
        console.log(input, currentWord);
        // console.log(input[depth]);
        // console.log({cipherMap, currentWord});
        
        // # find potential word
        // foreach??
        var regex = '';
        var charsSeenInCurrentWord = [];
        for(i = 0; i < currentWord.length; i++){
            var letter = currentWord[i]

            if(/[a-z]/.test(letter)){   // if lowercase, append and ignore
                regex += letter;
                
            } else if(charsSeenInCurrentWord.includes(letter)) { // if previously seen char, add backreference corresponding to array pos + 1.
                regex += '\\' + (charsSeenInCurrentWord.indexOf(letter) + 1);
                
            } else {    // If unseen, add grouped wildcard prefaced with negative lookaheads.
                charsSeenInCurrentWord.push(letter);
                if(Object.keys(cipherMap).length > 0) {
                    regex += `(?![${escapeRegexChars(Object.values(cipherMap).join(''))}])`;
                }
                for(j = charsSeenInCurrentWord.length - 1; j > 0; j--) { 
                    regex += '(?!\\' + j + ')';
                }
                regex += '([a-z])';
            }
        }
        
        regex = new RegExp(`\\b${regex}\\b`, 'i');
        var foundWords = dict.filter(word => regex.test(word));
        console.log({regex, foundWords});
        // # for each found word
        for (const potentialWord of foundWords) {
            
            // # add to lists of possibly known characters
            potentialCipherMap = deepCopy(cipherMap);
            for (i = 0; i < currentWord.length; i++) { 
                var letter = currentWord[i];
                if(!Object.keys(potentialCipherMap).includes(letter)) {
                    if(letter !== potentialWord[i]) {
                        console.log(currentWord, input[depth], potentialWord, potentialCipherMap);
                        potentialCipherMap[letter] = potentialWord[i];
                    }
                }
            }
            
            // # if end of sentence: return found chars.
            if(depth == input.length-1) {
                console.log(potentialCipherMap);
                return potentialCipherMap;
            }
            // #  run self, inlcuding new list of possibly found chars
            potentialCipherMap = decryptNextWord(input, potentialCipherMap, depth + 1);
            if(potentialCipherMap != null) {
                return potentialCipherMap;
            }
        }
        // # if no words are found: return null
        return;

    }
    
    $('#results').html("<h3>" + result + "</h3>");
    console.log(rawInput, result)
    $('#results').append("<h3>" + unMap(rawInput, result) + "</h3>");
}