class VictimStory{

    constructor(parentElement, victimData) {
        this.parentElement = parentElement;
        this.victimData = victimData;
        this.displayData = [];
        this.instructionData = [];

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 180, right: 500, bottom: 20, left: 500};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select(`#${this.parentElement}`).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

        // constant and array
        vis.rowSpacing = 60;
        vis.rectWidth = 3;
        vis.rectHeight = 30;
        vis.rectSpacing = (vis.width*1/2 - vis.rectWidth*3)*1/3;
        vis.listenerWidth = vis.rectHeight;
        vis.radius = 3;
        vis.legendGap = 16;
        vis.categories = [
            {Keyword: 'Suicide'},{Keyword: 'Homicide'},{Keyword: 'Car accident'},{Keyword: 'Liver failure'},{Keyword: 'Alcohol poisoning'},{Keyword: 'Alcoholism'},
            {Keyword: ' '},{Keyword: 'Multiple genders'},{Keyword: 'Female'},{Keyword: 'Male'},
            {Keyword: ' '}, {Keyword: 'Multiple ages'}, {Keyword: '>50  y/o'}, {Keyword: '31-50  y/o'},{Keyword: '19-30  y/o'},{Keyword: '< 18  y/o'}
        ];


        // scales
        // position scale
        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(1);

        // Add Tooltip placeholder
        vis.tooltip = d3.select("body")
            .append('div')
            .attr('id', "victim-tooltip");

        // Add Tooltip placeholder
        vis.victimTooltipGroup = vis.svg.append('g')
            .attr('class','victimTooltipGroup');

        vis.victimTooltipGroup.append("text")
            .attr("id","victimTooltipHead")
            .attr("x", vis.margin.left)
            .attr("y", vis.margin.top)
            .attr("text-anchor","start")
            .attr("font-size",12)
            .attr("font-weight",400)
            .text("placeholder")
            .attr('fill', "white")
            .attr("opacity",0);

        vis.foreignObject = vis.victimTooltipGroup.append('foreignObject')
            .attr("id","foreign-object")
            .attr("x", vis.margin.left)
            .attr("y", vis.margin.top)
            .attr('width',150)
            .attr('height',300)

        vis.victimTooltipGroup.append("line")
            .attr("id","victimTooltipLine")
            .attr('x1',vis.margin.left-15)
            .attr('y1',vis.margin.top-20)
            .attr('x2',vis.margin.left-15)
            .attr('y2',vis.margin.top + 10)
            .attr("stroke","#bb9b64ff")
            .attr("stroke-width",3)
            .attr("opacity",0)


        vis.narrativeDiv = document.createElement('div');
        vis.narrativeDiv.setAttribute("id","narrative-text");
        document.getElementById("foreign-object").appendChild(vis.narrativeDiv);

        vis.linkDiv = document.createElement('a');
        vis.linkDiv.setAttribute("id","narrative-link");
        document.getElementById("foreign-object").appendChild(vis.linkDiv);

        // Add Legend
        vis.victimLegendGroup = vis.svg.append('g')
            .attr('class','victimLegendGroup')

