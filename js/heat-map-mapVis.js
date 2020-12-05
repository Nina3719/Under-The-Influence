// Variable for the visualization instance
let heatMap;

let heatmapTutorialCounter = 0 ;

// load data
//let countyGeo = [];
let countyData = [];
let stateData = [];
let contourParameter = [];
let majorCities = [];
let heatPromises = [
    //d3.json("data/countyMap.json"),
    d3.csv("data/countyAll-Main.csv"),
    d3.csv("data/stateAll-Main.csv"),
    d3.csv("data/contourParameter.csv"),
    d3.csv('data/major-cities.csv')
];
Promise.all(heatPromises).then((values) => {
    //countyGeo = values[0].features;
    for(let i=0; i < values[0].length; i++){
        let latitude = parseFloat(values[0][i].Latitude.slice(1,-1));
        let longitude = parseFloat(values[0][i].Longitude.slice(1,-1));

        countyData.push(
            {
                FIPS: parseInt(values[0][i].FIPS),
                State: values[0][i].State,
                County: values[0][i].County,
                ExcessiveDrinking: parseInt(values[0][i].ExcessiveDrinking),
                AlcoholDrivingDeath: parseInt(values[0][i].AlcoholDrivingDeath),
                TotalDrivingDeath: parseInt(values[0][i].TotalDrivingDeath),
                PercentageDrivingDeath: parseInt((parseInt(values[0][i].AlcoholDrivingDeath)/parseInt(values[0][i].TotalDrivingDeath))*100),
                Latitude: latitude,
                Longitude: 0-longitude
            }
        )
    }

    for(let i=0; i < values[1].length; i++){

        let latitude = parseFloat(values[1][i].Latitude);
        let longitude = parseFloat(values[1][i].Longitude);

        stateData.push(
            {
                FIPS: parseInt(values[1][i].FIPS),
                State: values[1][i].State,
                ExcessiveDrinking: parseInt(values[1][i].ExcessiveDrinking),
                AlcoholDrivingDeath: parseInt(values[1][i].AlcoholDrivingDeath),
                TotalDrivingDeath: parseInt(values[1][i].TotalDrivingDeath),
                PercentageDrivingDeath: parseInt((parseInt(values[1][i].AlcoholDrivingDeath)/parseInt(values[1][i].TotalDrivingDeath))*100),
                Latitude: latitude,
                Longitude: longitude
            }
        )
    }

    for(let i=0; i < values[2].length; i++){
        contourParameter.push(
            {
                State: values[2][i].State,
                BandwidthDrink: parseInt(values[2][i].BandwidthDrink),
                ThresholdDrink: parseInt(values[2][i].ThresholdDrink),
                BandwidthDriv: parseInt(values[2][i].BandwidthDriv),
                ThresholdDriv: parseInt(values[2][i].ThresholdDriv)
            }
        )
    }

    for(let i=0; i < values[3].length; i++){

        let latitude = parseFloat(values[3][i].Latitude);
        let longitude = parseFloat(values[3][i].Longitude);

        if (values[3][i].State !== 'Alaska' && values[3][i].State !== 'Hawaii' && values[3][i].Ranking == 1){
            majorCities.push(
                {
                    State: values[3][i].State,
                    City: values[3][i].City,
                    Latitude: latitude,
                    Longitude: longitude,
                    Ranking: values[3][i].Ranking
                }
            )
        }
    }

    initHeatMapPage(countyData, stateData, contourParameter,majorCities);
})


// initMainPage(countyData)
function initHeatMapPage(countyData, stateData, contourParameter,majorCities){

    //console.log;
    // console.log('county',countyData);
    // console.log('state',stateData);
    // console.log('contour', contourParameter);

    // init map
    heatMap = new HeatMapVis('heat-map', countyData, stateData, contourParameter,majorCities);

}

// responsive heat map based on selection change
function selectionChange(){
    heatMap.wrangleData();
    heatMap.hideTutorial();
}

// show answers for the interactive text
function showAnswerOne(){
    heatMap.showAnswerOne();
}
function showAnswerTwo(){
    heatMap.showAnswerTwo();
}
function showAnswerThree(){
    heatMap.showAnswerThree();
}
function showAnswerFour(){
    heatMap.showAnswerFour();
}
function showAnswerFive(){
    heatMap.showAnswerFive();
}
function showAnswerSix(){
    heatMap.showAnswerSix();
}
function showAnswerSeven(){
    heatMap.showAnswerSeven();
}
function showAnswerEight(){
    heatMap.showAnswerEight();
}
function showAnswerNine(){
    heatMap.showAnswerNine();
}
function showAnswerTen(){
    heatMap.showAnswerTen();
}
function showHeatmapTutorial(){

    if(heatmapTutorialCounter == 0){
        heatmapTutorialCounter = heatmapTutorialCounter + 1;

        heatMap.showTutorial();

        document.getElementById('heatmap-tutorial').innerHTML = 'Got it!';
    }else if(heatmapTutorialCounter%2 !== 0){
        heatmapTutorialCounter = heatmapTutorialCounter + 1;
        heatMap.hideTutorial();
        document.getElementById('heatmap-tutorial').innerHTML = 'Show me how to navigate!';
    }else{
        heatmapTutorialCounter = heatmapTutorialCounter + 1;
        heatMap.showTutorial();
        document.getElementById('heatmap-tutorial').innerHTML = 'Got it!';
    }

}



