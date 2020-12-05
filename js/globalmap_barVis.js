

/* * * * * * * * * * * * * *
*         PieChart         *
* * * * * * * * * * * * * */


class BarVisGlobal {

    constructor(parentElement,  geoData, countryData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.countryData = countryData;
        this.initVis()

    }


    initVis(){
        let vis = this;


        // margin conventions
        vis.margin = {top: 10, right: 50, bottom: 50, left: 50};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text('Chart 1 - Ranking of Countries in Total Alcohol Consumption/year')
            .attr('transform', `translate(${vis.width / 2}, ${vis.height +30})`)
            .attr('text-anchor', 'middle');

        // add title2
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("Hover over a bar or the map to see the ranking and the map")
            .attr('transform', `translate(${vis.width / 2}, ${vis.height +45})`)
            .attr('text-anchor', 'middle')
            .style('opacity',0.8);


        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        // AXIS
        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);
        //.tickFormat(function(d) { return shortenString(d, 20); });

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis");

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");

        // Create y label
        vis.svg.append("text")
            .attr("text-anchor", "end")
            .attr("class", "label")
            .attr("font-size","8px")
            .attr("fill","#6F7B7F")
            .attr("x", 40)
            .attr("y", -3)
            .text("Liter/Capita");



        // call next method in pipeline
        this.wrangleDataStatic();
    }

    // wrangleData method
    wrangleDataStatic(){
        let vis = this;

        // console.log(vis.geoData.objects.countries.geometries)

        // create random data structure with information for each land
        vis.countryInfo = {};
        vis.geoData.objects.countries.geometries.forEach(d => {

            let countryName = d.properties.name
            // console.log(vis.countryData[countryName])
            if (vis.countryData[countryName] !== undefined) {
                vis.countryInfo[countryName] = {
                    name: countryName,
                    code: vis.countryData[countryName].code,
                    total: vis.countryData[countryName].total,
                    lastYear: vis.countryData[countryName].lastYear,
                    heavyDrinking: vis.countryData[countryName].heavyDrinking,
                    neverDrinking: vis.countryData[countryName].neverDrinking,
                    noDrinking: vis.countryData[countryName].noDrinking

                }
            } else {
                console.log("undefined: ", countryName)
            }
        })
        vis.wrangleDataResponsive()

    }

    wrangleDataResponsive(){
        let vis = this;
        vis.wrangleData();
    }


    wrangleData(){
        let vis = this;
        this.updateVis();

    }

    // updateVis method
    updateVis(){
        let vis = this;

        vis.color = d3.scaleLinear()
            .domain([0, 15.2])
            .range(["#FFD6B3", "#f93700"])

        vis.color2 = d3.scaleLinear()
            .domain([0, 100])
            .range(["#FFD6B3", "#f93700"])


        vis.info = Object.values(vis.countryInfo).filter(d=>d.total !== 0);

        vis.info.sort((a,b) => {return b.total - a.total})
        // console.log(vis.info)

        vis.x.domain(vis.info.map(d => d.code));
        vis.y.domain([0,  d3.max(vis.info, d => d.total)]);

        // ---- DRAW BARS ----
        vis.bars = vis.svg.selectAll(".bar")
            .data(vis.info);



        vis.bars.enter().append("rect")
            .attr("class", "bar")
            .merge(vis.bars)

            .on('mouseover', function (event, d) {
                d3.select(this)
                    .attr('stroke-width', '1.5px')
                    .attr('stroke', 'rgba(187,88,85)')
                    .attr('fill', d => d.total <= 6.4 ? "grey": "black")
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                    <div>
                    <h3>${d.name}<h3>
                    <h4>${d.total} Liter per Capita<h4>
                    </div>`);

                selection = d.name;
                myMapVisGlobal.updateVis();
                myBarVisGroupGlobal.updateVis();
            })
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr('fill', function (d){
                        return vis.color(d.total)
                    })
                //.attr("fill", d => vis.color(d[selectedCategory]))
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);

                selection = "";
                myMapVisGlobal.updateVis();
                myBarVisGroupGlobal.updateVis();
            })
            .transition().duration(300)
            .attr('x', d=> vis.x(d.code))
            .attr("y", d => vis.y(d.total))
            .attr("width", vis.x.bandwidth())
            .attr("height",  d => (vis.height - vis.y(d.total)))
            // .attr("fill", function (d){
            //     return vis.color(d[selectedCategory])
            // });
            .attr("fill", function (d){
                if (d.name !== selection){
                    return vis.color(d.total)
                }
                else {
                    if (d.total <= 6.4){
                        return "grey"
                    }
                    else {
                        return "black"
                    }

                }

            });


        // Create average line
        vis.average = vis.svg.append("line")
            .attr("x1",0)
            .attr("y1",60)
            .attr("x2",vis.width)
            .attr("y2",60)
            .style("stroke","grey")
            .style("stroke-width", "1")
            .style("stroke-dasharray",("5,5"));

        // Create average label
        vis.svg.append("text")
            .attr("text-anchor", "end")
            .attr("class", "label")
            .attr("font-size","12px")
            .attr("fill","#6F7B7F")
            .style("stroke-width", "0")
            .attr("x", vis.width)
            .attr("y", 75)
            .text("Internation Average: 6.4 Liter");


        vis.xAxisGroup = vis.svg.select(".x-axis")
            .attr("transform", "translate(-10," + vis.height  +  ")")
            .call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .style('opacity',0)
            .attr("transform", function(d) {
                return "rotate(-60)"
            });

        vis.yAxisGroup = vis.svg.select(".y-axis")
            .call(vis.yAxis);



        vis.bars.exit().remove();

    }
}