        for(let i=0;i<vis.categories.length;i++){
            vis.victimLegendGroup.append("text")
                .attr("class","victim-legend")
                .attr("x", vis.margin.left - vis.rectSpacing*2 + 35)
                .attr("y", vis.height/2  - vis.legendGap*i + 280)
                .attr("text-anchor","end")
                .attr("font-size",12)
                .attr("font-weight",400)
                .text(vis.categories[i].Keyword)
                .attr('fill', "white")
                .attr("opacity",0.5)
        }
        for(let i=0;i<vis.categories.length;i++){
            if(i<6){
                vis.victimLegendGroup.append("circle")
                    .attr("class","victim-legend-keyword")
                    .attr("cx", vis.margin.left - vis.rectSpacing*2 + vis.legendGap + 35)
                    .attr("cy", vis.height/2 + vis.margin.bottom  - vis.legendGap*i - vis.radius + 260)
                    .attr('r',vis.radius)
                    .attr('fill','transparent')
                    .attr('stroke','white')
                    .attr('stroke-width',1)
                    .attr('stroke',function(){
                        if(vis.categories[i].Keyword == 'Alcohol poisoning'){
                            return "#f93700";
                        }else if(vis.categories[i].Keyword == 'Liver failure'){
                            return "#ebb97c";
                        }else if(vis.categories[i].Keyword == 'Alcoholism'){
                            return "#f18350";
                        }else if(vis.categories[i].Keyword == 'Car accident'){
                            return "#79dea6";
                        }else if(vis.categories[i].Keyword == 'Homicide'){
                            return "#8b9fa6";
                        }else if(vis.categories[i].Keyword == 'Suicide'){
                            return "#e7f411";
                        }else{
                            return "none";
                        }
                    })
            }else if(i>6 && i<10){
                vis.victimLegendGroup.append("circle")
                    .attr("class","victim-legend-gender")
                    .attr("cx", vis.margin.left - vis.rectSpacing*2 + vis.legendGap + 35)
                    .attr("cy", vis.height/2 + vis.margin.bottom  - vis.legendGap*i - vis.radius + 260)
                    .attr('r',vis.radius)
                    .attr('fill',function() {
                        if (vis.categories[i].Keyword == 'Male') {
                            return "blue";
                        } else if (vis.categories[i].Keyword == 'Female') {
                            return "#f93700";
                        } else if (vis.categories[i].Keyword == 'Multiple genders') {
                            return "grey";
                        }
                    })
            }else if(i>10){
                vis.victimLegendGroup.append("text")
                    .attr("class","victim-legend-age")
                    .attr("x", vis.margin.left - vis.rectSpacing*2 + vis.legendGap + 35)
                    .attr("y", vis.height/2 + vis.margin.bottom  - vis.legendGap*i + 260)
                    .attr('font-size',12)
                    .attr('fill',"#bdbbbb")
                    .text(function(){
                        if (vis.categories[i].Keyword == '>50  y/o') {
                            return "iv";
                        } else if (vis.categories[i].Keyword == '31-50  y/o') {
                            return "iii";
                        }else if (vis.categories[i].Keyword == '19-30  y/o') {
                            return "ii";
                        }else if (vis.categories[i].Keyword == '< 18  y/o') {
                            return "i";
                        }else if (vis.categories[i].Keyword == 'Multiple ages') {
                            return "v";
                        }
                    })
            }
        }

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;

        vis.displayData = vis.victimData;
        vis.instructionData = vis.victimInstruction;

        vis.displaySetA = [];
        vis.displaySetB = [];
        vis.displaySetC = [];
        vis.displaySetD = [];

        for(let i=0; i<vis.displayData.length; i++){
            if(i%4==0){
                vis.displaySetA.push(vis.displayData[i]);
            }else if(i%4==1){
                vis.displaySetB.push(vis.displayData[i]);
            }else if(i%4==2){
                vis.displaySetC.push(vis.displayData[i]);
            }else if(i%4==3){
                vis.displaySetD.push(vis.displayData[i]);
            }
        }

        console.log(vis.displaySetA,vis.displaySetB,vis.displaySetC,vis.displaySetD)

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.updateSetA();
        vis.updateSetB();
        vis.updateSetC();
        vis.updateSetD();

        vis.updateInstruction();

