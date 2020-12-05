class DeathFactorTimeline{

	constructor(parentElement, riskFactorData){
		this.parentElement = parentElement;
		this.riskFactorData = riskFactorData;
		this.displayData = [];

		// No data wrangling, no update sequence

		this.prepareData();
	}

	prepareData(){
		let vis = this;

		// grab all the keys from the key value pairs in data (filter out 'year' ) to get a list of categories
		vis.dataCategories = Object.keys(vis.riskFactorData[0]).filter(d=> d !== "Year" && d !== "Entity" && d !== "Code")

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

		vis.prepareDisplay();

	}

	prepareDisplay(){
		let vis = this;

		let year = 1989;
		for(let i=0; i < vis.gloablRiskFactorData.length; i++){
			year++;
			let sum = 0;

			for(let j=0; j < vis.dataCategories.length; j++){
				sum = sum + vis.gloablRiskFactorData[i][vis.dataCategories[j]];
			}

			vis.displayData.push(
				{
					Year: vis.parseDate(year),
					Sum: sum
				}
			)
		}
		console.log('timeline',vis.displayData);

		vis.initVis();
	}

	initVis(){
		let vis = this;

		vis.margin = {top: 0, right: 10, bottom: 20, left: 18};

		vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
		vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

		// Scales and axes
		vis.x = d3.scaleTime()
			.range([vis.margin.left, vis.width])
			.domain(d3.extent(vis.displayData, function(d) { return d.Year; }));

		vis.y = d3.scaleLinear()
			.range([vis.height, 0])
			.domain([0, d3.max(vis.displayData, function(d) { return d.Sum; })]);

		vis.xAxis = d3.axisBottom()
			.scale(vis.x);

		// SVG area path generator
		vis.area = d3.area()
			.x(function(d) { return vis.x(d.Year); })
			.y0(vis.height)
			.y1(function(d) { return vis.y(d.Sum); });

		// Draw area by using the path generator
		vis.svg.append("path")
			.datum(vis.displayData)
			.attr("class","death-factor-brush-area")
			.attr("fill", "#88765E")
			.attr("d", vis.area);

		// TO-DO: Initialize brush component
		vis.brush = d3.brushX()
			.extent([[vis.margin.left, 0], [vis.width, vis.height]])
			.on("brush", brushed);

		// TO-DO: Append brush component here
		vis.svg.append("g")
			.attr("class", "brush")
			.call(vis.brush)
			.selectAll("rect")
			.attr("y", -6)
			.attr("height", vis.height + 7);

		// Append x-axis
		vis.svg.append("g")
			.attr("class", "brush-x-axis")
			.attr("transform", "translate(0," + vis.height + ")")
			.call(vis.xAxis);
	}

	showTutorial(){
		let vis = this;

		d3.select("#death-brush-hint")
			.html(`
					 <div style="font-size:18px;font-weight:700;font-style:italic;color: white;margin-left:50px;">
                            <i class="fa fa-hand-pointer-o"></i>BRUSH IT!
                     </div>
                 `)
	}

	hideTutorial(){
		let vis = this;

		d3.select("#death-brush-hint")
			.html(`
					 <div style="font-size:18px;font-weight:700;font-style:italic;color:#5b4a3f;margin-left:50px;">
                            <i class="fa fa-hand-pointer-o"></i>BRUSH IT!
                     </div>
                 `)
	}

}