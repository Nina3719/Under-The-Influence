
$(document).ready(function(){

    var arr = [
        '"I had to change – or else I’d die."',
        '"Life felt toxic. I remember feeling an intense lack of passion,purpose or direction and drinking became my distraction."',
        '"I feel unstoppable. Getting sober was more than just giving up alcohol for me. It meant getting out of my own way and having the willpower and courage to live each and every day as my best self."',
        '"I have gained far more this year than I have lost by quitting alcohol."'
    ];

    var arr2 = [
        "https://happiful.com/i-had-to-change-or-else-id-die-sams-story/",
        "https://www.smh.com.au/lifestyle/health-and-wellness/the-aha-moment-that-made-me-quit-booze-seven-years-ago-20201012-p5648t.html",
        "https://omaha.com/opinion/columnists/leia-baez-a-year-sober-able-to-help-others-and-feeling-unstoppable/article_4934f7f1-d1d7-57ea-8dd8-2026d4456753.html",
        "https://www.abc.net.au/life/a-year-after-i-quit-booze-this-is-what-has-changed/11843642"
    ];

    var arr3 = [
        "Read Sam's Story",
        "Read Odette's Story",
        "Read Leia's Story",
        "Read Flip's Story"
    ];
    // index;
    var index = 0;
    if ($('#initNum').text() === "0"){
        index = 1;
    }
    else if ($('#initNum').text() === "1"){
        index = 2;
    }
    else if ($('#initNum').text() === "2"){
        index = 3;
    }
    else if ($('#initNum').text() === "3"){
        index = 4;
    }

    console.log(index)
    $('.container').click(function(){
        $('#storytitle').html(arr[index]);
        $('#storylink').attr("href", arr2[index]).html(arr3[index]);
        index = (index + 1) % arr.length ;
    });
});