        // vis.noteA();
        // vis.noteB();
        // vis.noteC();
        // vis.noteD();

    }

    // update instruction
    updateInstruction(){
        let vis = this;

        // create cross
        vis.crossZV = vis.svg.selectAll('.crossZV')
            .data(vis.displaySetB)

        vis.crossZV
            .enter()
            .append('rect')
            .attr('class','crossZV')
            .merge(vis.crossZV)
            .attr('y',vis.margin.top - vis.margin.top/2 - vis.rectHeight*1.8)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing;
                }
            })
            .attr('width',vis.rectWidth)
            .attr('height',vis.rectHeight)
            .attr('fill',function(d,i){
                if(i == 3){
                    return "white";
                }else if(i ==5){
                    return "#84776f";
                }else{
                    return "#5b4a3f";
                }
            })

        vis.crossZH = vis.svg.selectAll('.crossZH')
            .data(vis.displaySetB)

        vis.crossZH
            .enter()
            .append('rect')
            .attr('class','crossZH')
            .merge(vis.crossZH)
            .attr('y',vis.margin.top + vis.rectHeight*1/2 - vis.rectWidth*1/2 - 5 - vis.margin.top/2 - vis.rectHeight*1.8)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('width',vis.rectHeight)
            .attr('height',vis.rectWidth)
            .attr('fill',function(d,i){
                if(i == 3){
                    return "white";
                }else if(i ==5){
                    return "#84776f";
                }else{
                    return "#5b4a3f";
                }
            })

        // create annotation
        vis.circleZH = vis.svg.selectAll('.circleZH')
            .data(vis.displaySetB)

        vis.circleZH
            .enter()
            .append('circle')
            .attr('class','circleZH')
            .merge(vis.circleZH)
            .attr('cy',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.margin.top/2 - vis.rectHeight*1.8)
            .attr('cx',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('r',vis.radius)
            .attr('fill','transparent')
            .attr('stroke','white')
            .attr('stroke-width',1)
            .attr('stroke',function(d,i){
                if(i == 3){
                    return "#ebb97c";
                }else{
                    return 'none';
                }
            })

        vis.dotZH = vis.svg.selectAll('.dotZH')
            .data(vis.displaySetB)

        vis.dotZH
            .enter()
            .append('circle')
            .attr('class','dotZH')
            .merge(vis.dotZH)
            .attr('cy',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight - vis.margin.top/2 - vis.rectHeight*1.8)
            .attr('cx',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 + vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('r',vis.radius*3/4)
            .attr('stroke','none')
            .attr('fill',function(d,i){
                if(i == 5 || i == 3){
                    if(d.Gender == 'M'){
                        return "blue";
                    }else if(d.Gender == 'F'){
                        return "#f93700";
                    }else if(d.Gender == 'MF'){
                        return "grey";
                    }else{
                        return "none";
                    }
                }else{
                    return 'none';
                }
            })

        vis.ageZH = vis.svg.selectAll('.ageZH')
            .data(vis.displaySetB)

        vis.ageZH
            .enter()
            .append('text')
            .attr('class','ageZH')
            .merge(vis.dotZH)
            .attr('y',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight + vis.radius - vis.margin.top/2 - vis.rectHeight*1.8)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.radius*2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.radius*2;
                }
            })
            .attr('font-size',12)
            .attr('fill',function(d,i){
                if(i==3){
                    return "#bdbbbb";
                }else{
                    return 'none';
                }
            })
            .text(d=>d.AgeGroup)

        vis.instructionKey = ['Death age', 'Gender', 'Cause type'];
        vis.instructionValue = ['<18 y/o', 'Male', 'Liver failure'];
        vis.instructionHover = ['Hover over','for story'];
        vis.instructionFade = ['Countless','other victims'];
        vis.instructionNo = ['1','2','3'];

        // append legend text
        vis.instructionGroup = vis.svg.append('g')
            .attr('class','instructionGroup')

        // append legend text 1
        for(let i=0;i<vis.instructionKey.length;i++){
            vis.instructionGroup.append('text')
                .attr('class','victim-ins-key')
                .attr('x',(vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) - vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.rectHeight*3)
                .attr('y',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight - vis.margin.top/2 + i*15)
                .attr("text-anchor","end")
                .attr("font-size",12)
                .attr("font-weight",400)
                .text(vis.instructionKey[i])
                .attr('fill', "white")
                .attr("opacity",0.6)
        }

        // append legend text 2
        for(let i=0;i<vis.instructionKey.length;i++){
            vis.instructionGroup.append('text')
                .attr('class','victim-ins-value')
                .attr('x',(vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) - vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.rectHeight*3 + 5)
                .attr('y',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight - vis.margin.top/2 + i*15)
                .attr("text-anchor","start")
                .attr("font-size",12)
                .attr("font-weight",400)
                .text(vis.instructionValue[i])
                .attr('fill', "white")
                .attr("opacity",0.2)
        }

        // append legend text 3
        for(let i=0;i<vis.instructionHover.length;i++){
            vis.instructionGroup.append('text')
                .attr('class','victim-ins-hover')
                .attr('x',(vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) - vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2 - vis.rectHeight*2)
                .attr('y',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight - vis.margin.top/2 + i*15)
                .attr("text-anchor","end")
                .attr("font-size",12)
                .attr("font-weight",500)
                .text(vis.instructionHover[i])
                .attr('fill', "white")
                .attr("opacity",1)
        }

        // append legend text 4
        for(let i=0;i<vis.instructionFade.length;i++){
            vis.instructionGroup.append('text')
                .attr('class','victim-ins-fade')
                .attr('x',(vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + vis.rectSpacing + vis.rectHeight)
                .attr('y',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight - vis.margin.top/2 + (i+1)*15)
                .attr("text-anchor","start")
                .attr("font-size",12)
                .attr("font-weight",500)
                .text(vis.instructionFade[i])
                .attr('fill', "white")
                .attr("opacity",0.6)
        }

        // append legend text 5
        // for(let i=0;i<vis.instructionNo.length;i++){
        //     vis.instructionGroup.append('text')
        //         .attr('class','victim-ins-fade')
        //         .attr('x',(vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) - vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.rectHeight*3 + 5)
        //         .attr('y',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight - vis.margin.top/2 + i*15)
        //         .attr("text-anchor","middle")
        //         .attr("font-size",12)
        //         .attr("font-weight",400)
        //         .text(vis.instructionNo[i])
        //         .attr('fill', "white")
        //         .attr("opacity",0.6)
        // }

        vis.svg.append('path')
            .attr("x1", (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) - vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.radius*2)
            .attr("y1", vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight + vis.radius - vis.margin.top/2 - vis.rectHeight*1.8)
            .attr("x2", (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) - vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.rectHeight*3)
            .attr("y2", vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight - vis.margin.top/2 + 0*15)
            .attr("fill","#bb9b64ff")
            .attr("stroke-width",2)
            .attr("opacity",1)

        // vis.curvePointsA = [
        //     {
        //         x:(vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) - vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.radius*2,
        //         y:vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight + vis.radius - vis.margin.top/2 - vis.rectHeight*1.8
        //     },
        //     {
        //         x:(vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) - vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.rectHeight*3,
        //         y:vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight - vis.margin.top/2 + 0*15
        //     }
        // ]
        // vis.curvePointsB = [
        //     {
        //         x:(vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) - vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2,
        //         y:vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight - vis.margin.top/2 - vis.rectHeight*1.8
        //     },
        //     {
        //         x:(vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) - vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.rectHeight*3,
        //         y:vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight - vis.margin.top/2 + 1*15
        //     }
        // ]
        //
        // vis.instructionLine = d3.line()
        //     .x((p)=>p.x)
        //     .y((p)=>p.y)
        //     .curve(d3.curveBasis);
        //
        // vis.instructionGroup.append('path')
        //     .attr('d',vis.instructionLine(vis.curvePointsA))
        //     .attr('stroke','white')
        //     .attr('opacity',0.5)

        vis.instructionGroup.attr('transform','translate(0,' + (- vis.rectHeight*1.8) + ')')

    }
    // update instruction

    // updateSetA
    updateSetA(){
        let vis = this;

        vis.x.domain(vis.displaySetA.map(d=>d.Name));

        // create mouse listener
        vis.listenerA = vis.svg.selectAll('.listenerA')
            .data(vis.displaySetA)
        vis.listenerA
            .enter()
            .append('circle')
            .attr('class','listenerA')
            .merge(vis.listenerA)
            .attr('cy',vis.margin.top + vis.rectHeight*1/2)
            .attr('cx',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left;
                }else{
                    return (vis.width*1/2 + vis.margin.left) + (i-4)*vis.rectSpacing;
                }
            })
            .attr('r',vis.listenerWidth*1/2)
            .attr('fill','#5b4a3f')
            .attr('opacity',0.5)
            .on('mouseout',function(event,d){
                    // vis.victimTooltipGroup
                    //     .attr('opacity',0)
                d3.select(this)
                    .attr('stroke','none')

            })
            .on('mouseover',function(event,d){
                if(d.Name !== 'Null'){
                    vis.victimTooltipGroup
                        .attr('opacity',1)
                        .attr('transform','translate('+ (vis.width+vis.rectSpacing*1.8) +',0)')

                    d3.select("#victimTooltipHead")
                        .text(d.Name + ", " + d.Age)
                        .attr("opacity",1);

                    d3.select("#victimTooltipLine")
                        .attr("opacity",1);

                    document.getElementById("narrative-text").innerHTML = d.Narrative + " (" + d.Year + ")";

                    document.getElementById("narrative-link").innerHTML = "Read their story";
                    document.getElementById("narrative-link").href = d.Story;
                    document.getElementById("narrative-link").setAttribute('target','_blank');

                    d3.select(this)
                        .attr('stroke','#bb9b64')
                        .attr('stroke-width',1)
                }
            })


        // create vis
        vis.crossAV = vis.svg.selectAll('.crossAV')
            .data(vis.displaySetA)

        vis.crossAV
            .enter()
            .append('rect')
            .attr('class','crossAV')
            .merge(vis.crossAV)
            .attr('y',vis.margin.top)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing;
                }
            })
            .attr('width',vis.rectWidth)
            .attr('height',vis.rectHeight)
            .attr('fill',function(d){
                if(d.Name == 'Null'){
                    return "#84776f";
                }else{
                    return "white";
                }
            })

        vis.crossAH = vis.svg.selectAll('.crossAH')
            .data(vis.displaySetA)

        vis.crossAH
            .enter()
            .append('rect')
            .attr('class','crossAH')
            .merge(vis.crossAH)
            .attr('y',vis.margin.top + vis.rectHeight*1/2 - vis.rectWidth*1/2 - 5)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('width',vis.rectHeight)
            .attr('height',vis.rectWidth)
            .attr('fill',function(d){
                if(d.Name == 'Null'){
                    return "#84776f";
                }else{
                    return "white";
                }
            })

        vis.circleAH = vis.svg.selectAll('.circleAH')
            .data(vis.displaySetA)

        vis.circleAH
            .enter()
            .append('circle')
            .attr('class','circleAH')
            .merge(vis.circleAH)
            .attr('cy',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3)
            .attr('cx',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('r',vis.radius)
            .attr('fill','transparent')
            .attr('stroke','white')
            .attr('stroke-width',1)
            .attr('stroke',function(d){
                if(d.Keyword == 'Alcohol intoxication'){
                    return "#f93700";
                }else if(d.Keyword == 'Liver failure'){
                    return "#ebb97c";
                }else if(d.Keyword == 'Alcoholism'){
                    return "#f18350";
                }else if(d.Keyword == 'Car accident'){
                    return "#79dea6";
                }else if(d.Keyword == 'Homicide'){
                    return "#8b9fa6";
                }else if(d.Keyword == 'Suicide'){
                    return "#e7f411";
                }else{
                    return "none";
                }
            })

        vis.dotAH = vis.svg.selectAll('.dotAH')
            .data(vis.displaySetA)

        vis.dotAH
            .enter()
            .append('circle')
            .attr('class','dotAH')
            .merge(vis.dotAH)
            .attr('cy',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight)
            .attr('cx',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 + vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('r',vis.radius*3/4)
            .attr('stroke','none')
            .attr('fill',function(d){
                if(d.Gender == 'M'){
                    return "blue";
                }else if(d.Gender == 'F'){
                    return "#f93700";
                }else if(d.Gender == 'MF'){
                    return "grey";
                }else{
                    return "none";
                }
            })

        vis.ageAH = vis.svg.selectAll('.ageAH')
            .data(vis.displaySetA)

        vis.ageAH
            .enter()
            .append('text')
            .attr('class','ageAH')
            .merge(vis.dotAH)
            .attr('y',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + 3 - vis.rectHeight + vis.radius)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.radius*2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.radius*2;
                }
            })
            .attr('font-size',12)
            .attr('fill',"#bdbbbb")
            .text(d=>d.AgeGroup)

    }
    // updateSetA

    //updateSetB
    updateSetB(){
        let vis = this;

        vis.x.domain(vis.displaySetB.map(d=>d.Name));

        // create mouse listener
        vis.listenerB = vis.svg.selectAll('.listenerB')
            .data(vis.displaySetB)
        vis.listenerB
            .enter()
            .append('circle')
            .attr('class','listenerB')
            .merge(vis.listenerB)
            .attr('cy',vis.margin.top + vis.rectHeight*1/2 + (vis.rowSpacing + vis.rectHeight))
            .attr('cx',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left;
                }else{
                    return (vis.width*1/2 + vis.margin.left) + (i-4)*vis.rectSpacing;
                }
            })
            .attr('r',vis.listenerWidth*1/2)
            .attr('fill','#5b4a3f')
            .attr('opacity',0.5)
            .on('mouseout',function(event,d){
                // vis.victimTooltipGroup
                //     .attr('opacity',0)
                d3.select(this)
                    .attr('stroke','none')

            })
            .on('mouseover',function(event,d){
                if(d.Name !== 'Null'){
                    vis.victimTooltipGroup
                        .attr('opacity',1)
                        .attr('transform','translate('+ (vis.width+vis.rectSpacing*1.8) +',' + (vis.rowSpacing + vis.rectHeight) + ')')

                    d3.select("#victimTooltipHead")
                        .text(d.Name + ", " + d.Age)
                        .attr("opacity",1);

                    d3.select("#victimTooltipLine")
                        .attr("opacity",1);

                    document.getElementById("narrative-text").innerHTML = d.Narrative + " (" + d.Year + ")";

                    document.getElementById("narrative-link").innerHTML = "Read their story";
                    document.getElementById("narrative-link").href = d.Story;
                    document.getElementById("narrative-link").setAttribute('target','_blank');

                    d3.select(this)
                        .attr('stroke','#bb9b64')
                        .attr('stroke-width',1)
                }
            })

        // create vis
        vis.crossBV = vis.svg.selectAll('.crossBV')
            .data(vis.displaySetB)

        vis.crossBV
            .enter()
            .append('rect')
            .attr('class','crossBV')
            .merge(vis.crossBV)
            .attr('y',vis.margin.top + vis.rectHeight + vis.rowSpacing)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing;
                }
            })
            .attr('width',vis.rectWidth)
            .attr('height',vis.rectHeight)
            .attr('fill',function(d){
                if(d.Name == 'Null'){
                    return "#84776f";
                }else{
                    return "white";
                }
            })

        vis.crossBH = vis.svg.selectAll('.crossBH')
            .data(vis.displaySetB)

        vis.crossBH
            .enter()
            .append('rect')
            .attr('class','crossBH')
            .merge(vis.crossBH)
            .attr('y',vis.margin.top + vis.rectHeight*1/2 - vis.rectWidth*1/2 + + vis.rectHeight + vis.rowSpacing - 5)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('width',vis.rectHeight)
            .attr('height',vis.rectWidth)
            .attr('fill',function(d){
                if(d.Name == 'Null'){
                    return "#84776f";
                }else{
                    return "white";
                }
            })

        vis.circleBH = vis.svg.selectAll('.circleBH')
            .data(vis.displaySetB)

        vis.circleBH
            .enter()
            .append('circle')
            .attr('class','circleBH')
            .merge(vis.circleBH)
            .attr('cy',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + (vis.rectHeight + vis.rowSpacing) + 3)
            .attr('cx',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('r',vis.radius)
            .attr('fill','transparent')
            .attr('stroke','white')
            .attr('stroke-width',1)
            .attr('stroke',function(d){
                if(d.Keyword == 'Alcohol intoxication'){
                    return "#f93700";
                }else if(d.Keyword == 'Liver failure'){
                    return "#ebb97c";
                }else if(d.Keyword == 'Alcoholism'){
                    return "#f18350";
                }else if(d.Keyword == 'Car accident'){
                    return "#79dea6";
                }else if(d.Keyword == 'Homicide'){
                    return "#8b9fa6";
                }else if(d.Keyword == 'Suicide'){
                    return "#e7f411";
                }else{
                    return "none";
                }
            })

        vis.dotBH = vis.svg.selectAll('.dotBH')
            .data(vis.displaySetB)

        vis.dotBH
            .enter()
            .append('circle')
            .attr('class','dotBH')
            .merge(vis.dotBH)
            .attr('cy',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + (vis.rectHeight + vis.rowSpacing) + 3 - vis.rectHeight)
            .attr('cx',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 + vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('r',vis.radius*3/4)
            .attr('stroke','none')
            .attr('fill',function(d){
                if(d.Gender == 'M'){
                    return "blue";
                }else if(d.Gender == 'F'){
                    return "#f93700";
                }else if(d.Gender == 'MF'){
                    return "grey";
                }else{
                    return "none";
                }
            })

        vis.ageBH = vis.svg.selectAll('.ageBH')
            .data(vis.displaySetB)

        vis.ageBH
            .enter()
            .append('text')
            .attr('class','ageBH')
            .merge(vis.dotBH)
            .attr('y',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + (vis.rectHeight + vis.rowSpacing) + 3 - vis.rectHeight + vis.radius)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.radius*2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.radius*2;
                }
            })
            .attr('font-size',12)
            .attr('fill',"#bdbbbb")
            .text(d=>d.AgeGroup)
    }
    //updateSetB

    //updateSetC
    updateSetC(){
        let vis = this;

        vis.x.domain(vis.displaySetC.map(d=>d.Name));

        // create mouse listener
        vis.listenerC = vis.svg.selectAll('.listenerC')
            .data(vis.displaySetC)
        vis.listenerC
            .enter()
            .append('circle')
            .attr('class','listenerC')
            .merge(vis.listenerC)
            .attr('cy',vis.margin.top + vis.rectHeight*1/2 + (vis.rowSpacing + vis.rectHeight)*2)
            .attr('cx',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left;
                }else{
                    return (vis.width*1/2 + vis.margin.left) + (i-4)*vis.rectSpacing;
                }
            })
            .attr('r',vis.listenerWidth*1/2)
            .attr('fill','#5b4a3f')
            .attr('opacity',0.5)
            .on('mouseout',function(event,d){
                // vis.victimTooltipGroup
                //     .attr('opacity',0)
                d3.select(this)
                    .attr('stroke','none')

            })
            .on('mouseover',function(event,d){
                if(d.Name !== 'Null'){
                    vis.victimTooltipGroup
                        .attr('opacity',1)
                        .attr('transform','translate('+ (vis.width+vis.rectSpacing*1.8) +',' + (vis.rowSpacing + vis.rectHeight)*2 + ')')

                    d3.select("#victimTooltipHead")
                        .text(d.Name + ", " + d.Age)
                        .attr("opacity",1);

                    d3.select("#victimTooltipLine")
                        .attr("opacity",1);

                    document.getElementById("narrative-text").innerHTML = d.Narrative + " (" + d.Year + ")";

                    document.getElementById("narrative-link").innerHTML = "Read their story";
                    document.getElementById("narrative-link").href = d.Story;
                    document.getElementById("narrative-link").setAttribute('target','_blank');

                    d3.select(this)
                        .attr('stroke','#bb9b64')
                        .attr('stroke-width',1)
                }
            })

        // create vis
        vis.crossCV = vis.svg.selectAll('.crossCV')
            .data(vis.displaySetC)

        vis.crossCV
            .enter()
            .append('rect')
            .attr('class','crossCV')
            .merge(vis.crossCV)
            .attr('y',vis.margin.top + (vis.rectHeight + vis.rowSpacing)*2)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing;
                }
            })
            .attr('width',vis.rectWidth)
            .attr('height',vis.rectHeight)
            .attr('fill',function(d){
                if(d.Name == 'Null'){
                    return "#84776f";
                }else{
                    return "white";
                }
            })

        vis.crossCH = vis.svg.selectAll('.crossCH')
            .data(vis.displaySetC)

        vis.crossCH
            .enter()
            .append('rect')
            .attr('class','crossCH')
            .merge(vis.crossCH)
            .attr('y',vis.margin.top + vis.rectHeight*1/2 - vis.rectWidth*1/2 + (vis.rectHeight + vis.rowSpacing)*2 - 5)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('width',vis.rectHeight)
            .attr('height',vis.rectWidth)
            .attr('fill',function(d){
                if(d.Name == 'Null'){
                    return "#84776f";
                }else{
                    return "white";
                }
            })

        vis.circleCH = vis.svg.selectAll('.circleCH')
            .data(vis.displaySetC)

        vis.circleCH
            .enter()
            .append('circle')
            .attr('class','circleCH')
            .merge(vis.circleCH)
            .attr('cy',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + (vis.rectHeight + vis.rowSpacing)*2 + 3)
            .attr('cx',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('r',vis.radius)
            .attr('fill','transparent')
            .attr('stroke','white')
            .attr('stroke-width',1)
            .attr('stroke',function(d){
                if(d.Keyword == 'Alcohol intoxication'){
                    return "#f93700";
                }else if(d.Keyword == 'Liver failure'){
                    return "#ebb97c";
                }else if(d.Keyword == 'Alcoholism'){
                    return "#f18350";
                }else if(d.Keyword == 'Car accident'){
                    return "#79dea6";
                }else if(d.Keyword == 'Homicide'){
                    return "#8b9fa6";
                }else if(d.Keyword == 'Suicide'){
                    return "#e7f411";
                }else{
                    return "none";
                }
            })

        vis.dotCH = vis.svg.selectAll('.dotCH')
            .data(vis.displaySetC)

        vis.dotCH
            .enter()
            .append('circle')
            .attr('class','dotCH')
            .merge(vis.dotCH)
            .attr('cy',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + (vis.rectHeight + vis.rowSpacing)*2 + 3 - vis.rectHeight)
            .attr('cx',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 + vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('r',vis.radius*3/4)
            .attr('stroke','none')
            .attr('fill',function(d){
                if(d.Gender == 'M'){
                    return "blue";
                }else if(d.Gender == 'F'){
                    return "#f93700";
                }else if(d.Gender == 'MF'){
                    return "grey";
                }else{
                    return "none";
                }
            })

        vis.ageCH = vis.svg.selectAll('.ageCH')
            .data(vis.displaySetC)

        vis.ageCH
            .enter()
            .append('text')
            .attr('class','ageCH')
            .merge(vis.dotCH)
            .attr('y',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + (vis.rectHeight + vis.rowSpacing)*2 + 3 - vis.rectHeight + vis.radius)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.radius*2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.radius*2;
                }
            })
            .attr('font-size',12)
            .attr('fill',"#bdbbbb")
            .text(d=>d.AgeGroup)
    }
    //updateSetC

    //updateSetD
    updateSetD(){
        let vis = this;

        vis.x.domain(vis.displaySetD.map(d=>d.Name));

        // create mouse listener
        vis.listenerD = vis.svg.selectAll('.listenerD')
            .data(vis.displaySetD)
        vis.listenerD
            .enter()
            .append('circle')
            .attr('class','listenerD')
            .merge(vis.listenerD)
            .attr('cy',vis.margin.top + vis.rectHeight*1/2 + (vis.rowSpacing + vis.rectHeight)*3)
            .attr('cx',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left;
                }else{
                    return (vis.width*1/2 + vis.margin.left) + (i-4)*vis.rectSpacing;
                }
            })
            .attr('r',vis.listenerWidth*1/2)
            .attr('fill','#5b4a3f')
            .attr('opacity',0.5)
            .on('mouseout',function(event,d){
                // vis.victimTooltipGroup
                //     .attr('opacity',0)
                d3.select(this)
                    .attr('stroke','none')

            })
            .on('mouseover',function(event,d){
                if(d.Name !== 'Null'){
                    vis.victimTooltipGroup
                        .attr('opacity',1)
                        .attr('transform','translate('+ (vis.width+vis.rectSpacing*1.8) +',' + (vis.rowSpacing + vis.rectHeight)*3 + ')')

                    d3.select("#victimTooltipHead")
                        .text(d.Name + ", " + d.Age)
                        .attr("opacity",1);

                    d3.select("#victimTooltipLine")
                        .attr("opacity",1);

                    document.getElementById("narrative-text").innerHTML = d.Narrative + " (" + d.Year + ")";

                    document.getElementById("narrative-link").innerHTML = "Read their story";
                    document.getElementById("narrative-link").href = d.Story;
                    document.getElementById("narrative-link").setAttribute('target','_blank');

                    d3.select(this)
                        .attr('stroke','#bb9b64')
                        .attr('stroke-width',1)
                }
            })

        // create vis
        vis.crossDV = vis.svg.selectAll('.crossDV')
            .data(vis.displaySetD)

        vis.crossDV
            .enter()
            .append('rect')
            .attr('class','crossDV')
            .merge(vis.crossDV)
            .attr('y',vis.margin.top + (vis.rectHeight + vis.rowSpacing)*3)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing;
                }
            })
            .attr('width',vis.rectWidth)
            .attr('height',vis.rectHeight)
            .attr('fill',function(d){
                if(d.Name == 'Null'){
                    return "#84776f";
                }else{
                    return "white";
                }
            })

        vis.crossDH = vis.svg.selectAll('.crossDH')
            .data(vis.displaySetD)

        vis.crossDH
            .enter()
            .append('rect')
            .attr('class','crossDH')
            .merge(vis.crossDH)
            .attr('y',vis.margin.top + vis.rectHeight*1/2 - vis.rectWidth*1/2 + (vis.rectHeight + vis.rowSpacing)*3 - 5)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('width',vis.rectHeight)
            .attr('height',vis.rectWidth)
            .attr('fill',function(d){
                if(d.Name == 'Null'){
                    return "#84776f";
                }else{
                    return "white";
                }
            })

        vis.circleDH = vis.svg.selectAll('.circleDH')
            .data(vis.displaySetD)

        vis.circleDH
            .enter()
            .append('circle')
            .attr('class','circleDH')
            .merge(vis.circleDH)
            .attr('cy',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + (vis.rectHeight + vis.rowSpacing)*3 + 3)
            .attr('cx',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing - vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('r',vis.radius)
            .attr('fill','transparent')
            .attr('stroke','white')
            .attr('stroke-width',1)
            .attr('stroke',function(d){
                if(d.Keyword == 'Alcohol intoxication'){
                    return "#f93700";
                }else if(d.Keyword == 'Liver failure'){
                    return "#ebb97c";
                }else if(d.Keyword == 'Alcoholism'){
                    return "#f18350";
                }else if(d.Keyword == 'Car accident'){
                    return "#79dea6";
                }else if(d.Keyword == 'Homicide'){
                    return "#8b9fa6";
                }else if(d.Keyword == 'Suicide'){
                    return "#e7f411";
                }else{
                    return "none";
                }
            })

        vis.dotDH = vis.svg.selectAll('.dotDH')
            .data(vis.displaySetD)

        vis.dotDH
            .enter()
            .append('circle')
            .attr('class','dotDH')
            .merge(vis.dotDH)
            .attr('cy',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + (vis.rectHeight + vis.rowSpacing)*3 + 3 - vis.rectHeight)
            .attr('cx',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 + vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2;
                }
            })
            .attr('r',vis.radius*3/4)
            .attr('stroke','none')
            .attr('fill',function(d){
                if(d.Gender == 'M'){
                    return "blue";
                }else if(d.Gender == 'F'){
                    return "#f93700";
                }else if(d.Gender == 'MF'){
                    return "grey";
                }else{
                    return "none";
                }
            })

        vis.ageDH = vis.svg.selectAll('.ageDH')
            .data(vis.displaySetD)

        vis.ageDH
            .enter()
            .append('text')
            .attr('class','ageDH')
            .merge(vis.dotDH)
            .attr('y',vis.margin.top + vis.rectHeight - vis.rectWidth*1/2 + (vis.rectHeight + vis.rowSpacing)*3 + 3 - vis.rectHeight + vis.radius)
            .attr('x',function(d,i){
                if(i==4){
                    return vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2 + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.radius*2;
                }else{
                    return (vis.width*1/2 + vis.margin.left - vis.rectWidth*1/2) + (i-4)*vis.rectSpacing + vis.rectHeight*1/2 + vis.rectWidth*1/2 + vis.radius*2;
                }
            })
            .attr('font-size',12)
            .attr('fill',"#bdbbbb")
            .text(d=>d.AgeGroup)
    }
    //updateSetD

}