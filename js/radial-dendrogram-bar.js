function radialDendrogramBar (){


    let margin = {top: 50, right: 40, bottom: 60, left: 150};

    let width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    let svg = d3v4.select("#radial-dendrogram-bar").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 50)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + 200 + ")");


    let g = svg.append("g");



    d3v4.csv("data/radial-dendrogram.csv", function(error, data) {
        // Load data
        let barData = data.slice(1).filter(d => d.number !== "—").filter(d => d.number !== " ")
        // Convert to number
        barData = barData.map(function (d){
            d.number = +d.number
            return d
        })
        // Sort data
        barData= barData.sort((a,b)=>b.number-a.number)
        barData= barData.slice(0,20);
        // console.log(barData)

        // initiate
        let color = ["#f93700ff","#6F7B7F","#DC9464","#f9ddddff",
            "#EBB97C", "#5D7869", "#D5DBBE", "#88765E" , "#F18350"];
        let barStacked=[]
        let yOffset = 0;

        // Create data structure
        for(let i = 0; i < barData.length; i++) {
            //console.log(barData[i].number)
            let datum = {
                name : barData[i].name,
                value : barData[i].number,
                color : color[i % color.length],
                x: 0,
                y: yOffset

            }
            yOffset += barData[i].number;
            barStacked.push(datum)
        }
        // console.log (barStacked)

        let tooltip = d3v4.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')


        let stackedBars = svg.selectAll('rect').data(barStacked)

        stackedBars.enter().append('rect')
            .on('mouseover', function (event, d) {

                d3v4.select(this)
                tooltip
                    .style("opacity", 1)
                    .style("left", d3v4.event.pageX + 20 + "px")
                    .style("top", d3v4.event.pageY + "px")
                    .html(`
                    <h3>${event.name}<h3>
                    <h4>${event.value} death per 1,000,000 people</h4> 
                    </div>`);
            })
            .on('mouseout', function (event, d) {
                d3v4.select(this)
                tooltip
                    .style("opacity", 0);
            })
            .attr("width", d=> d.value/34)
            .attr('height', 200)
            .attr('x', d=> d.y/34-120)
            .style('fill',d=>d.color);

        svg.selectAll('text.stackedBarTitle').data(barStacked).enter()
            .append('text')
            .attr('class','stackedBarTitle')
            .attr('x', 10)
            .attr('y',d=>d.y/34-110)
            .attr("transform", function(d) { return "rotate(-90)"; })
            .text(function(d){
                if(d.value>250) {
                    return d.name
                }
            });

        svg.selectAll('text.stackedBarValue').data(barStacked).enter()
            .append('text')
            .attr('class','stackedBarValue')
            .attr('x', -35)
            .attr('y',d=>d.y/34-110)
            .attr("transform", function(d) { return "rotate(-90)"; })
            .text(function(d){
                if(d.value>250) {
                    return d.value
                }
            });


        // add title
        svg.append('text').attr('class', 'title map-title')
            .text('Ranking of Alcohol Attributed Mortality by Health Condition')
            .attr('transform', `translate(${width / 2 -30}, ${height -150})`)
            .attr('text-anchor', 'middle');
    });



}
radialDendrogramBar();