/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVisGlobal {

    constructor(parentElement, geoData, countryData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.countryData = countryData;

        // define colors
        // this.colors = ['#fddbc7', '#f4a582', '#d6604d', '#b2182b']

        this.initVis()
    }

    initVis() {
        let vis = this;
        let m0,
            o0;


        vis.margin = {top: 20, right: 20, bottom: 40, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            //.attr("viewBox", `0 0 1550 800`)
            .attr("width", vis.width)
            .attr("height", vis.height + 120)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title map-title')
            .append('text')
            .text('Alcohol consumption per person, 2016')
            .attr('transform', `translate(${vis.width / 2}, ${vis.height +70 })`)
            .attr('text-anchor', 'middle');

        // vis.svg.append('g')
        //     .attr('class', 'title map-title')
        //     .append('text')
        //     .text('Consumption of alcohol is measured in liters of pure alcohol per person aged 15 or older.')
        //     .attr('transform', `translate(${vis.width / 2}, ${vis.height + 85})`)
        //     .attr('text-anchor', 'middle');

        // create a projection
        vis.projection = d3.geoEckert4() // d3.geoStereographic()
            .translate([vis.width / 2, vis.height -210 ])
            .scale(170)

        // define a geo generator and pass the projection to it
        vis.path = d3.geoPath()
            .projection(vis.projection);

        // convert TopoJSON data to GeoJSON data structure
        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features


        //sphere
        vis.svg.append("g")
            .append("path")
            .datum({type: "Sphere"})
            .attr("class", "graticule")
            .attr('fill', '#fff')
            .attr("stroke", "rgba(129,129,129,0.35)")
            .attr("d", vis.path);

        // graticule
        vis.svg.append("g").append("path")
            .datum(d3.geoGraticule())
            .attr("class", "graticule")
            .attr('fill', '#fff')
            .attr("stroke", "rgba(129,129,129,0.35)")
            .attr("d", vis.path);

        // draw countries
        vis.countries = vis.svg.append("g").selectAll(".country")
            .data(vis.world)
            .enter().append("path")
            .attr('class', 'country')
            .attr("d", vis.path)
            .attr("fill", "white")
            .attr("stroke", "grey")
            .attr("stroke-width", "0.1px");


        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip')
            .style("background","white")

        // ---- LEGEND ----
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width /3.3}, ${vis.height + 35})`)

        //Append a linearGradient element to the defs and give it a unique id
        vis.linearGradient = vis.legend.append("defs").append("linearGradient")
            .attr("id", "linear-gradient");

        //Horizontal gradient
        vis.linearGradient
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        //Set the color for the start (0%)
        vis.linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#FFD6B3");

        //Set the color for the end (100%)
        vis.linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#f93700");

        //Draw the rectangle and fill with gradient
        vis.legend.append("rect")
            .attr("width", 400)
            .attr("height", 10)
            .attr("fill", "url(#linear-gradient)")
            .attr("transform", "translate(" + 0 + " ," + -10 + ")");


        // draggable
        vis.svg.call(
            d3.drag()
                .on("start", function (event) {

                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function (event) {
                    if (m0) {
                        let m1 = [event.x, event.y],
                            o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
                        vis.projection.rotate([-o1[0], -o1[1]]);
                    }

                    // Update the map
                    vis.path = d3.geoPath().projection(vis.projection);
                    d3.selectAll(".country").attr("d", vis.path)
                    d3.selectAll(".graticule").attr("d", vis.path)
                    d3.selectAll("circle")
                        .attr('cx', d => vis.projection([d.longitude, d.latitude])[0])
                        .attr('cy', d => vis.projection([d.longitude, d.latitude])[1])

                })
        )

        vis.wrangleData()

    }

    wrangleData() {
        let vis = this;

        // console.log(vis.geoData.objects.countries.geometries)

        // create random data structure with information for each land
        vis.countryInfo = [];
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
                    noDrinking: vis.countryData[countryName].noDrinking,

                }
            } else {
                console.log("undefined: ", countryName)
            }
        })


        //console.log(vis.countryInfo)
        vis.updateVis()
    }


    updateVis() {
        let vis = this;
        //console.log(vis.countryInfo)

        // console.log(d3.max(vis.countryInfo, d => d[selectedCategory]))

        vis.color = d3.scaleLinear()
            .domain([0, 15.2])
            .range(["#FFD6B3", "#f93700"])

        vis.color2 = d3.scaleLinear()
            .domain([0, 100])
            .range(["#FFD6B3", "#f93700"])

        // ---- LEGEND ----
        if (selectedCategory === "total") {
            vis.legendScale = d3.scaleLinear()
                .domain([0, 15.2])
                .range([0, 400])

            vis.legendAxis = d3.axisBottom()
                .scale(vis.legendScale)
                .ticks(4);

            vis.legend.append('g')
                .attr('transform', 'translate(0,' + 40 + ')')
                .attr('class', 'x axis')

            vis.legend.exit().remove();
            vis.legend.call(vis.legendAxis);
        } else {
            vis.legendScale = d3.scaleLinear()
                .domain([0, 100])
                .range([0, 400])

            vis.legendAxis = d3.axisBottom()
                .scale(vis.legendScale)
                .ticks(5);

            vis.legend.append('g')
                .attr('transform', 'translate(0,' + 20 + ')')
                .attr('class', 'x axis')

            vis.legend.exit().remove();
            vis.legend.call(vis.legendAxis);

        }

        fillfunction();
        $("#iranbtn").mouseover(
            function(){
                vis.svg.selectAll(".country")
                    .attr("stroke", d => d.properties.name == 'Iran' ? "black" : null)
                    .attr("stroke-width", d => d.properties.name == 'Iran' ? 1 : 0)
            }
        ).mouseout(
            function(){
                fillfunction();
            }
        )
        $("#libyabtn").mouseover(
            function(){
                vis.svg.selectAll(".country")
                    .attr("stroke", d => d.properties.name == 'Libya' ? "black" : null)
                    .attr("stroke-width", d => d.properties.name == 'Libya' ? 1 : 0)
            }
        ).mouseout(
            function(){
                fillfunction();
            }
        )
        $("#indobtn").mouseover(
            function(){
                vis.svg.selectAll(".country")
                    .attr("stroke", d => d.properties.name == 'Indonesia' ? "black" : null)
                    .attr("stroke-width", d => d.properties.name == 'Indonesia' ? 1 : 0)
            }
        ).mouseout(
            function(){
                fillfunction();
            }
        )
        $("#gerbtn").mouseover(
            function(){
                vis.svg.selectAll(".country")
                    .attr("stroke", d => d.properties.name == 'Germany' ? "black" : null)
                    .attr("stroke-width", d => d.properties.name == 'Germany' ? 1 : 0)
            }
        ).mouseout(
            function(){
                fillfunction();
            }
        )
        $("#irelandbtn").mouseover(
            function(){
                vis.svg.selectAll(".country")
                    .attr("stroke", d => d.properties.name == 'Ireland' ? "black" : null)
                    .attr("stroke-width", d => d.properties.name == 'Ireland' ? 1 : 0)
            }
        ).mouseout(
            function(){
                fillfunction();
            }
        )
        $("#francebtn").mouseover(
            function(){
                vis.svg.selectAll(".country")
                    .attr("stroke", d => d.properties.name == 'France' ? "black" : null)
                    .attr("stroke-width", d => d.properties.name == 'France' ? 1 : 0)
            }
        ).mouseout(
            function(){
                fillfunction();
            }
        )

        function fillfunction(){

            vis.countries = vis.svg.selectAll(".country")

                .attr("fill", function (d) {


                    if (d.properties.name === selection) {
                        return "#D5DBBE";
                    }
                    // if (d.properties.name === 'Iran') {
                    //     return "#D5DBBE";
                    // }

                    if (selectedCategory === "total") {
                        let countryName = d.properties.name;
                        // console.log(vis.countryInfo[d.properties.name].total)
                        if (vis.countryInfo[countryName] !== undefined) {
                            return vis.color(vis.countryInfo[d.properties.name][selectedCategory])
                        }

                    } else {
                        let countryName = d.properties.name;
                        // console.log(vis.countryInfo[d.properties.name].total)
                        if (vis.countryInfo[countryName] !== undefined) {
                            return vis.color2(vis.countryInfo[d.properties.name][selectedCategory])
                        }
                    }


                })
                .attr("stroke", d => d.properties.name == selection ? "grey" : null)
                .attr("stroke-width", d => d.properties.name == selection ? 1 : 0)
                //.attr("fill",d=>vis.countryInfo[d.properties.name].color)
                //.attr("fill",d=>vis.color(vis.countryInfo[d.properties.name][selectedCategory]))
                .on('mouseover', function (event, d) {
                    let countryName = d.properties.name;


                    d3.select(this)
                        .attr('fill', "#D5DBBE")
                        .attr("stroke", "grey")
                        .attr("stroke-width", 1)

                    vis.tooltip
                        .style("opacity", 0.85)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        // console.log(d)
                        .html(`
                     <div>
                         <h3> ${vis.countryInfo[countryName].name}<h3>  
                         <h4> Code: ${vis.countryInfo[countryName].code}</h4> 
                         <h4> Consumption: ${vis.countryInfo[countryName].total}</h4> 
                         <h4> Drank Last Year: ${vis.countryInfo[countryName].lastYear}%</h4> 
                         <h4> Heavy Drinking in 30 Days: ${vis.countryInfo[countryName].heavyDrinking}%</h4> 
                         <h4> No Drinking Last Year: ${vis.countryInfo[countryName].noDrinking}%</h4>
                         <h4> Never Drink Alcohol: ${vis.countryInfo[countryName].neverDrinking}%</h4>
    
                     </div>`);

                    selection = d.properties.name;
                    myBarVisGlobal.wrangleData();
                    myBarVisGroupGlobal.updateVis();
                })
                .on('mouseout', function (event, d) {

                    d3.select(this)
                        .attr("stroke-width", 0)


                        //.attr("fill", d => vis.countryInfo[d.properties.name].color)
                        .attr("fill", function (d) {
                            if (selectedCategory === "total") {
                                let countryName = d.properties.name;
                                // console.log(vis.countryInfo[d.properties.name].total)
                                if (vis.countryInfo[countryName] !== undefined) {
                                    return vis.color(vis.countryInfo[d.properties.name][selectedCategory])
                                }

                            } else {
                                let countryName = d.properties.name;
                                // console.log(vis.countryInfo[d.properties.name].total)
                                if (vis.countryInfo[countryName] !== undefined) {
                                    return vis.color2(vis.countryInfo[d.properties.name][selectedCategory])
                                }
                            }


                        })

                    vis.tooltip
                        .style("opacity", 0)

                    selection = "";
                    myBarVisGlobal.wrangleData();
                    myBarVisGroupGlobal.updateVis();

                });
        }



        vis.countries.exit().remove();

    }
}