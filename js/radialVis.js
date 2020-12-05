// Globals
let polarAreaChart;

//create Vis1:
let polarPromise = [
    d3.csv('data/mental-health.csv')
];

Promise.all(polarPromise)
    .then( function(data){ initRadialPage(data) })
    .catch( function (err){console.log(err)} );


// initMainPage
function initRadialPage(dataArray) {
    polarAreaChart = new PolarAreaChart('polar-area-chart', dataArray[0]);
}

