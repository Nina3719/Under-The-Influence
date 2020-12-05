/* * * * * * * * * * * * * *
*         PieChart         *
* * * * * * * * * * * * * */


class BarVisGroupGlobal {

    constructor(parentElement, geoData, countryData, stackedData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.countryData = countryData;
        this.stackedData = stackedData;

        //this.colors = ['#fddbc7', '#f4a582', '#d6604d', '#b2182b']
        // this.dataCategories = Object.values(this.countryData).filter(d=>d !== "code")
        // console.log(this.dataCategories)
        this.initVis()

    }


    initVis() {
        let vis = this;


        // margin conventions
        vis.margin = {top: 10, right: 50, bottom: 50, left: 50};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom + 200)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text('Chart 2 - Ranking of Countries in Selected Category')
            .attr('transform', `translate(${vis.width / 2}, ${vis.height + 30})`)
            .attr('text-anchor', 'middle');

        // add legend color
        vis.svg.append('g')
            .append('rect')
            .attr('width','20')
            .attr('height','10')
            .attr('x','110')
            .attr('y','180')
            .attr('fill','#5D7869');
        vis.svg.append('g')
            .append('rect')
            .attr('width','20')
            .attr('height','10')
            .attr('x','480')
            .attr('y','180')
            .attr('fill','#DE4C44');
        vis.svg.append('g')
            .append('rect')
            .attr('width','20')
            .attr('height','10')
            .attr('x','110')
            .attr('y','200')
            .attr('fill','#F18350');
        vis.svg.append('g')
            .append('rect')
            .attr('width','20')
            .attr('height','10')
            .attr('x','480')
            .attr('y','200')
            .attr('fill','#375E62');

        // add legend label
        vis.svg.append('g')
            .append('text')
            .attr('x','140')
            .attr('y','188')
            .text('% of people who drank last year')
            .attr('font-size','12')
            .attr("fill","#6F7B7F");
        vis.svg.append('g')
            .append('text')
            .attr('x','510')
            .attr('y','188')
            .text('% of people who had heavy drinking session in the past 30 days')
            .attr('font-size','12')
            .attr("fill","#6F7B7F");
        vis.svg.append('g')
            .append('text')
            .attr('x','140')
            .attr('y','208')
            .text('% of people who never drank last year')
            .attr('font-size','12')
            .attr("fill","#6F7B7F");
        vis.svg.append('g')
            .append('text')
            .attr('x','510')
            .attr('y','208')
            .text('% of people who never drink')
            .attr('font-size','12')
            .attr("fill","#6F7B7F");

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
            .text("% in population");


        // call next method in pipeline
        this.wrangleData();
    }


    wrangleData() {
        let vis = this;

        vis.infoStacked = Object.values(vis.stackedData).filter(d => d.total !== "0");
        vis.infoStacked = vis.infoStacked.filter(d => d.total !== 0);


        vis.infoStacked.sort((a, b) => {
            return b[selectedCategory] - a[selectedCategory]
        })


        // console.log(selectedCategory)
        // console.log(vis.infoStacked)

        let stack = d3.stack()
            .keys(["lastYear", "heavyDrinking", "noDrinking", "neverDrinking"]);
        vis.stackSeries = stack(vis.infoStacked)

        // console.log(vis.stackSeries)

        this.updateVis();

    }

    // updateVis method
    updateVis() {
        let vis = this;


        vis.color = d3.scaleOrdinal()
            .domain(["lastYear", "heavyDrinking", "noDrinking", "neverDrinking"])
            .range(['#5D7869', '#DE4C44', '#F18350', "#375E62"])


        vis.x.domain(vis.infoStacked.map(d => d.code));
        vis.y.domain([0, 400]);

        // ---- DRAW BARS ----
        vis.barsStacked = vis.svg
            .selectAll("g.series")
            .data(vis.stackSeries)
            .join(enter => enter.append("g").attr("class", "series"),
                update => update,
                exit => exit.remove())
            .attr("fill", d => vis.color(d.key))
            .selectAll("rect")
            .data(d => d)
            .join(enter => enter.append("rect"),
                update => update,
                exit => exit.remove())
            .attr("stroke", d => d.data.country == selection ? "black" : null)
            .attr("stroke-width", d => d.data.country == selection ? 2 : 0)
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);


                if (selectedCategory === "total") {
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                    <div>
                    <h3>${d.data.country}<h3>
                    <h4> Drank Last Year: ${d.data.lastYear}%</h4> 
                    <h4> Heavy Drinking in 30 Days: ${d.data.heavyDrinking}%</h4> 
                    <h4> No Drinking Last Year: ${d.data.noDrinking}%</h4>
                    <h4> Never Drink Alcohol: ${d.data.neverDrinking}%</h4>
                    </div>`);
                }
                else if (selectedCategory === "lastYear"){
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                    <div>
                    <h3>${d.data.country}</h3>
                    <h4>Drank Last Year: ${d.data[selectedCategory]}%</h4>
                    </div>`);
                }
                else if (selectedCategory === "heavyDrinking"){
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                    <div>
                    <h3>${d.data.country}</h3>
                    <h4>Heavy Drinking in 30 Days: ${d.data[selectedCategory]}%</h4>
                    </div>`);
                }
                else if (selectedCategory === "noDrinking"){
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                    <div>
                    <h3>${d.data.country}</h3>
                    <h4>No Drinking Last Year: ${d.data[selectedCategory]}%</h4>
                    </div>`);
                }
                else if (selectedCategory === "neverDrinking"){
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                    <div>
                    <h3>${d.data.country}</h3>
                    <h4>Never Drink Alcohol: ${d.data[selectedCategory]}%</h4>
                    </div>`);
                }

                selection = d.data.country;
                myMapVisGlobal.updateVis();
                myBarVisGlobal.wrangleData();
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .attr("stroke-width", 0);
                vis.tooltip
                    .style("opacity", 0);

                selection = "";
                myMapVisGlobal.updateVis();
                myBarVisGlobal.wrangleData();
            })
            .transition().duration(300)
            .attr("x", (d, i) => vis.x(d.data.code))
            .attr("y", d => vis.y(d[1]))
            .attr("height", d => vis.y(d[0]) - vis.y(d[1]))
            .attr("width", vis.x.bandwidth());


        vis.xAxisGroup = vis.svg.select(".x-axis")
            .attr("transform", "translate(-10," + vis.height + ")")
            .call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .style('opacity',0)
            .attr("transform", function (d) {
                return "rotate(-60)"
            });

        vis.yAxisGroup = vis.svg.select(".y-axis")
            .call(vis.yAxis);

    }
}