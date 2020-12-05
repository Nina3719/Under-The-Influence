class DeathFactorBarChart{

    constructor(parentElement, riskFactorData){
        this.parentElement = parentElement;
        this.riskFactorData = riskFactorData;
        this.displayData = [];

        // No data wrangling, no update sequence

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 15, right: 60, bottom: 10, left: 15};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select(`#${this.parentElement}`).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

        vis.visGroup = vis.svg.append("g")
            .attr("transform","translate(" + vis.margin.left + "," + vis.margin.top + ")")
            .attr("class","visGroup")
            .attr("width", vis.width)
            .attr("height", vis.height)

        // scales
        // position scale
        vis.x = d3.scaleBand()
            .rangeRound([0, vis.height])
            .paddingInner(0.1);
        // radius scale
        vis.r = d3.scaleLinear()
            .range([0,vis.width - vis.margin.right])

        // Add Tooltip placeholder
        vis.svg.append("text")
            .attr("id","stackedTooltipText")
            .attr("x", vis.margin.left*1.9)
            .attr("y", vis.margin.top*1.5)
            .attr("text-anchor","start")
            .attr("font-size",16)
            .attr("font-weight",400)
            .text("placeholder")
            .attr('fill', "#5D7869")
            .attr("opacity",0);

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;

        // grab all the keys from the key value pairs in data (filter out 'year' ) to get a list of categories
        vis.dataCategories = Object.keys(vis.riskFactorData[0]).filter(d=> d !== "Year" && d !== "Entity" && d !== "Code")

        // grab all the country names
        vis.dataCountries = [];
        for(let i = 0; i<vis.riskFactorData.length; i++){
            if(vis.dataCountries.includes(vis.riskFactorData[i].Entity) == false){
                vis.dataCountries.push(vis.riskFactorData[i].Entity);
            }
        }

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

        console.log(vis.gloablRiskFactorData);
        vis.countryHelper = vis.gloablRiskFactorData;

        vis.createDisplayData();

    }

    createDisplayData(){
        let vis = this;

        vis.displayData = [];

        // prepare data for visualizing the crosses
        for(let i=0; i < vis.dataCategories.length; i++){

            let helper = 0;

            for(let j=0; j < vis.countryHelper.length; j++){
                helper = helper + vis.countryHelper[j][vis.dataCategories[i]];
            }

            vis.displayData.push(
                {
                    Item: vis.dataCategories[i],
                    Amount: helper
                }
            )

        }
        vis.displayData.sort((a,b) => {return b.Amount - a.Amount});

        console.log('crosses',vis.displayData);
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.x.domain(vis.displayData.map(d=>d.Item));
        vis.r.domain([0,d3.max(vis.displayData,d=>d.Amount)]);

        // Create vertical path
        vis.vertical = vis.visGroup.selectAll(".cross-v")
            .data(vis.displayData)

        vis.vertical
            .enter()
            .append("rect")
            .attr("class","cross-v")
            .merge(vis.vertical)
            .style("fill", function(d){
                if(d.Item == "Alcohol use"){
                    return "#f93700";
                }else{
                    return "white";
                }
            })
            .on("mouseout", function(event,d){
                vis.unHighlightVis(d.Item);
            })
            .on("mouseover", function(event,d){
                vis.highlightVis(d.Item);
            })
            // .transition()
            // .duration(500)
            .attr("width", d=> vis.r(d.Amount))
            .attr("height", vis.x.bandwidth()*1/3)
            .attr("x", vis.margin.left)
            .attr("y", (d,i) => vis.margin.top + (vis.x.bandwidth()+0.1)*i)


        vis.vertical.exit().remove();

        // Create labels
        vis.labels = vis.visGroup.selectAll("text")
            .data(vis.displayData)

        vis.labels
            .enter()
            .append("text")
            .merge(vis.labels)
            .text(d => d.Item)
            .attr("fill", function(d){
                if(d.Item == "Alcohol use"){
                    return "#f93700";
                }else{
                    return "white";
                }
            })
            .attr("font-size",11)
            .attr("font-weight",300)
            // .transition()
            // .duration(500)
            .attr("x", d => vis.margin.left*1.2 + vis.r(d.Amount))
            .attr("y", (d,i) => vis.margin.top + (vis.x.bandwidth()+0.1)*i + vis.x.bandwidth()*1/3)


        vis.labels.exit().remove();

        // Create numbers
        vis.formatDigits = d3.format(".2s");

        vis.digits = vis.visGroup.selectAll('.death-digits')
            .data(vis.displayData)

        vis.digits
            .enter()
            .append('text')
            .merge(vis.digits)
            .attr('class','death-digits')
            .text(function(d){
                return vis.formatDigits(d.Amount);
            })
            .attr('fill', function(d){
                if(d.Item == "Alcohol use"){
                    return "#f93700";
                }else{
                    return "white";
                }
            })
            .attr("font-size",8)
            .attr("font-weight",300)
            .attr('text-anchor','end')
            .attr("x", vis.margin.left - 3)
            .attr("y", (d,i) => vis.margin.top + (vis.x.bandwidth()+0.1)*i + vis.x.bandwidth()*1/3)

        vis.digits.exit().remove();

    }

    highlightVis(key){
        let vis = this;

        vis.item = vis.displayData.find(object => object.Item == key);
        vis.index = vis.displayData.findIndex(object => object.Item == key);

        let x = vis.margin.left;
        let y = vis.margin.top + (vis.x.bandwidth()+0.1)*vis.index
        let width = vis.r(vis.displayData[vis.index].Amount)
        let height = vis.x.bandwidth()*1/3

        vis.visGroup.append('rect')
            .attr("id","highlightedDeathFactor")
            .style('fill',function(){
                if (key == 'Alcohol use'){
                    return "#f93700";
                }else{
                    return "#5D7869";
                }
            })
            .attr("width",width)
            .attr("height", height)
            .attr("x", x)
            .attr("y", y)

        vis.svg.select('#stackedTooltipText')
            .attr("opacity",1)
            .style("fill", function(){
                if(key == "Alcohol use"){
                    return "#f93700";
                }else{
                    return "white";
                }
            })
            .attr('dy', -6)
            .text(key)

    }

    unHighlightVis(key){
        let vis = this;

        vis.visGroup.select("#highlightedDeathFactor")
            .remove()

        vis.svg.select('#stackedTooltipText')
            .attr("opacity",0)

    }

    selectionChange(){
        let vis = this;

        vis.selectedCountry = $('#countrySelector').val();

        //console.log(vis.selectedCountry);

        if (vis.selectedCountry == "allCountry"){
            vis.countryHelper = vis.gloablRiskFactorData;
            //console.log(vis.countryHelper);
            vis.createDisplayData();
        }else{
            vis.countryHelperHelper = vis.riskFactorData;
            vis.countryHelper = vis.countryHelperHelper.filter(object => object.Entity == vis.selectedCountry);
            vis.createDisplayData();
        }

        console.log(vis.countryHelper);

        //update HTML Text description
        let sum = 0;
        let alcoholSum = 0;
        for(let i=0; i<vis.countryHelper.length; i++){

            alcoholSum = alcoholSum + vis.countryHelper[i]["Alcohol use"];

            for(let j=0; j<vis.dataCategories.length; j++){
                if(vis.dataCategories[j] !== "Alcohol use"){
                    sum = sum + vis.countryHelper[i][vis.dataCategories[j]];
                }
            }
        }


        vis.deathResult = parseFloat((alcoholSum/sum)*100);
        vis.percentage = vis.deathResult.toFixed(2)
        vis.deathRanking = vis.displayData.findIndex(object => object.Item == "Alcohol use") + 1;

        document.getElementById("df4").innerHTML = vis.percentage + "%";
        document.getElementById("df1").innerHTML = vis.deathRanking + "th";


        vis.percentageByCountry = [];

        for(let i=0; i<vis.dataCountries.length; i++){
            let focusCountry = vis.riskFactorData.filter(object => object.Entity == vis.dataCountries[i]);
            let focusAlcohol = 0;
            let focusSum = 0;

            for(let j=0; j<focusCountry.length; j++){
                focusAlcohol = focusAlcohol + focusCountry[j]["Alcohol use"];
            }
            for(let j=0; j<vis.dataCategories.length; j++){
                focusSum = focusSum + focusCountry[i][vis.dataCategories[j]];
            }

            vis.rawResult = parseFloat((focusAlcohol/focusSum)*100);

            vis.percentageByCountry.push({
                Country: vis.dataCountries[i],
                SumPercentage: vis.rawResult
            })

        }

        vis.percentageByCountry.sort((a,b) => {return b.SumPercentage - a.SumPercentage});
        vis.countryRanking = vis.percentageByCountry.findIndex(object => object.Country == vis.selectedCountry) + 1;

        document.getElementById("df3").innerHTML = "placing it " + vis.countryRanking + "th among the regions surveyed";

    }

    yearChange(xPointer,xPointerDate,xClosestIndex){
        let vis = this;

        // stackedareachart.visGroup.select('#stackedAreaTracker')
        //     .attr('transform','translate(' + xPointer + ',0)');
        //
        // stackedareachart.visGroup.select('#stackedAreaLine')
        //     .attr("opacity",1)

        vis.countryHelperYear = [];
        vis.countryHelperYear.push(vis.countryHelper[xClosestIndex]);

        vis.displayData = [];

        // prepare data for visualizing the crosses
        for(let i=0; i < vis.dataCategories.length; i++){

            let helper = 0;

            for(let j=0; j < vis.countryHelperYear.length; j++){
                helper = helper + vis.countryHelperYear[j][vis.dataCategories[i]];
            }

            vis.displayData.push(
                {
                    Item: vis.dataCategories[i],
                    Amount: helper
                }
            )

        }
        vis.displayData.sort((a,b) => {return b.Amount - a.Amount});

        vis.updateVis();
    }

}