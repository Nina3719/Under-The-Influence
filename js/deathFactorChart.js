class DeathFactorChart {

    constructor(parentElement, riskFactorData, alcoholFactorData) {
        this.parentElement = parentElement;
        this.riskFactorData = riskFactorData;
        this.alcoholFactorData = alcoholFactorData;
        this.displayData = [];

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.counter = 0;

        // grab all the keys from the key value pairs in data (filter out 'year' ) to get a list of categories
        vis.dataCategories = Object.keys(vis.riskFactorData[0]).filter(d=> d !== "Year" && d !== "Entity" && d !== "Code")

        // grab all the country names
        vis.dataCountries = [];
        for(let i = 0; i<vis.riskFactorData.length; i++){
            if(vis.dataCountries.includes(vis.riskFactorData[i].Entity) == false){
                vis.dataCountries.push(vis.riskFactorData[i].Entity);
            }
        }

        vis.margin = {top: 40, right: 10, bottom: 30, left: 40};
        vis.paddingTop = 50;
        vis.labelOffset = -10;
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select(`#${this.parentElement}`).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom + vis.paddingTop)


        vis.visGroup = vis.svg.append("g")
            .attr("transform","translate(" + vis.margin.left + "," + vis.margin.top + ")")
            .attr("class","visGroup")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // Overlay with path clipping
        vis.svg.append("defs").append("clipPath")
            .attr("id", "dfClipPath")
            .append("rect")
            .attr('x',1)
            //.attr('y',vis.margin.top)
            .attr("width", vis.width-1)
            .attr("height", vis.height);

        // Scales and axes
        vis.x = d3.scaleTime()
            .range([0, vis.width])
            .domain(d3.extent(vis.riskFactorData, d=> d.Year));

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .tickFormat(d3.timeFormat("%Y"));

        vis.yAxis = d3.axisLeft()
            .scale(vis.y)
            .tickFormat(d3.format(".2s"));

        vis.visGroup.append("g")
            .attr("class", "death-factor-y-axis")
            .attr('opacity',1);

        // Colors
        vis.interpolateColor = d3.interpolate('#eeeae1ff','#bb9b64ff');

        vis.colors = ['#c9c9c9','#c7bfaf','#eeeae1ff','#ebeae9ff','#d9dbd0','#c5c9b5','#cdc9c0','#d9cfba'];

        // prepare colors for range
        vis.colorArray = vis.dataCategories.map( (d,i) => {
            return vis.colors[i%8];
        })

        // Set ordinal color scale
        vis.colorScale = d3.scaleOrdinal()
            .domain(vis.dataCategories)
            .range(vis.colorArray);

        // Initialize stack layout
        vis.stack = d3.stack()
            .keys(vis.dataCategories);

        // Append axis
        vis.visGroup.append("g")
            .attr("class", "death-factor-x-axis")
            .attr("transform", "translate(0," + (vis.height + vis.margin.bottom) + ")");

        vis.wrangleData();

    }

    wrangleData(){
        let vis = this;

        vis.makeGlobalRiskFactorData();

    }

    makeGlobalRiskFactorData(){
        let vis = this;
        vis.formatTime = d3.timeFormat("%Y");
        vis.parseDate = d3.timeParse("%Y");

        vis.gloablRiskFactorData = [];
        vis.helper = [];

        for(let i=1990; i < 2018; i++){
            let filteredDatabyYear = vis.riskFactorData.filter(object => parseInt(vis.formatTime(object.Year)) == i);
            let helperbyYear = [];

            for(let j=0; j < vis.dataCategories.length; j++){
                let sum = 0;

                for(let k=0; k < filteredDatabyYear.length; k++){
                    sum = sum + filteredDatabyYear[k][vis.dataCategories[j]];
                }

                helperbyYear.push(sum);
            }

            vis.helper.push(helperbyYear);
        }

        //console.log(vis.helper);

        for(let i=1990; i < 2018; i++){

            vis.gloablRiskFactorData.push(
                {
                    Year: vis.parseDate(i)
                }
            )
        }

        for(let i=0; i < vis.gloablRiskFactorData.length; i++){

            for(let j=0; j < vis.dataCategories.length; j++){
                vis.gloablRiskFactorData[i][vis.dataCategories[j]] = vis.helper[i][j];
            }

        }

        vis.countryHelper = vis.gloablRiskFactorData;
        console.log('global risk factor data',vis.gloablRiskFactorData);

        vis.stackRiskFactorData();
    }

    stackRiskFactorData(){
        let vis = this;

        // Stack data
        vis.stackedRiskFactorData = vis.stack(vis.countryHelper);
        //console.log(vis.stackedRiskFactorData);

        // Stacked area layout
        vis.area = d3.area()
            .curve(d3.curveCardinal)
            .x(d=>vis.x(d.data.Year))
            .y0(d=>vis.y(d[0]))
            .y1(d=>vis.y(d[1]));

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.counter = vis.counter+1;

        vis.displayData = vis.stackedRiskFactorData;
        console.log('display data',vis.displayData)

        // Update domain
        // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
        vis.y.domain([0, d3.max(vis.displayData, function(d) {
                return d3.max(d, function(e) {
                    return e[1];
                });
            })
        ]);

        // Draw the layers
        vis.factorCategories = vis.visGroup.selectAll(".stackedFactorArea")
            .data(vis.displayData);

        vis.factorCategories
            .enter()
            .append('path')
            .attr('class','stackedFactorArea')
            .attr("stroke-width", 1)
            .attr('stroke', d => {
                if(d.key == "Alcohol use"){
                    return "#f93700";
                }else{
                    return vis.colorScale(d);
                }
            })
            .merge(vis.factorCategories)
            .style("fill", d => {
                if(d.key == "Alcohol use"){
                    return "#f93700";
                }else{
                    return vis.colorScale(d);
                }
            })
            .attr("d", d => vis.area(d))
            .attr("clip-path","url(#dfClipPath)")
            .on("mouseout", function(event,d){
                d3.select(this)
                    .style("fill", d => {
                        if(d.key == "Alcohol use"){
                            return "#f93700";
                        }else{
                            return vis.colorScale(d);
                        }
                    })
                    .attr('stroke', d => {
                        if(d.key == "Alcohol use"){
                            return "#f93700";
                        }else{
                            return vis.colorScale(d);
                        }
                    });
                factorBarChart.unHighlightVis(d.key);
            })
            .on("mouseover", function(event,d){
                d3.select(this)
                    .style("fill", d => {
                        if(d.key == "Alcohol use"){
                            return "#f93700";
                        }else{
                            return "#5D7869";
                        }
                    })
                    .attr("stroke",d => {
                        if(d.key == "Alcohol use"){
                            return "#f93700";
                        }else{
                            return "#5D7869";
                        }
                    });

                vis.hintOneOut();

                factorBarChart.highlightVis(d.key)
                //factorBarChart.highlightTextLabel(d.key);
            })

        vis.factorCategories.exit().remove();

        // Append tooltip group
        vis.stackedAreaTracker = vis.visGroup.append('g')
            .attr('id','stackedAreaTracker')

        vis.stackedAreaTracker.append('line')
            .attr('id','stackedAreaLine')
            .attr("x1", 0)
            .attr("y1", vis.labelOffset)
            .attr("x2", 0)
            .attr("y2", vis.height - vis.labelOffset)
            .attr("stroke","#bb9b64ff")
            .attr("stroke-width",2)
            .attr("opacity",1)

        vis.stackedAreaTracker.append('text')
            .attr('id','stackedAreaYear')
            .text("placeholder")
            .attr("x", 0)
            .attr("y", vis.labelOffset*2)
            .attr("font-size",24)
            .attr("font-weight",500)
            .attr("fill", "#bb9b64ff")
            .attr("opacity",0)

        // Append rectangle area listener
        vis.visGroup.append('rect')
            .attr("x",0)
            .attr("y",vis.height)
            .attr("width", vis.width)
            .attr("height", vis.margin.bottom)
            .attr("fill", "#bb9b64ff")
            .attr('stroke','#bb9b64ff')
            .attr('stroke-width',4)
            .attr("opacity",1)
            .on("mouseover", function(event,d){
                d3.select("#stackedAreaTracker")
                    .style("display","block")

                vis.hintTwoOut();
            })
            // .on("mouseout", function(event,d){
            //     d3.select("#stackedAreaTracker")
            //         .style("display","none")
            // })
            .on("mousemove", function(event,d){
                // construct a bisect function
                let bisectDate = d3.bisector(d => d.Year).left;

                // x position of pointer
                let xPointer = d3.pointer(event)[0];
                let xPointerDate = vis.x.invert(xPointer);
                let xClosestIndex = bisectDate(vis.countryHelper,xPointerDate);
                let formatDate = d3.timeFormat("%Y")

                d3.select("#stackedAreaTracker")
                    .attr("transform", "translate(" + (xPointer) + "," + 0 + ")")
                d3.select("#stackedAreaLine")
                    .attr("opacity",1)
                d3.select("#stackedAreaYear")
                    .text(formatDate(xPointerDate))
                    .attr("text-anchor", "middle")
                    .attr("opacity",1)
                    .attr("text-anchor",function(){
                        if(parseInt(formatDate(xPointerDate))>2015){
                            return "end";
                        }else{
                            return "middle";
                        }
                    })

                console.log(xPointer);
                console.log(xClosestIndex);
                factorBarChart.yearChange(xPointer,xPointerDate,xClosestIndex);
            })

        // Append rectangle frame
        vis.visGroup.append('rect')
            .attr("x",0)
            .attr("y",vis.labelOffset)
            .attr("width", vis.width)
            .attr("height", vis.height - vis.labelOffset)
            .attr("fill", "none")
            .attr('stroke','#bb9b64ff')
            .attr('stroke-width',4)
            .attr("opacity",1)

        // Call axis functions with the new domain
        d3.select(".death-factor-x-axis")
            .attr("text-anchor","end")
            .attr("font-size",12)
            .attr("fill",'#bb9b64ff')
            .call(vis.xAxis);
        vis.visGroup.select(".death-factor-y-axis")
            .attr("text-anchor","end")
            .attr("font-size",12)
            .attr("fill",'#bb9b64ff')
            .call(vis.yAxis);

        // Append y-axis label
        vis.yLabel = vis.visGroup.append('g')

        vis.yLabel.append('text')
            .text("Total number of deaths by risk factor")
            .attr("font-size",12)
            .attr('font-weight',500)
            .attr("fill",'#bb9b64ff')
            .attr('transform','rotate(' + 90 + ' ' + 0 + ' ' + 0 + ')')
            //.attr('writing-mode','tb')

        vis.yLabel
            .attr('transform','translate(' + 8 + ',' + 0 + ')')

    }

    selectionChange(){
        let vis = this;

        vis.selectedCountry = $('#countrySelector').val();

        //console.log(vis.selectedCountry);

        if (vis.selectedCountry == "allCountry"){
            vis.countryHelper = vis.gloablRiskFactorData;
            //console.log(vis.countryHelper);
            vis.stackRiskFactorData();
        }else{
            vis.countryHelperHelper = vis.riskFactorData;
            vis.countryHelper = vis.countryHelperHelper.filter(object => object.Entity == vis.selectedCountry);
            //console.log(vis.countryHelper);
            vis.stackRiskFactorData();
        }

        d3.select("#stackedAreaTracker")
            .style("display","none")


    }

    hintOneOut(){
        d3.select(".death-interaction-hint-one").remove();
    }

    hintTwoOut(){
        d3.select(".death-interaction-hint-two").remove();
    }

    showTutorial(){
        let vis = this;

        if(tutorialCounter == 1){
            d3.select('#death-ins')
                .html(`
                <p id="death-ins-one" style="color:white;"><i class="fa fa-hand-pointer-o"></i> <b style="color:white;font-weight:300">Hover over the
                            layers to see their categories.</b></p>
                        <p style="color:white;"><i class="fa fa-hand-pointer-o"></i> <b style="color:white;font-weight:300">
                        Hover over the golden band to see risk factor rankings on a chosen year. 
                        </b></p>
                        <p style="color:white;"><i class="fa fa-hand-pointer-o"></i> <b style="color:white;font-weight:300">
                        Brush the timeline to zoom in on a timeframe.</b></p>
            `)
        }

        vis.interactionHintOne = vis.svg.append('g')
            .attr('class','death-interaction-hint-one')

        vis.interactionHintOne.append('circle')
            .attr('id','death-layer-circle')
            .attr("cx",vis.margin.left + 12 + 4 + 10)
            .attr("cy",vis.height -20 - 6)
            .attr("r",10)
            .attr('fill','white')
            .attr("opacity",1)

        vis.interactionHintOne.append('text')
            .attr('id','death-layer-text')
            .attr("x",vis.margin.left + 30 + 10)
            .attr("y",vis.height - 20)
            .text('HOVER US!')
            .attr('fill',"#bb9b64ff")
            .attr('font-size',18)
            .attr('font-weight',700)
            .attr('font-style','italic')
            .attr('text-anchor','start')
            .attr("opacity",1)

        vis.interactionHintOne.append('text')
            .attr('id','death-layer-text')
            .attr("x",vis.margin.left + 12 + 10)
            .attr("y",vis.height - 20)
            .text('1')
            .attr('fill',"#bb9b64ff")
            .attr('font-size',18)
            .attr('font-weight',500)
            .attr('font-style','italic')
            .attr('text-anchor','start')
            .attr("opacity",1)

        vis.interactionHintTwo = vis.svg.append('g')
            .attr('class','death-interaction-hint-two')

        vis.interactionHintTwo.append('circle')
            .attr('id','gold-band-circle')
            .attr("cx",vis.margin.left + 12 + 4 + 10)
            .attr("cy",vis.height + vis.margin.left*1.5 + 2 - 6)
            .attr("r",10)
            .attr('fill','white')
            .attr("opacity",1)

        // Append interaction text 2
        vis.interactionHintTwo.append('text')
            .attr('id','gold-band-text')
            .attr("x",vis.margin.left + 30 + 10)
            .attr("y",vis.height + vis.margin.left*1.5 + 2)
            .text('HOVER ME!')
            .attr('fill','white')
            .attr('font-size',18)
            .attr('font-weight',700)
            .attr('font-style','italic')
            .attr('text-anchor','start')
            .attr("opacity",1)

        vis.interactionHintTwo.append('text')
            .attr('id','gold-band-text')
            .attr("x",vis.margin.left + 12 + 10)
            .attr("y",vis.height + vis.margin.left*1.5 + 2)
            .text('2')
            .attr('fill',"#bb9b64ff")
            .attr('font-size',18)
            .attr('font-weight',700)
            .attr('font-style','italic')
            .attr('text-anchor','start')
            .attr("opacity",1)


        //document.getElementById("death-page-button").innerHTML = "Next";

    }

    hideTutorial(){
        let vis=this;

        d3.select(".death-interaction-hint-one").remove();
        d3.select(".death-interaction-hint-two").remove();
    }

}



