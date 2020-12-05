// based on http://bl.ocks.org/cloudshapes/5661984 by cloudshapes

drawLine();
function drawLine(){
    // var margin = {top: 0, right: 0, bottom: 0, left: 0},
    //     width = 960 - margin.left - margin.right,
    //     height = 500 - margin.top - margin.bottom;


// var npoints = 100;
    var ptdata = [];
    var session = [];
    var path;
    var drawing = false;


    var line = d3v3.svg.line()
        .interpolate("bundle") // basis, see http://bl.ocks.org/mbostock/4342190
        .tension(1)
        .x(function(d, i) { return d.x; })
        .y(function(d, i) { return d.y; });

    var drawArea = d3v3.select("#history-line").selectAll("svg")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)

    var triggerArea = drawArea.append("rect")
        .attr('id','triggerArea')
        .attr('width',1000)
        .attr('height',700)
        .attr('opacity', 0);

    drawArea.append("g")
        .attr('class','drawArea')
        .attr("transform", "translate(" + 0 + "," + 0 + ")");

    drawArea
        .on("mousedown", listen)
        .on("touchstart", listen)
        .on("touchend", ignore)
        .on("touchleave", ignore)
        .on("mouseup", ignore)
        .on("mouseleave", ignore);


// ignore default touch behavior
    var touchEvents = ['touchstart', 'touchmove', 'touchend'];
    touchEvents.forEach(function (eventName) {
        document.body.addEventListener(eventName, function(e){
            e.preventDefault();
        });
    });

    $("#redraw-button").click(redraw);

    function redraw(){
        // console.log("cliced")
        ptdata = [];
        d3.selectAll("path.drawLine").remove();
    }


    function listen () {
        drawing = true;

        ptdata = []; // reset point data
        path = drawArea.append("path") // start a new line
            .data([ptdata])
            .attr("class", "drawLine")
            .attr("d", line);

        if (d3v3.event.type === 'mousedown') {
            drawArea.on("mousemove", onmove);
        } else {
            drawArea.on("touchmove", onmove);
        }
    }

    function ignore () {
        var before, after;

        drawArea.on("mousemove", null);
        drawArea.on("touchmove", null);

        // skip out if we're not drawing
        if (!drawing) return;
        drawing = false;

        before = ptdata.length;
        // console.group('Line Simplification');
        // console.log("Before simplification:", before)

        // simplify
        ptdata = simplify(ptdata);
        after = ptdata.length;

        // console.log("After simplification:", ptdata.length)
        // console.groupEnd();


        // add newly created line to the drawing session
//    session.push(ptdata);

        // redraw the line after simplification
        tick();
    }


    function onmove (e) {
        var type = d3v3.event.type;
        var point;

        if (type === 'mousemove') {
            point = d3v3.mouse(this);

        } else {
            // only deal with a single touch input
            point = d3v3.touches(this)[0];
        }

        // push a new data point onto the back
        ptdata.push({ x: point[0], y: point[1] });
        tick();
    }

    function tick() {
        path.attr("d", function(d) { return line(d); }) // Redraw the path:
    }

}
