// Variables for the visualization instances
let stackedareachart, factorTimeline, factorBarChart, storyGraph;

let countrySet = [];

let tutorialCounter = 0;

// Start application by loading the data

let deathFactorPromises = [
    d3.csv("data/deaths-by-risk-factor-ranked.csv"),
    d3.csv("data/rate-of-premature-deaths-due-to-alcohol.csv")
];

Promise.all(deathFactorPromises).then((values) =>{

    // prepare data
    parseDataForVis(values[0]);
    parseDataForVis(values[1]);

    //console.log(values[0]);
    //console.log(values[1]);

    deathFactorInitMainPage(values[0],values[1]);
    insertOptions(values[0]);
})

function parseDataForVis(data){

    let parseDate = d3.timeParse("%Y");

    // Convert Pence Sterling (GBX) to USD and years to date objects
    let preparedData = data.map(d => {
        for (let column in d) {
            if (d.hasOwnProperty(column) && column !== "Year" && column !== "Entity" && column !== "Code") {
                d[column] = parseFloat(d[column]);
            }else if(d.hasOwnProperty(column) && column === "Year") {
                d[column] = parseDate(d[column].toString());
            }
        }
    });

    return preparedData;
}

function deathFactorInitMainPage(riskFactorData, alcoholFactorData){

    // init area chart
    stackedareachart = new DeathFactorChart('stacked-area-chart',riskFactorData, alcoholFactorData);

    // init timeline
    factorTimeline = new DeathFactorTimeline('death-factor-brush',riskFactorData);

    // init bar chart
    factorBarChart = new DeathFactorBarChart('factor-bar-chart',riskFactorData);

    // init story graph
    //storyGraph = new StoryGraph('death-factor-story-graph',riskFactorData);

}

function insertOptions(riskFactorData){

    for(let i = 0; i< riskFactorData.length; i++){
        if(i%28 == 0){
            countrySet.push(riskFactorData[i].Entity);

            let selection = document.getElementById("countrySelector");
            let option = document.createElement('option');
            option.text = riskFactorData[i].Entity;
            option.value = riskFactorData[i].Entity;
            selection.add(option);
        }
    }
    console.log('insert options');

}

function brushed() {

    // TO-DO: React to 'brushed' event

    // Get the extent of the current brush
    let selectionRange = d3.brushSelection(d3.select(".brush").node());

    // Convert the extent into the corresponding domain values
    let selectionDomain = selectionRange.map(factorTimeline.x.invert);

    // Update focus chart (detailed information)
    stackedareachart.x.domain(selectionDomain);

    stackedareachart.updateVis();

}

function sortCross(){
    introGraph.sortData();
}

function deathFactorSelectionChange(){

    console.log("hi");

    if($('#countrySelector').val() == "allCountry"){
        document.getElementById("death-factor-region").innerHTML = "Worldwide";
        document.getElementById("df1").innerHTML = "8th";
        document.getElementById("df2").innerHTML = "worldwide" + '.';
        document.getElementById("df3").innerHTML = "causing more than 2.8 million premature death every year. ";
        document.getElementById("df4").innerHTML = "4.37%";
    }else{
        document.getElementById("death-factor-region").innerHTML = $('#countrySelector').val();
        document.getElementById("df2").innerHTML = 'in ' + $('#countrySelector').val() + '.';
    }

    stackedareachart.selectionChange();
    factorBarChart.selectionChange();
}

function showTutorial(){

    if(tutorialCounter%2 !== 0){
        tutorialCounter = tutorialCounter + 1;

        stackedareachart.hideTutorial();
        factorTimeline.hideTutorial();

        document.getElementById('death-page-button').innerHTML = 'Show me how to navigate!';

        //console.log('ok for tutirals')

    }else if(tutorialCounter == 0){
        tutorialCounter = tutorialCounter + 1;

        stackedareachart.showTutorial();
        factorTimeline.showTutorial();

        document.getElementById('death-page-button').innerHTML = 'Got it!';
    }else{
        tutorialCounter = tutorialCounter + 1;

        stackedareachart.showTutorial();
        factorTimeline.showTutorial();

        document.getElementById('death-page-button').innerHTML = 'Got it!';
    }

}

