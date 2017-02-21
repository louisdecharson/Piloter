$(document).ready(function() {
    var $input = $("#input");
    $input.on('input', function() { 
        document.getElementById('output').innerHTML = marked($(this).val());
        $("blockquote").addClass('blockquote');
    });
    $input.focus();

    
    $("a.fa").mousedown(function(e) {
        e.preventDefault();

        var texte = $input.getSelection().text,
            start = $input.getSelection().start,
            end = $input.getSelection().end,
            bOL = start, // beginning of the line
            char = texte.charAt(0),
            inputVal = $input.val();
        var arr,sel,finTexte;
        
        for (bOL = start; bOL >= 0 && inputVal[bOL] != "\n"; --bOL);
        bOL++;

        switch (this.title) {
        case "Bold":
            $input.surroundSelectedText("**", "**");
            break;
        case "Italic":
            $input.surroundSelectedText("*", "*");
            break;
        case "Heading +":
            if (inputVal.charAt(bOL) === '#') {
                $input.insertText("#",bOL,"collapseToStart");
            } else {
                $input.insertText("# ",bOL,"collapseToStart");
            }
            break;
        case "Heading -":
            if (inputVal.charAt(bOL) === '#') {
                $input.deleteText(bOL,bOL+1,true);
            }
            break;
        case "Quote":
            sel = $input.getSelection();
            arr = sel.text.split(/(\n)/g);
            arr.forEach(function(el,ind) {
                if (el != '\n') {
                    el = "> "+ el;
                    arr[ind] = el;
                }
            });
            finTexte = arr.join('');
            $input.replaceSelectedText(finTexte,'collapseToEnd');
            break;
        case "List":
            sel = $input.getSelection();
            arr = sel.text.split(/(\n)/g);
            arr.forEach(function(el,ind) {
                if (el != '\n') {
                    el = "+ " + el;
                    arr[ind] = el;
                }
            });
            finTexte = arr.join('');
            $input.replaceSelectedText(finTexte,'collapseToEnd');
            break;
        case "Numbered List":
            sel = $input.getSelection();
            arr = sel.text.split(/(\n)/g);
            var i = 1;
            arr.forEach(function(el,ind) {
                if (el != '\n') {
                    el = i.toString() + ". " + el;
                    arr[ind] = el;
                    i++;
                }
            });
            finTexte = arr.join('');
            $input.replaceSelectedText(finTexte,'collapseToEnd');
            break;
        case "Insert Link":
            $input.surroundSelectedText("[","]()");
            break;
        case "Insert Image":
            $input.surroundSelectedText("![","]()");
            break;
        case "Toggle Side by Side":
            if ($('#sidebyside').hasClass('active')) {
                $('#col-input').removeClass('col-md-6');
                $('#col-input').addClass('col-md-12');
                $('#col-output').removeClass('col-md-6');
                $('#col-output').hide();
                $('#sidebyside').removeClass('active');
            } else {
                $('#col-input').removeClass('col-md-12');
                $('#col-output').removeClass('col-md-12');
                $('#col-input').addClass('col-md-6');
                $('#col-output').addClass('col-md-6');
                $('#col-output').show();
                $('#sidebyside').addClass('active');
            }
            break;
        case "Toggle Preview":
            if ($('#preview').hasClass('active')) {
                $('#col-input').show();
                $('#col-output').hide();
                $('#col-output').removeClass('col-md-12');
                $('#preview').removeClass('active');
            } else {
                $('#col-output').removeClass('col-md-6');
                $('#col-output').addClass('col-md-12');
                $('#col-input').hide();
                $('#col-output').show();
                $('#preview').addClass('active');
            }
            break;
        }
    });
    $input.focus();
});
