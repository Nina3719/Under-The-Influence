// Globals
let matrixChart;

//create Vis1:
let promisesMatrix = [
    d3.csv('data/matrix_data.csv')
];

Promise.all(promisesMatrix)
    .then( function(data){ initMatrixPage(data) })
    .catch( function (err){console.log(err)} );


// initMainPage
function initMatrixPage(dataArray) {
    matrixChart = new MatrixChart('matrixvis', dataArray[0]);
}

function switchMatrixView() {
    matrixChart.updateChart();
}