// adapted from http://jsfiddle.net/c5YVX/8/

var start_val = 0,
    duration = 10000,
    end_val2 = [28],
    end_val = [107];

var qSVG = d3.select("#story").append("svg").attr("width", 1000).attr("height", 160);

qSVG.selectAll(".txt")
    .data(end_val)
    .enter()
    .append("text")
    .text(start_val)
    .attr("class", "txt")
    .attr("x", 0)
    .attr("y", 60)
    .attr("fill", "#bb9b64ff")
    .transition()
    .duration(duration)
    .tween("text", function(d) {
        var i = d3.interpolate(this.textContent, d),
            prec = (d + "").split("."),
            round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

        return function(t) {
            this.textContent = Math.round(i(t) * round) / round;
        };
    });
qSVG.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("fill", "#bb9b64ff")
    .append('svg:tspan')
    .attr("x", 115)
    .attr("y", 60)
    .text("million people are ")
    .append('svg:tspan')
    .attr("x", 0)
    .attr("y", 120)
    .text("estimated to have AUD globally")

var qSVG2 = d3.select("#story2").append("svg").attr("width", 900).attr("height", 270);

qSVG2.selectAll(".txt")
    .data(end_val2)
    .enter()
    .append("text")
    .text(start_val)
    .attr("class", "txt")
    .attr("x", 520)
    .attr("y", 60)
    .attr("fill", "#bb9b64ff")
    .transition()
    .duration(duration)
    .tween("text", function(d) {
        var i = d3.interpolate(this.textContent, d),
            prec = (d + "").split("."),
            round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

        return function(t) {
            this.textContent = Math.round(i(t) * round) / round;
        };
    });
qSVG2.append("text")
    .attr("x", 190)
    .attr("y", 60)
    .attr("fill", "#bb9b64ff")
    .append('svg:tspan')
    .attr("x", 280)
    .attr("y", 60)
    .text("It causes")
    .append('svg:tspan')
    .attr("x", 100)
    .attr("y", 140)
    .text("premature death per year.");

