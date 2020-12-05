/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables, switches, helper functions
let myBarVisGlobal,myBarVisGroupGlobal,
    myMapVisGlobal;
let selection = '';
let selectedCategory = $('#categorySelector').val();
let highlight ='';

function updateAllVisualizations() {
    myBarVisGlobal.wrangleData()
    myMapVisGlobal.wrangleData()
    myBarVisGroupGlobal.wrangleData()
}

// load data using promises
let promisesGlobal = [
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"),
    d3.json("data/global-map-data2.json"),
    d3.csv("data/global-map-data2.csv")
];

Promise.all(promisesGlobal)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// initMainPage
function initMainPage(allDataArray) {

    // log data
    // console.log(allDataArray);

    myMapVisGlobal = new MapVisGlobal('mapDiv',  allDataArray[0], allDataArray[1])
    myBarVisGlobal = new BarVisGlobal('barDiv',  allDataArray[0], allDataArray[1])
    myBarVisGroupGlobal = new BarVisGroupGlobal('barDivGroup',  allDataArray[0], allDataArray[1], allDataArray[2])

}

function categoryChange() {
    selectedCategory = $('#categorySelector').val();



    myMapVisGlobal.wrangleData();
    myBarVisGlobal.wrangleData();
    myBarVisGroupGlobal.wrangleData();
}

