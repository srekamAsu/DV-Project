var totalCurrentData = {}
var selectedTab = "overall"
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];

var categories = ["All_Beauty", "Appliances", "Arts_Crafts_Sewing", "Fashion"];
var default_month = "Jan";
var default_category = "Appliances";
document.getElementById("default_month_option").text = default_month;
document.getElementById("default_category_option").text = default_category;
var select = document.getElementById("selectMonth");
for(var i = 0; i < months.length; i++) {
    var opt = months[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
}
var select = document.getElementById("selectCategory");
for(var i = 0; i < categories.length; i++) {
    var opt = categories[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
}
// var element1 = document.getElementById("most-sells");
var element2 = document.getElementById("most-ratings");
var element3 = document.getElementById("top-ratings");
var element4 = document.getElementById("overall");
// element1.className = "nav-link disabled"
// element2.className = "nav-link disabled"
// element3.className = "nav-link disabled"
// element4.className = "nav-link active"
// element1.onclick = function() {
//     element1.className = "nav-link active"
//     element2.className = "nav-link disabled"
//     element3.className = "nav-link disabled"
//     element4.className = "nav-link disabled"
//
// };

element2.onclick = function() {
    element1.className = "nav-link disabled"
    element2.className = "nav-link active"
    element3.className = "nav-link disabled"
    element4.className = "nav-link disabled"
    loadVisualizations();
};

element3.onclick = function() {
    element2.className = "nav-link disabled"
    element3.className = "nav-link active"
    element4.className = "nav-link disabled"
    loadVisualizations2();
};


window.onload = function() {

    var currentUrl = window.location.href;
    var tab = new URL(currentUrl).searchParams.get("tab");
    console.log(currentUrl, " \n", tab);
    if (tab === null || tab.toLowerCase() === "most-ratings") {
      element2.className = "nav-link active"
      element3.className = "nav-link disabled"
      element4.className = "nav-link disabled"
      loadVisualizations();
      loadVisualizations2();
    } else {
      element2.className = "nav-link disabled"
      element3.className = "nav-link active"
      element4.className = "nav-link disabled"
      loadVisualizations2();
      loadVisualizations();
      console.log("hello");
    }
};

var top_10_ratings_data;

function loadVisualizations() {
  var fileName = "./data/Top10_data_processing/" + default_category + "/processed_data";
  var avgRatings = fileName + "/top10_avg_ratings.json";
  var mostRatings = fileName + "/top10_most_ratings.json";
  d3.json(mostRatings, function(error, data) {
      if (error) {
          d3.select(".hello").text("error happended");
          return;
      }
      top_10_ratings_data = data;
      var month_data = data[default_month];
      var output = [], item;
      for (var type in month_data) {
          item = {};
          item.id = type;
          item.js_value = month_data[type];
          item.value = month_data[type]['num_ratings'];
          output.push(item);
      }
      console.log(output);
      barChartRatings(output, "#most-10-ratings","id");
  });
}


function loadVisualizations2() {
  var fileName = "./data/Top10_data_processing/" + default_category + "/processed_data";
  var avgRatings = fileName + "/top10_avg_ratings.json";
  var mostRatings = fileName + "/top10_most_ratings.json";
  d3.json(avgRatings, function(error, data) {
      if (error) {
          d3.select(".hello").text("error happended");
          return;
      }
      top_10_ratings_data = data;
      var month_data = data[default_month];
      var output = [], item;
      for (var type in month_data) {
          item = {};
          item.id = type;
          item.js_value = month_data[type];
          item.value = month_data[type]['avg_ratings'];
          output.push(item);
      }
      console.log(output);
      barChartRatings(output, "#top-10-ratings","id");
  });
}

function loadViz(value){
  default_month = value;
  var month_data = top_10_ratings_data[default_month];
  var output = [], item;
  for (var type in month_data) {
      item = {};
      item.id = type;
      item.js_value = month_data[type];
      item.value = month_data[type]['avg_ratings'];
      output.push(item);
  }
  console.log(output);
  barChartRatings(output, "#top-10-ratings","id");

}

function loadVizByCategory(value){
  console.log(value);
  default_category = value;
  default_month = "Jan";
  console.log(document.getElementById("selectCategory"));

  loadVisualizations();
}




function barChartRatings(data, className, type) {
    var margin = {top: 20, bottom: 70, left: 40, right: 20};
    var width = 400;
    var height = 400;

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
            d3.select(this)
            	.attr("fill", "navajowhite");
            tooltip.html(d.js_value.title + '<br/>' + parseInt(d.value))
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
