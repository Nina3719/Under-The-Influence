function radialDendrogram (){

    let margin = {top: 50, right: 40, bottom: 60, left: 150};

    let width = 1000 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom;

    let svg = d3v4.select("#radial-dendrogram").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let g = svg.append("g");


    let stratify = d3v4.stratify()
        .id(function(d) { return d.name; })
        .parentId(function(d) { return d.manager; });

    function project(x, y) {
        let angle = (x - 90) / 180 * Math.PI, radius = y;
        return [radius * Math.cos(angle) + width/2.0 -60, radius * Math.sin(angle) + height/2.0-100];
    }

    d3v4.csv("data/radial-dendrogram.csv", function(error, data) {
        if (error) throw error;

        // Color
        // let color = d3v4.scaleOrdinal(d3v4.schemeCategory10);

        let color = d3v4.scaleOrdinal(["#DC9464","#274f53ff","#f93700ff","#5D7869", "#FA8072", "#994423"]);

        // Setup legend
        let legendDotSize = 30;
        let legendWrapper = svg.append("g")
            .attr("class", "legend")
            .attr("transform", function(d) { return "translate(" + (-150) + "," + 600 + ")"; })

        let colorData = Array.from(new Set(data.map(function(d) { return d.department; })))
            .sort(function(a, b) { return a.localeCompare(b); });

        // The text of the legend
        let legendText = legendWrapper.selectAll("text")
            .data(colorData);

        legendText.enter().append("text")
            .attr("y", function(d, i) { return i * legendDotSize + 12; })
            .attr("x", 20)
            .merge(legendText)
            .attr("text-anchor","start")
            .text(function(d) {
                return d;
            });

        // The dots of the legend
        let legendDot = legendWrapper.selectAll("rect")
            .data(colorData);

        legendDot.enter().append("rect")
            .attr("y", function(d, i) { return i * legendDotSize; })
            .attr("rx", legendDotSize * 0.5)
            .attr("ry", legendDotSize * 0.5)
            .attr("width", legendDotSize * 0.5)
            .attr("height", legendDotSize * 0.5)
            .merge(legendDot)
            .style("fill", function(d) { return color(d); });

        // Interaction with button
        let radialMode = true;
        document.getElementById("radial-dendrogram-button").onclick = function() { toggleMode() };

        let toggleMode = function() {
            let tree;

            if(radialMode) {
                tree = d3v4.cluster()
                    .size([360, 250]) // degrees, radius
                    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });
            } else {
                tree = d3v4.cluster()
                    .size([800, 550]);// height, width


            }

            let root = stratify(data)
                .sort(function(a, b) {
                    return (a.data.department.localeCompare(b.data.department) || b.height - a.height);
                });

            tree(root);

            let node = g.selectAll(".node").data(root.descendants());

            node.group = node.enter().append("g")
                .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); });

            let link = g.selectAll(".link")
                .data(root.descendants().slice(1));

            // Radial Mode
            if(radialMode) {
                node.group.merge(node).transition().duration(1000)
                    .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; });


                node.group.append("rect")
                    .attr("class", "rect-number")
                    .attr('height',5)
                    .attr('width', d=> d.data.number/50)
                    .merge(node.select("rect")).transition().duration(1000)
                    .attr('fill','#bb9b64ff')
                    .attr('opacity',0.7)
                    .attr("x", function(d) {
                        return d.x < 180 === !d.children ? 30 : -1 * (this.getBBox().width + 30); })
                    .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; });


                node.group.append("text")
                    .attr("class", "text-name")
                    .attr('fill', function(d){
                        if (d.data.number >250){
                            return "#7f6436ff"
                        }
                        else{
                            return "black"
                        }
                    })
                    .text(function(d) { return d.data.name; })
                    .merge(node.select("text")).transition().duration(1000)
                    .attr("x", function(d) {
                        return d.x < 180 === !d.children ? 30 : -1 * (this.getBBox().width + 30); })
                    .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; });


                node.group.append("text")
                    .attr("class", "text-number")
                    .text(function(d) { return d.data.number; })
                    .merge(node.select(".text-number")).transition().duration(1000)
                    .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -1 * (this.getBBox().width + 6); })
                    .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; });


                link.enter().append("path")
                    .attr("class", "link")
                    .merge(link).transition().duration(1000)
                    .attr("d", function(d) {
                        return "M" + project(d.x, d.y)
                            + "C" + project(d.x, (d.y + d.parent.y) / 2)
                            + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                            + " " + project(d.parent.x, d.parent.y);
                    })
                ;
                // Tree Mode
            } else {

                node.group.merge(node).transition().duration(1000)
                    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

                node.group.append("rect")
                    .attr("class", "rect-number")
                    .attr('height',4)
                    .attr('width', d=> d.data.number/50)
                    .attr('fill','#bb9b64ff')
                    .merge(node.select("rect")).transition().duration(1000)
                    .attr("x", function(d) { return d.children ? -1 * (this.getBBox().width + 30) : 5; })
                    .attr("transform", function(d) { return "rotate(180)"; });


                node.group.append("text")
                    .attr("class", "text-name")
                    .text(function(d) { return d.data.name; })
                    .merge(node.select("text")).transition().duration(1000)
                    .attr("dy", 3)
                    .attr("x", function(d) { return d.children ? -1 * (this.getBBox().width + 10) : 10; })
                    .attr("transform", function(d) { return "rotate(0)"; });


                node.group.append("text")
                    .attr("class", "text-number")
                    .text(function(d) { return d.data.number; })
                    .merge(node.select("text")).transition().duration(1000)
                    .attr("dy", 3)
                    .attr("x", function(d) { return d.children ? -1 * (this.getBBox().width + 6) : 40; })
                    .attr("transform", function(d) { return "rotate(0)"; });

                node.group.append("text")
                    .attr("class", "text-number")
                    .text(function(d) { return d.data.number; })
                    .merge(node.select(".text-number")).transition().duration(1000)
                    .attr("dy", 3)
                    .attr("x", function(d) { return d.children ? -1 * (this.getBBox().width + 6) : 6; })
                    .attr("transform", function(d) { return "rotate(0)"; });

                link.enter().append("path")
                    .attr("class", "link")
                    .merge(link).transition().duration(1000)
                    .attr("d", function(d) {
                        return "M" + d.y + "," + d.x
                            + "C" + (d.parent.y + 180) + "," + d.x
                            + " " + (d.parent.y + 180) + "," + d.parent.x
                            + " " + d.parent.y + "," + d.parent.x;
                    })


                ;
            }



            // Hover
            g.selectAll(".text-name")
                .on('click', function (d, i) {
                    document.getElementById ('radial-dendrogram-info-name').innerHTML = d.data.name;
                    document.getElementById ('radial-dendrogram-info').innerHTML = d.data.detail;
                    document.getElementById ('selectedCondition').innerHTML = d.data.name;
                })
                .on('mouseover', function (d, i) {
                    d3v4.select(this).attr('fill', '#cf8d52')

                })
                .on('mouseout', function (d, i) {

                    d3v4.select(this).attr('fill', function(){
                        if (d.data.number >250){
                            return "#7f6436ff"
                        }
                        else{
                            return "black"
                        }
                    })

                });

            // Group Circles
            node.group.append("circle")
                .attr("r", 3.5)
                .attr("fill", function(d) {
                    return color(d.data.department)
                });


            // Toggle state
            radialMode = !radialMode;
        };

        // run radial mode first!
        toggleMode();
    });

}


radialDendrogram();

