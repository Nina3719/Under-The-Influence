historyLine();
function historyLine(){

// Set the dimensions of the canvas / graph
    var margin = {top: 30, right: 20, bottom: 70, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

// Adds the svg canvas
    var svg = d3.select("#history-line")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Create y label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("class", "label")
        .attr("font-size","12px")
        .attr("fill","#6F7B7F")
        .attr("x", 0)
        .attr("y", -25)
        .text("Average per capita alcohol consumption (Liters)")
        .attr("transform", function (d) {
            return "rotate(-90)"
        });;


// Parse the date / time
    var parseDate = d3.timeParse("%Y");

// Set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

// Define the line
    var consumptionLine = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.consumption); })
        .curve(d3.curveMonotoneX);


// Get the data
    d3.csv("./data/history-line.csv").then(function(data) {

        data.forEach(function(d) {
            d.year = parseDate(d.year);
            d.consumption = +d.consumption;
        });
        console.log(data)

        let slicedData = data.slice(84)
        console.log(slicedData)

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.year; }));
        y.domain([0, d3.max(data, function(d) { return d.consumption; })]);

        // Group the entries by symbol
        let dataNest = Array.from(
            d3.group(data, d => d.country), ([key, value]) => ({key, value})
        );
        // console.log(dataNest)

        let bisectDate = d3.bisector(d=>d.year).left;


        // set the colour scale
        let color = d3.scaleOrdinal(["#286CFF","#6F7B7F","#DC9464","#274f53ff",
            "#DE4C44", "#5D7869", "#215a30", "#88765E",
            "#F18350", "#FA8072", "#191919ff", "#6C9630",
            "#994423", "#D6364E", "#f93700ff"]);

        let legendSpace = width/dataNest.length; // spacing for the legend


        // let mouse = false;
        // let lastCoordinate = -1;
        // let drawData = [];

        // US Part Data
        let displayData = slicedData.slice(0, 3);
        let firstUS = svg.append("path")
            .attr('class','historyinitline')
            // .attr('id','USStartLine')
            .datum(displayData)
            .attr("d", consumptionLine)
            .attr("fill", "none")
            .attr("id", "display")
            .attr('stroke',"#f93700ff")
            .attr('stroke-width',2);

        svg.append("text")
            .attr('class','historyinitlinetext0')
            .attr('x',200)
            .attr('y',500)
            .text("Draw the rest of the trend line here.");

        // All US Data
        let allUS = svg.append("path")
            .attr('class','historyinitline2')
            .datum(slicedData)
            .attr("d", consumptionLine)
            .attr("fill", "none")
            .attr("id", "display")
            .attr('stroke',"#f93700ff")
            .attr('stroke-width',2)
            .attr('display','none');

        svg.append("text")
            .attr('class','historyinitlinetext1')
            .attr('x',500)
            .attr('y',500)
            .text("The US's overall trend is very stable over the years.")
            .attr('display','none');

        svg.append("text")
            .attr('class','historyinitlinetext2')
            .attr("x", 500)
            .attr("y", 530)
            .text('Click the "Show All Actual" button to reveal all country trend.')
            .attr('display','none');


        $("#history-line-button").click(showUS);

        function showUS(){
            $(".historyinitline").fadeOut(500);
            $(".historyinitlinetext0").fadeOut(500);
            $(".historyinitline2").fadeIn(500);
            $(".historyinitlinetext1").fadeIn(1200);
            $(".historyinitlinetext2").fadeIn(1200);

            $("#history-line-action").html('Click the button again ("Show All Actual") to reveal all country trend.');

            $("#history-line-button").html('Show All Actual');
            $("#history-line-button").click(showCorrect);
        }

        function showCorrect() {
            $(".historyinitline2").fadeOut(500);
            $(".historyinitlinetext1").fadeOut(500);
            $(".historyinitlinetext2").fadeOut(500);
            $(".history-line-action-all").remove();


            // Loop through each symbol / key
            dataNest.forEach(function(d,i) {
                //console.log(d.value)

                svg.append("path")
                    .attr("class", "trendlines")
                    .style("stroke", function() { // Add the colours dynamically

                        return d.color = color(d.key); })
                    .attr("stroke-width", 3)
                    .style("fill","none")
                    .style("opacity", 0.2)
                    .attr("id", 'tag'+d.key.replace(/\s+/g, '')) // assign an ID
                    .attr("d", consumptionLine(d.value));

                // Add the Legend
                svg.append("text")
                    .attr("class", "trendlines-legend-text")
                    .attr("x", (legendSpace/2)+i*legendSpace)  // space legend
                    .attr("y", height + (margin.bottom/2)+ 5)
                    .attr("class", "legend")    // style the legend
                    .style("fill", function() { // Add the colours dynamically
                        return d.color = color(d.key); })
                    .style('font-weight','bold')
                    .style('text-decoration','underline')
                    .on("click", function(){
                        // Determine if current line is visible
                        var active   = d.active ? false : true,
                            newOpacity = active ? 1 : 0.3;
                        // Hide or show the elements based on the ID
                        d3.select("#tag"+d.key.replace(/\s+/g, ''))
                            .transition().duration(300)
                            .style("opacity", newOpacity);
                        // Update whether or not the elements are active
                        d.active = active;
                    })
                    .text(d.key);

            });
            $("#history-line-button").css('opacity','0');
            $("#trend-text-reveal").css('display','block');



            // Create country label
            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#286CFF")
                .attr("x", 10)
                .attr("y", 420)
                .text("Australia")
                .attr('fill-opacity',0.5)
                .attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#286CFF")
                .attr("x", 920)
                .attr("y", 400)
                .text("Australia")
                .attr('fill-opacity',0.5)
                .attr('display','none');

            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#6F7B7F")
                .attr("x", 10)
                .attr("y", 360)
                .text("Austria")
                .attr('fill-opacity',0.5)
                .attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#6F7B7F")
                .attr("x", 920)
                .attr("y", 280)
                .text("Austria")
                .attr('fill-opacity',0.5)
                .attr('display','none');

            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#DC9464")
                .attr("x", 10)
                .attr("y", 350)
                .text("Belgium")
                .attr('fill-opacity',0.5)
                .attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#DC9464")
                .attr("x", 920)
                .attr("y", 310)
                .text("Belgium")
                .attr('fill-opacity',0.5)
                .attr('display','none');

            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#274f53ff")
                .attr("x", 10)
                .attr("y", 500)
                .text("Canada")
                .attr('fill-opacity',0.5)
                .attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#274f53ff")
                .attr("x", 920)
                .attr("y", 430)
                .text("Canada")
                .attr('fill-opacity',0.5)
                .attr('display','none');

            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#DE4C44")
                .attr("x", 10)
                .attr("y", 480)
                .text("Denmark")
                .attr('fill-opacity',0.5)
                .attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#DE4C44")
                .attr("x", 920)
                .attr("y", 390)
                .text("Denmark")
                .attr('fill-opacity',0.5)
                .attr('display','none');

            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#5D7869")
                .attr("x", 10)
                .attr("y", 0).attr('fill-opacity',0.5)
                .text("France").attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#5D7869")
                .attr("x", 920)
                .attr("y", 345).attr('fill-opacity',0.5)
                .text("France").attr('display','none');

            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#5D7869")
                .attr("x", 10)
                .attr("y", 290).attr('fill-opacity',0.5)
                .text("Germany").attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#5D7869")
                .attr("x", 920)
                .attr("y", 320).attr('fill-opacity',0.5)
                .text("Germany").attr('display','none');

            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#88765E")
                .attr("x", 10)
                .attr("y", 150).attr('fill-opacity',0.5)
                .text("Italy").attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#88765E")
                .attr("x", 920)
                .attr("y", 455).attr('fill-opacity',0.5)
                .text("Italy").attr('display','none');

            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#F18350")
                .attr("x", 10)
                .attr("y", 535).attr('fill-opacity',0.5)
                .text("Japan").attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#F18350")
                .attr("x", 920)
                .attr("y", 480).attr('fill-opacity',0.5)
                .text("Japan").attr('display','none');

            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#FA8072")
                .attr("x", 10)
                .attr("y", 555).attr('fill-opacity',0.5)
                .text("Netherlands").attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#FA8072")
                .attr("x", 920)
                .attr("y", 410).attr('fill-opacity',0.5)
                .text("Netherlands").attr('display','none');


            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#191919ff")
                .attr("x", 10)
                .attr("y", 545).attr('fill-opacity',0.5)
                .text("Norway").attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#191919ff")
                .attr("x", 920)
                .attr("y", 445).attr('fill-opacity',0.5)
                .text("Norway").attr('display','none');

            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#6C9630")
                .attr("x", 10)
                .attr("y",490).attr('fill-opacity',0.5)
                .text("Sweden").attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#6C9630")
                .attr("x", 920)
                .attr("y",465).attr('fill-opacity',0.5)
                .text("Sweden").attr('display','none');

            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#994423")
                .attr("x", 10)
                .attr("y",300).attr('fill-opacity',0.5)
                .text("Switzerland").attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#994423")
                .attr("x", 920)
                .attr("y",370).attr('fill-opacity',0.5)
                .text("Switzerland").attr('display','none');

            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#D6364E")
                .attr("x", 10)
                .attr("y",470).attr('fill-opacity',0.5)
                .text("UK").attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#D6364E")
                .attr("x", 920)
                .attr("y",380).attr('fill-opacity',0.5)
                .text("UK").attr('display','none');

            svg.append("text")
                .attr("text-anchor", "start")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#f93700ff")
                .attr("x", 10)
                .attr("y",460).attr('fill-opacity',0.5)
                .text("US").attr('display','none');
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","12px")
                .attr("fill","#f93700ff")
                .attr("x", 920)
                .attr("y",420).attr('fill-opacity',0.5)
                .text("US").attr('display','none');

            $(".label").fadeIn(2000);
        }

        // Add the X Axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));



    });


}