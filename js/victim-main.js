// Variables for the visualization instances
let victimStory, victimTooltip;

// Start application by loading the data

let victimPromises = [
    d3.csv("data/victim-data.csv"),
];

Promise.all(victimPromises).then((values) =>{

    victimInitMainPage(values[0]);
})

function victimInitMainPage(victimData){

    // init victim story
    victimStory = new VictimStory('victim-field',victimData);
}


