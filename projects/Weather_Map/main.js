function onCategoryChanged(ans) {
    updateChart(ans);
}

// SVG Section for the legend/title
var legSVG = d3.select('.legendSVG');
var lpadding = {t: 20, r: 55, b: 5, l: 30};

var lsvgWidth = +legSVG.attr('width');
var lsvgHeight = +legSVG.attr('height');

var legend = legSVG.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(' + [lpadding.r, (lsvgHeight - 15)] + ')');

// SVG Section for the min/mean/max temp
var svg = d3.select('.tempSVG');
var tpadding = {t: 0, l: 55, b: 50, r: 30};

var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var chartWidth = svgWidth - tpadding.r - tpadding.l;
var chartHeight = svgHeight - tpadding.t  - tpadding.b;

var barWidth = chartWidth/365;
var barHeight = chartHeight/3;

var chartG = svg.append('g')
    .attr('class', 'chart')
    .attr('transform', 'translate('+[tpadding.l, tpadding.t]+')');

// SVG Section for the calendar precipitation map
var presvg = d3.select('.precipSVG');
var ppadding = {t: 10, l: 55, b: 40, r: 70};

var presvgWidth = +presvg.attr('width');
var presvgHeight = +presvg.attr('height');

var prechartWidth = presvgWidth - ppadding.r - ppadding.l;
var prechartHeight = presvgHeight - ppadding.t  - ppadding.b;

var cellWidth = prechartWidth/(372/7);
var cellHeight = (prechartHeight - ppadding.t)/7;

var precip = presvg.append('g')
    .attr('class', 'precipChart')
    .attr('transform', 'translate('+[ppadding.l, ppadding.t]+')');
var preLeg = presvg.append('g')
    .attr('class', 'precipLegend')
    .attr('transform', 'translate('+[10, ppadding.t]+')');

// Domains and scales
var parseTime = d3.timeParse("%Y-%m-%d");
var dateDomain = [new Date(2014, 6), new Date(2015, 6)];
var dateScale = d3.scaleTime()
    .domain(dateDomain).range([0,chartWidth]);
var preDateScale = d3.scaleTime()
    .domain(dateDomain).range([0,prechartWidth]);
var tempScale = d3.scaleLinear()
    .domain([-5,115])
    .range([0,chartWidth]);
var precipScale = d3.scaleLinear()
    .domain([1.7, 0])
    .range([0,(prechartHeight-15)]);
var calColors = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, 1.5]);

axisNtext();

function updateChart(chosenCSV) {
    d3.csv(chosenCSV).then(function(dataset) {

        weather = dataset;
        
        dataset.forEach(function(d) {
            d.date = parseTime(d.date);
            d.mean = parseInt(d.actual_mean_temp);
            d.max = parseInt(d.actual_max_temp);
            d.min = parseInt(d.actual_min_temp);
            d.precip = parseFloat(d.actual_precipitation);
        });

        var maxTemp = 115;
        var minTemp = -5;
        
        colorFn = d3.scaleSequential(d3.interpolateRdYlBu).domain([
            Math.floor(maxTemp),
            Math.ceil(minTemp)
          ]);
        
        drawLegend(minTemp, maxTemp);
        drawMin();
        drawMean();
        drawMax();
        drawCalendar();
        drawCalLegend();
    });
}

