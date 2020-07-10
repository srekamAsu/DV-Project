var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function drawLineChart(keyBrand, extractedDates, svgID, catOrBrand){
    var dates = [];
    var  Dcount = [];
    for (var index in months){
        month = months[index]
        dates.push(month);
        if (month in extractedDates){
            Dcount.push(extractedDates[month]);
        } else{
            Dcount.push("0");
        }
    }
    drawSubLine(dates,Dcount,extractedDates,keyBrand, svgID, catOrBrand);
}

function drawSubLine(dates, Dcount, datesExtracted, topic, svgID, catOrBrand){
  console.log(catOrBrand);
    var margin = {top: 20, bottom: 70, left: 50, right: 20};
    var width = 380;
    var height = 330;
    if (catOrBrand.toLowerCase() === "category") {
      width = 540;
      height = 260;
    }
    var svg = d3.select(svgID)
        .attr('height', height )
        .attr('width', width )
        .attr('transform', 'translate(0,20)');
    svg.selectAll("*").remove();
    var xScale = d3.scaleBand()
        .rangeRound([0, width-margin.left])
        .padding(1)
        .domain(dates.map(function (d) {
            return d;
        }))

    const yMax = Math.max(...Dcount)

    var yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, yMax])

    var tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", "0");

    var line = d3.line()
        .x(function(d, i) {
            return xScale(d);
        })
        .y(function(d) {
            if (d in datesExtracted){
               return yScale(datesExtracted[d])
            }
            return yScale(0)
            })
        .curve(d3.curveMonotoneX)

    var svg = d3.select(svgID)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    svg.append("path")
        .datum(dates)
        .attr("class", "line")
        .attr("d", line);
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .style("font-size", "20px")
        .style("font-family", "serif")
        .style("text-decoration", "underline")
        .text("Frequency of " + topic + " " + catOrBrand);
    svg.selectAll(".dot")
        .data(dates)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", function(d) {
            return xScale(d)
        })
        .attr("cy", function(d) {
            if (d in datesExtracted){
               return yScale(datesExtracted[d])
            }
            return yScale(0)
         })
        .attr("r", 5)
        .on("mouseover", function(a) {
            d3.select(this)
            	.attr("class", "focus")
              .attr("fill", "navajowhite");
            tooltip.html( a + '<hr/>' + datesExtracted[a])
            tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 20) + "px").style("display", "block").style("opacity", "1");
            })
        .on("mouseout", function() {
            d3.select(this)
              .attr("stroke", "black")
            	.attr("fill", "steelblue");
            tooltip.style("opacity", 0);
        })

}
