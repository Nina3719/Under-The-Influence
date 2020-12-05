class PolarAreaChart
{
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data.map(x => {
            x["Increased risk of alcohol dependency"] = +x["Increased risk of alcohol dependency"];
            return x;
        });
        this.displayData = {};

        this.colors = {
            "white": "#ffffff",
            "lightest orange": "#f9ddddff",
            "light orange": "#ff9b80",
            "orange": "#f93700ff",
            "semi dark orange": "#b32700",
            "dark orange": "#661600",
            "black": "#191919ff",
        }

        this.initVis();
    }

    // the function that recognize current section and call visualization function respectively
    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 40};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.dim = Math.min(vis.width, vis.height);
        vis.radius = vis.dim / 2;

        vis.outerRadius = function(d) {
            return vis.radius * d.data["Increased risk of alcohol dependency"]/7;
        };

        vis.arc = d3.arc()
            .outerRadius(vis.outerRadius)
            .innerRadius(vis.dim * 0.075)
            .padAngle(0.01);

        vis.pie = d3.pie()
            .value(function(d) {
                return  1;
            });

        vis.grid = d3.radialLine()
            .radius(150);


        // init drawing area
        vis.svgBase = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.width / 2}, ${vis.height / 2})`);

        vis.svg = vis.svgBase.append('g').attr('class', 'polar-main');
        vis.overlay = vis.svgBase.append('g').attr('class', 'polar-overlay');


        vis.compareCircleScale = d3.scaleSqrt()
            .range([2, 6])
            .domain([0, 7]);


        const keys = ["1-2", "2-3", "3-4", "4-5", "5+"]

        // Usually you have a color scale in your chart already
        var color = d3.scaleOrdinal()
            .domain(keys)
            .range(["#f9ddddff", "#ff9b80", "#f93700ff", "#b32700", "#661600"]);

        vis.legendGroup = vis.svgBase.append('g')
            .attr('transform', `translate (${-1*vis.width/2}, ${-1*vis.height/2 - 50})`);

        // Add one dot in the legend for each name.
        vis.legendGroup.selectAll("polarLegendDots")
            .data(keys)
            .enter()
            .append("circle")
            .attr("cx", 100)
            .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function(d){ return color(d)})

        // Add one dot in the legend for each name.
        vis.legendGroup.selectAll("polarLegendDotsLabel")
            .data(keys)
            .enter()
            .append("text")
            .attr("x", 120)
            .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", "191919ff")
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");


        vis.wrangleData();
    }

    // wrangle and parse data to fit visualization
    wrangleData()
    {
        let vis = this;

        console.log(vis.data);
        vis.displayData = vis.data.sort(function(a, b){
            return b["Increased risk of alcohol dependency"] - a["Increased risk of alcohol dependency"];
        });

        vis.updateVis();

    }

    updateVis() {
        let vis = this;

        const layoutData = vis.pie(vis.data);

        const arcs = vis.svg.selectAll('.polar-arc')
            .data(layoutData, function (d) {
                return d.data["Entity"];
            });


        const x = d3.scaleBand()
            .domain(vis.data.map(d => {

                return d["Entity"];
            }))
            .range([0, 2 * Math.PI])
            .align(0);

        const newArcs = arcs.enter().append('g')
            .attr('class', 'polar-arc')
            .attr('opacity', 0);

        arcs.exit()
            .transition()
            .attr('opacity', 0)
            .remove();

        newArcs.append('path')
            .attr('d', vis.arc)
            .each(function(d) {
                this._current = d;
            }); // store the initial angles

        newArcs.transition().attr('opacity', 1);

        // Label each wedge
        newArcs.append('text')
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .text(function(d) {
                return d.data["Entity"];
            });

        newArcs.selectAll('text')
            .data(function(d) {
                return [d];
            }) // Update child data.
            .transition()
            .duration(1000)
            .attr('transform', function(d) {
                const c = vis.arc.centroid(d);
                const x = c[0];
                const y = c[1];

                // pythagorean theorem for hypotenuse
                const h = Math.sqrt(x*x + y*y);
                let labelr = vis.outerRadius(d) + 40;

                if (["Bipolar disorder","Specific phobia", "Social phobia", "Panic disorder"].includes(d.data["Entity"])) {
                    labelr += 20;
                }

                if (["Major depression", "Any mood disorder", "Conduct disorder", "Separation anxiety", "Any anxiety disorder"].includes(d.data["Entity"])) {
                    labelr += 30;
                }

                let toTranslate = 'translate(' + (x/h * labelr) +  ',' +
                    (y/h * labelr) +  ')';
                if ( "Agoraphobia"  === d.data["Entity"]) {
                    toTranslate += 'rotate(-15)';
                }
                if ( "ASPD"  === d.data["Entity"]) {
                    toTranslate += 'rotate(-25)';
                }
                if (["Any mood disorder"].includes(d.data["Entity"])) {
                    toTranslate += 'rotate(15)';
                }
                if (["Any anxiety disorder", "Panic disorder"].includes(d.data["Entity"])) {
                    toTranslate += 'rotate(15)';
                }

                if (["Specific phobia"].includes(d.data["Entity"])) {
                    toTranslate += 'rotate(-55)';
                }
                if ("Separation anxiety" === d.data["Entity"]) {
                    toTranslate += 'rotate(-75)';
                }
                if ("ADHD" === d.data["Entity"]) {
                    toTranslate += 'rotate(45)';
                }
                if ("GAD" === d.data["Entity"]) {
                    toTranslate += 'rotate(60)';
                }
                if (d.data["Entity"] === "Major depression") {
                    toTranslate += 'rotate(80)';
                }

                return toTranslate;
            });

        newArcs.selectAll('path')
            .data(function(d) { return [d]; }) // Update child data.
            .transition()
            .duration(1000)
            .delay(250)
            .attr('d', vis.arc)
            .attr("fill", d => {
                const val = d.data["Increased risk of alcohol dependency"];
                if (val < 2) {
                    return vis.colors["lightest orange"];
                }
                else if (val < 3) {
                    return vis.colors["light orange"];
                }
                else if (val < 4) {
                    return vis.colors["orange"];
                }
                else if (val < 5) {
                    return vis.colors["semi dark orange"];
                }
                else if (val <= 6) {
                    return vis.colors["dark orange"];
                }
            })


        newArcs.on('mouseover', _.debounce(function(event, d) {

            document.getElementById("polar-area-char-text").innerHTML =
            `
                <h4>${d.data["Entity"]} </h4>
                <h4>Increased risk of alcohol dependency: ${d.data["Increased risk of alcohol dependency"]}</h4>
                <br/>
                <p><b>Description: </b>
                    <p>${d.data["Description"]}</p>
                </p>
                <p><b>Signs: </b>
                    <p>${d.data["Signs"]}</p>
                </p>
                <p><b>Prevention: </b>
                    <p>${d.data["Prevention"]}</p>
                </p>
                
                <p><b>Resource: </b>
                    <a href="${d.data["Resource"]}" target="_blank">[link]</a>
                </p>
            `;


            let cir = vis.overlay.selectAll('.polar-circle-active').data([{ value: d }]);

            cir.enter()
                .append('circle')
                .attr('class', 'polar-circle-active');

            cir.exit().remove();

            cir.transition()
                .attr('r', function(d) {
                    return vis.outerRadius(d.value);
                });

        }, 50));

        vis.addCircleAxes();
        setTimeout(_.bind(vis.addCircleTicks, vis), 1250); // Wait until after the wedges are in place.
    }

    addCircleAxes = function() {
        let vis = this;
        let circleAxes;

        vis.svg.selectAll('.polar-circle-ticks').remove();

        circleAxes = vis.svg.selectAll('.polar-circle-ticks')
            .data([1, 2, 3, 4, 5, 6, 7])
            .enter().append('svg:g')
            .attr('class', 'polar-circle-ticks');

        circleAxes.append('svg:circle')
            .attr('r', function (d) {
                return vis.outerRadius({"data":{"Increased risk of alcohol dependency": d}});
            })
            .attr('class', 'polar-circle');
    };

    addCircleTicks = function() {
        let vis = this;

        // Find arcs that overlap with where our labels will be placed.
        // y +/- 10 && have an x > 0
        let maxVal = 0;
        let overlapArcs = vis.svg.selectAll('.polar-arc').each(function(d) {
            let el = this;
            let box = el.getBBox();

            if(box.x > 0 && (box.y > -50 || (box.y - box.height) < 50 )) {

                if (box.x + box.width > maxVal) {
                    maxVal = box.x + box.width;
                }
            }
        });

        let lblToUse = _.filter([1, 2, 3, 4, 5, 6, 7], function (d) {
            return true;
        });

        var lbl = vis.svg.selectAll('.polar-tick-label')
            .data(lblToUse, function(d) { return d; });

        lbl.exit()
            .transition()
            .style('opacity', 0)
            .remove();

        lbl.enter().append('g')
            .style('opacity', 0.8)
            .attr('class', 'polar-tick-label')
            .attr('transform', function (d) {
                return 'translate('+ (vis.outerRadius({"data":{"Increased risk of alcohol dependency": d}})) +' , 0)'; })
            .append('text')
            .attr('dy', 10)
            .text(function (d) {
                return d;
            });

        lbl.transition()
            .style('opacity', 1);
    };
}