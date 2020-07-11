var totalCurrentData = {}
var selectedTab = "overall"
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];

var categories = ["All_Beauty", "Automotive", "Clothing_Shoes_and_Jewelry", "Grocery_and_Gourmet_Food", "Luxury_Beauty", "Office_Products", "Software", "Video_Games", "AMAZON_FASHION", "Books", "Digital_Music", "Home_and_Kitchen", "Magazine_Subscriptions", "Patio_Lawn_and_Garden", "Sports_and_Outdoors", "Appliances", "CDs_and_Vinyl", "Electronics", "Industrial_and_Scientific", "Movies_and_TV", "Pet_Supplies", "Tools_and_Home_Improvement", "Arts_Crafts_and_Sewing", "Cell_Phones_and_Accessories", "Gift_Cards", "Kindle_Store", "Musical_Instruments", "Prime_Pantry", "Toys_and_Games"]
var default_month = "Jan";
var default_category = "All_Beauty";
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
    loadVisualizations_most();
};

element3.onclick = function() {
    element2.className = "nav-link disabled"
    element3.className = "nav-link active"
    element4.className = "nav-link disabled"
    loadVisualizations_high();
};


window.onload = function() {

    var currentUrl = window.location.href;
    var tab = new URL(currentUrl).searchParams.get("tab");
    if (tab === null || tab.toLowerCase() === "most-ratings") {
      element2.className = "nav-link active"
      element3.className = "nav-link disabled"
      element4.className = "nav-link disabled"
      loadVisualizations_most();
    } else {
      element2.className = "nav-link disabled"
      element3.className = "nav-link active"
      element4.className = "nav-link disabled"
      loadVisualizations_high();
    }
};

var top_10_ratings_data;

function loadVisualizations_most() {
  var fileName = "./data/top10_data/" + default_category + "/processed_data";
  var mostRatings = fileName + "/top10_most_ratings.json";
  $("#tab1").css("display", "flex");
  $("#tab2").css("display", "none");
  d3.json(mostRatings, function(error, data) {
      if (error) {
          d3.select(".hello").text("error happended");
          return;
      }
      top_10_ratings_data = data;
      var month_data = data[default_month];
      var output_ratings = [], item;
      var output_num_ratings = [];
      for (var type in month_data) {
          var item_rating = {}

          item_rating.id = type;
          item_rating.js_value = month_data[type];
          item_rating.value = month_data[type]['avg_ratings'];
          output_ratings.push(item_rating);

          item = {};
          item.id = type;
          item.js_value = month_data[type];
          item.value = month_data[type]['num_ratings'];
          output_num_ratings.push(item);
      }
      barChartRatings(output_num_ratings, "#most-10-ratings","id", "No of Reviews");
      barChartRatings(output_ratings, "#top-10-ratings","id", "Ratings");
  });
}


function loadVisualizations_high() {
  $("#tab1").css("display", "none");
  $("#tab2").css("display", "flex");
  var fileName = "./data/top10_data/" + default_category + "/processed_data";
  var avgRatings = fileName + "/top10_avg_ratings.json";
  d3.json(avgRatings, function(error, data) {
      if (error) {
          d3.select(".hello").text("error happended");
          return;
      }
      top_10_ratings_data = data;
      var month_data = data[default_month];
      var output_ratings = [], item;
      var output_num_ratings = [];
      for (var type in month_data) {
          var item_rating = {}

          item_rating.id = type;
          item_rating.js_value = month_data[type];
          item_rating.value = month_data[type]['avg_ratings'];
          output_ratings.push(item_rating);

          item = {};
          item.id = type;
          item.js_value = month_data[type];
          item.value = month_data[type]['num_ratings'];
          output_num_ratings.push(item);
      }
      barChartRatings(output_num_ratings, "#most-10-ratings1","id", "No of Reviews");
      barChartRatings(output_ratings, "#top-10-ratings1","id", "Ratings");
  });
}

function loadViz(value){
  default_month = value;
  var month_data = top_10_ratings_data[default_month];
  var currentUrl = window.location.href;
  var tab = new URL(currentUrl).searchParams.get("tab");
  if (tab === null || tab.toLowerCase() === "most-ratings") {
    loadVisualizations_most();
  } else {
    loadVisualizations_high();
  }
}

function loadVizByCategory(value){
  console.log(value);
  default_category = value;
  var currentUrl = window.location.href;
  var tab = new URL(currentUrl).searchParams.get("tab");
  if (tab === null || tab.toLowerCase() === "most-ratings") {
    loadVisualizations_most();
  } else {
    loadVisualizations_high();
  }
}




function barChartRatings(data, className, type, yAxisTitle) {
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
                .padding(0.2).domain(data.map(function (d) {
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

    svg.append("text")
        .attr("x", (height - margin.bottom) - 120)
        .attr("y", 65 + (height - margin.bottom))
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .style("font-size", "20px")
        .style("font-family", "serif")
        .text("Product ID");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - 5)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(yAxisTitle);


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
            	.style("fill", "navajowhite");
            tooltip.html(d.js_value.title + '<br/>' + parseInt(d.value));
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
