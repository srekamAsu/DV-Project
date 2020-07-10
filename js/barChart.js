
function barChart(data, className, type) {
    var margin = {top: 20, bottom: 70, left: 40, right: 20};
    var width = 410;
    var height = 300;
    console.log(data);
    var svg = d3.select(className)
        .attr('height', height )
        .attr('width', width )
        .attr('transform', 'translate(0,20)');
    svg.selectAll("*").remove();


    var xScale = d3.scaleBand()
                .rangeRound([0, width-margin.left])
                .padding(0.1).domain(data.map(function (d) {
                    return d[type];
                }));



    var yScale = d3.scaleLinear()
        .rangeRound([height, margin.bottom+10]).domain([0, d3.max(data, function (d) {
            return Number(d.value*1.3);
        })]);

    var yAxis = d3.axisLeft().scale(yScale).ticks(5);

    var tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", "0");

    svg.append("g")
        .attr("transform", "translate("+ margin.left + "," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .attr("font-family", "serif")
        .attr("transform", "rotate(-45)translate(-30,-15)");

    svg.append("g")
        .attr("transform", "translate(" + margin.left + ","+ (0 - margin.bottom) +")")
        .call(yAxis)
        .append("text")
        .attr("transform", "translate(30,60)")
        .attr("x", -20)
        .attr("y", 2)
        .attr("dy", "15px")
        .attr("line", "black")
        .style("text-anchor", "end")
        .style("font-size", "10px")
        .attr("font-family", "serif")
        .text("Freq");

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 + (margin.top))
        .attr("text-anchor", "middle")
        .attr("fill", "navajowhite")
        .style("font-size", "20px")
        .style("font-family", "serif")
        .style("text-decoration", "underline");



    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return (xScale(d[type])+margin.left);
        })
        .attr("y", function (d) {
            return (yScale(Number(d.value))-margin.bottom);
        })
        .on("mouseover", function(d){
            console.log("tool", d[type])
            d3.select(this)
            	.attr("fill", "navajowhite");
            tooltip.html(d[type] + '<br/>' + parseInt(d.value))
                //.html("<span>" + d[type] + " ( " + parseInt(d.value) + " ) " + "</span>")
            tooltip.style("top", (d3.event.pageY + 34) + "px").style("left", (d3.event.pageX - 30) + "px").style("display", "block").style("opacity", "1");
        })
        .on("mouseout", function () {
            d3.select(this)
            	.style("fill", "steelblue");
            tooltip.style("opacity", 0);

        })


        .attr("width", xScale.bandwidth())
        .attr("height", function (d) {
            return height - yScale(Number(d.value));
        }).attr("fill","steelblue");
}