function drawCalendar() {
    var cal = precip.selectAll('.rect')
        .data(weather, function(d) {
            return d.date;
        });

    var calEnter = cal.enter()
        .append('g')
        .attr("class", 'rect');

    var tooltip = d3.select('.tol');
    
    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(event,d) {
        console.log(d);
        tooltip.style("opacity", 1.0)
        .style("text-align", "left");
    }
    var mousemove = function(event,d) {
        var format = d3.timeFormat("%m/%d/%y");
        console.log()
        tooltip
        .html("Date: " + format(event.date) + "<br>" + "Precip: " + event.precip + 
                "<br>" + "Record: " + event.record_precipitation)
        .style("left", (parseInt(d/7) * cellWidth + 70) + "px")
        .style("top", ((d%7) * cellHeight + svgHeight + 
                        lsvgHeight + ppadding.b + tpadding.b + 
                        lpadding.t + ppadding.t + lpadding.b + 10) + "px")
    }
    var mouseleave = function(d) {
        tooltip.style("opacity", 0.0)
    }
    
    calEnter.merge(cal)
        .attr('transform', function(d, i) {
            return "translate("+ [(parseInt(i/7) * cellWidth), ((i%7) * cellHeight + 0.5)] +")";
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .transition()
        .duration(1000)
        .attr("fill", function(d) {
            return calColors(d.precip);
        })
    
    calEnter.append('rect')
        .attr("height", cellHeight - 1.5)
        .attr("width", cellWidth - 1.5)
        .text(function(d) { return d.precip; });
    
    cal.exit().remove();
}

function drawCalLegend() {
    var catNum = 100;
    var pmin = 0.0;
    var pmax = 1.5;

    var cat = [...Array(catNum)].map((_, i) => {
        var upBound = pmax / catNum * (i + 1);
        var lowBound = pmin / catNum * i;
    
        return {
            upBound,
            lowBound,
            color: d3.interpolateBlues(upBound / (pmax-0.1))
        };
    });

    preLeg
        .selectAll('rect')
        .data(cat)
        .enter()
        .append('rect')
        .attr('fill', function(c) {
            return c.color;
        })
        .attr('x', prechartWidth + ppadding.l)
        .attr('y', function(c,i) {
            return (prechartHeight - 11.5)/catNum * (catNum - i - 1);
        })
        .attr('height', prechartHeight/catNum)
        .attr('width', 15)
}

function drawLegend(min, max) {
    var categoriesCount = 365;

    var categories = [...Array(categoriesCount)].map((_, i) => {
        const upperBound = max / categoriesCount * (i + 1);
        const lowerBound = min / categoriesCount * i;
    
        return {
            upperBound,
            lowerBound,
            color: d3.interpolateRdYlBu(upperBound / max)
        };
    });

    legend
        .selectAll('rect')
        .data(categories)
        .enter()
        .append('rect')
        .attr('fill', function(d) {
            return d.color;
        })
        .attr('x', function (d, i) {
            return chartWidth/categoriesCount * (categoriesCount-i-1);
        })
        .attr('width', chartWidth/categoriesCount)
        .attr('height', 15)
}

function drawMin() {
    var rectMin = chartG.selectAll('.rectMin')
    .data(weather, function(d) {
        return d.date;
    });

    var rectMinEnter = rectMin.enter()
    .append('g')
    .attr("class", 'rectMin');

    rectMinEnter.merge(rectMin)
        .attr("transform", function(d,i) {
            return "translate(" + [(i * barWidth),(barHeight * 0)] + ")"
        })
        .transition()
        .duration(1000)
        .attr("fill", function(d) {
            return colorFn(d.min)
        });

    rectMinEnter.append('rect')
        .attr("height", barHeight)
        .attr("width", barWidth);

    rectMin.exit().remove();
}

function drawMean() {
    var rectMean = chartG.selectAll('.rectMean')
    .data(weather, function(d) {
        return d.date;
    });

    var rectMeanEnter = rectMean.enter()
    .append('g')
    .attr("class", 'rectMean');

    rectMeanEnter.merge(rectMean)
        .attr("transform", function(d,i) {
            return "translate(" + [(i * barWidth),(barHeight * 1)] + ")"
        })
        .transition()
        .duration(1000)
        .attr("fill", d => colorFn(d.mean));

    rectMeanEnter.append('rect')
        .attr("height", barHeight)
        .attr("width", barWidth);

    rectMean.exit().remove();
}

function drawMax() {
    var rectMax = chartG.selectAll('.rectMax')
    .data(weather, function(d) {
        return d.date;
    });

    var rectMaxEnter = rectMax.enter()
    .append('g')
    .attr("class", 'rectMax');

    rectMaxEnter.merge(rectMax)
        .attr("transform", function(d,i) {
            return "translate(" + [(i * barWidth),(barHeight * 2)] + ")"
        })
        .transition()
        .duration(1000)
        .attr("fill", d => colorFn(d.max));

    rectMaxEnter.append('rect')
        .attr("height", barHeight)
        .attr("width", barWidth);

    rectMax.exit().remove();
}



function axisNtext() {
    var xaxis = d3.axisBottom(dateScale);
    var pxaxis = d3.axisBottom(preDateScale);
    var chartH = chartHeight + tpadding.t;
    var chartPH = prechartHeight + ppadding.t;
    var lGap = tpadding.l - 5;
    var tGap = barHeight/2;
    var fontSize = 12;
    var cellGap = cellHeight/2;
    var lxaxis = d3.axisTop(tempScale);
    var pyaxis = d3.axisRight(precipScale);

    // Axis and label for the legend
    legSVG.append('g')
        .attr('class', 'legend-axis')
        .attr('transform', 'translate(' + [lpadding.r, 25] + ')')
        .call(lxaxis
            .ticks(12)
            .tickFormat(function(d) {
                return d + '°F';
            })
        );

    // Axes and labels for Precipitation chart
    preLeg.append('g')
        .attr('class', 'precip-axis')
        .attr('transform', 'translate(' + [(ppadding.r + prechartWidth ), 0] + ')')
        .call(pyaxis
            .ticks(3)
            .tickFormat(function(d) {
                return d + 'mm';
            })
        );

    presvg.append('g')
        .attr('transform', 'translate(' + [tpadding.l, chartH] + ')')
        .call(pxaxis
            .ticks(d3.timeMonth, 1)
            .tickFormat(d3.timeFormat('%B'))
            );
    presvg.append('text')
        .attr('class', 'year-label')
        .attr('x', prechartWidth/4 + ppadding.l)
        .attr('y', chartPH + ppadding.b - 17)
        .attr("text-anchor", "middle")
        .text('2014');
        
    presvg.append('text')
        .attr('class', 'year-label')
        .attr('x', 3 * prechartWidth/4 + ppadding.l)
        .attr('y', chartPH + ppadding.b - 17)
        .attr("text-anchor", "middle")
        .text('2015');

    presvg.append('text')
        .attr('class', 'axis-label')
        .attr('x', 2 * prechartWidth/4 + ppadding.l)
        .attr('y', chartPH + ppadding.b - 5)
        .attr("text-anchor", "middle")
        .text('Date');

    presvg.append('text')
        .attr('class', 'text-label')
        .attr('x', ppadding.l - 5)
        .attr('y', cellGap * 1 + ppadding.t + 3)
        .text('Mon');
    presvg.append('text')
        .attr('class', 'text-label')
        .attr('x', ppadding.l - 5)
        .attr('y', cellGap * 3 + ppadding.t + 3)
        .text('Tues');
    presvg.append('text')
        .attr('class', 'text-label')
        .attr('x', ppadding.l - 5)
        .attr('y', cellGap * 5 + ppadding.t + 3)
        .text('Wed');
    presvg.append('text')
        .attr('class', 'text-label')
        .attr('x', ppadding.l - 5)
        .attr('y', cellGap * 7 + ppadding.t + 3)
        .text('Thu');
    presvg.append('text')
        .attr('class', 'text-label')
        .attr('x', ppadding.l - 5)
        .attr('y', cellGap * 9 + ppadding.t + 3)
        .text('Fri');
    presvg.append('text')
        .attr('class', 'text-label')
        .attr('x', ppadding.l - 5)
        .attr('y', cellGap * 11 + ppadding.t + 3)
        .text('Sat');
    presvg.append('text')
        .attr('class', 'text-label')
        .attr('x', ppadding.l - 5)
        .attr('y', cellGap * 13 + ppadding.t + 3)
        .text('Sun');
        
    // Axes and labels for the heatmap chart
    svg.append('g')
        .attr('class', 'x-month')
        .attr('transform', 'translate(' + [tpadding.l, chartH] + ')')
        .call(xaxis
            .ticks(d3.timeMonth, 1)
            .tickFormat(d3.timeFormat('%B'))
            );
    svg.append('text')
        .attr('class', 'year-label')
        .attr('x', chartWidth/4 + tpadding.l)
        .attr('y', chartH + tpadding.b - 17)
        .attr("text-anchor", "middle")
        .text('2014');
        
    svg.append('text')
        .attr('class', 'year-label')
        .attr('x', 3 * chartWidth/4 + tpadding.l)
        .attr('y', chartH + tpadding.b - 17)
        .attr("text-anchor", "middle")
        .text('2015');

    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', 2 * chartWidth/4 + tpadding.l)
        .attr('y', chartH + tpadding.b - 5)
        .attr("text-anchor", "middle")
        .text('Date');
            
    svg.append('text')
        .attr('class', 'text-label')
        .attr('x', lGap)
        .attr('y', tGap + tpadding.t/2)
        .text('Lowest');
    svg.append('text')
        .attr('class', 'text-label')
        .attr('x', lGap)
        .attr('y', tGap + fontSize + tpadding.t/2)
        .text('Temp');

    svg.append('text')
        .attr('class', 'text-label')
        .attr('x', lGap)
        .attr('y', tGap * 3 + tpadding.t/2)
        .text('Average');
    svg.append('text')
        .attr('class', 'text-label')
        .attr('x', lGap)
        .attr('y', tGap * 3 + fontSize + tpadding.t/2)
        .text('Temp');

    svg.append('text')
        .attr('class', 'text-label')
        .attr('x', lGap)
        .attr('y', tGap * 5 + tpadding.t/2)
        .text('Highest');
    svg.append('text')
        .attr('class', 'text-label')
        .attr('x', lGap)
        .attr('y', tGap * 5 + fontSize + tpadding.t/2)
        .text('Temp');
}

updateChart("Data/KSEA.csv");
