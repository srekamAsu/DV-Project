var margin = 100;
var diameter = 600;
if (screen.width < 1300) {
    diameter = screen.width / 2 - 100;
}
var categoryToFilename = {"sports_and_outdoors" : "data/sports_and_outdoors1.json", "All_Beauty" : "data/beauty.json",
                          "Clothing_and_Jewelry" : "data/cloathing_and_jewelery.json", "Appliances" : "data/appliances.json",
                          "Movies_and_TV" : "data/movies_and_tv.json", "Books" : "data/books.json", "Automotive" : "data/automotive.json",
                          "cds_and_vinyl" : "data/cds_and_vinyl.json", "cell_phones_and_accessories" : "data/cell_phones_and_accessories.json"};
var categories= ["sports_and_outdoors", "All_Beauty", "Appliances", "Arts_Crafts_Sewing", "Fashion", "Clothing_and_Jewelry", "Movies_and_TV", "Books" ,
                "Automitive", "cds_and_vinyl", "cell_phones_and_accessories"]
var defalutCategory = "sports_and_outdoors";
var color = d3.scaleOrdinal(d3.schemeCategory10);
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", "0");

var select = document.getElementById("selectCategory");
for(var i = 0; i < categories.length; i++) {
    var opt = categories[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
}
var globalCategoryData;

window.onload = function() {
    category = defalutCategory;
    loadViz(category);
};

var totalCurrentData = {}
var selectedTab = "category"
var element2 = document.getElementById("most-ratings");
var element3 = document.getElementById("top-ratings");
var element4 = document.getElementById("overall");
element2.className = "nav-link disabled"
element3.className = "nav-link disabled"
element4.className = "nav-link active"

function loadViz(category) {
  d3.json(categoryToFilename[category], function(error, data) {
      if (error) {
          d3.select(".hello").text("error happended");
          return;
      }
      totalCurrentData = data["category"];
      totalBrandData = data["brands"];
      if (totalBrandData.length > 15){
        totalBrandData = totalBrandData.slice(0, 15);
      }
      console.log(totalBrandData);
      bubbleVisualization(data["category"], "category")
      barGraph(totalBrandData, '#brand-barchart', 'brand');
      drawLineChart(totalBrandData[0].brand, totalBrandData[0].value.dates,'#brand-timeseries', ' brand')
  });
  document.getElementById("autocomplete").placeholder = "Search SubCategory in " + category + "category";
}

function bubbleVisualization(data, type) {
  console.log(data);
    bubbleDataModification = d3.nest().key(function(d) {
        return d[type];
    }).rollup(function(entry) {
        var countModified = entry[0].value.count/100;
        if (countModified > 10000) {
          countModified = 150 + (countModified/100) * 5;
        } else if (countModified > 2000) {
          countModified = 150 + (countModified/10) * 2;
        } else if (countModified > 1000) {
          countModified = 150 + (countModified/10) * 3;
        } else if (countModified > 200){
          countModified = 150 + (countModified/10) * 2;
        } else {
          countModified = 150;
        }
        return {
            data: entry[0].value,
            count: countModified
        };
    }).entries(data);
    d3.selectAll("#bubble-container svg").remove();
    modifiedData = {
        "children": bubbleDataModification
    };

    var bubble = d3.pack(modifiedData)
        .size([diameter, diameter])
        .padding(1);


    var svg = d3.select("#bubble-container")
        .append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "my-bubble")
        .attr("id", "category-bubble")
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle");

    var leaves = d3.hierarchy(modifiedData)
        .sum(function(d) {
            if (d.value && parseInt(d.value.data.count) > 10) {
                return parseInt(d.value.count);
            } else {
                return 0;
            }
        })
        .sort(function(a, b) {
            return b.value - a.value;
        });;

    var node = svg.selectAll(".node")
        .data(bubble(leaves).descendants())
        .enter()
        .filter(function(d) {
            return !d.children
        })
        .append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });



    node.append("circle")
        .attr("r", function(d) {
            return d.r;
        })
        .style("fill", function(d, i) {
            return color(i);
        })
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .duration(500)
                .style("cursor", "pointer")
                .attr("width", 60)
            tooltip.html("<span>" + d.data.key + " present in " + parseInt(d.data.value.data.count) + " answers " + "</span>")
            tooltip.style("top", (d3.event.pageY - 20) + "px").style("left", (d3.event.pageX + 20) + "px").style("display", "block").style("opacity", "1");
        })
        .on("mouseout", function(d) {
            tooltip.style("opacity", 0);
        })
        .on('click', function(d) {
            $('.popup-overlay, .popup-content').addClass("active");
            $('.popup-overlay').fadeIn(300);
            const lineChart = document.querySelector('#sublineChart')
            if (lineChart.children.length) {
                lineChart.children[0].remove()
            }
            var key = d.data.key;
            var categoryBrands = d.data.value.data.brands;
            var categoryDates = d.data.value.data.dates;
            if (categoryBrands.length > 15){
              categoryBrands = categoryBrands.slice(0, 15);
            }
            if (categoryDates.length > 15){
              categoryDates = categoryDates.slice(0, 15);
            }
            barChart(categoryBrands, '#subCategory-barChart', 'brand', key);
            drawLineChart(key, categoryDates, '#sublineChart', 'category');
            $('#close').click(function() {
                $('.popup-overlay').fadeOut(300);
            });
        });


    node.append("text")
        .attr("dy", ".2em")
        .text(function(d) {
            return d.data.key + "\n"
        })
        .attr("font-size", function(d) {
            return d.r / 5;
        })
        .attr("fill", "white");

    node.append("text")
        .attr("dy", "1.3em")
        .text(function(d) {
            return parseInt(d.data.value.data.count);
        })
        .attr("font-size", function(d) {
            return d.r / 5;
        })
        .attr("fill", "white");


    d3.select(self.frameElement)
        .style("height", diameter + "px");

}



function barGraph(data, className, type) {
    var margin = {top: 20, bottom: 70, left: 70, right: 10};
    var width = 400;
    var height = 300;

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
            return Number(d.value.count*1.3);
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
        .style("fill", 'steelblue')
        .attr("x", function (d) {
            return (xScale(d[type])+margin.left);
        })
        .attr("y", function (d) {
            return (yScale(Number(d.value.count))-margin.bottom);
        })
        .on("mouseover", function(d){
            d3.select(this)
            	.style("fill", "navajowhite");
            tooltip.html(d[type] + '<br/>' + parseInt(d.value.count))
            tooltip.style("top", (d3.event.pageY + 34) + "px").style("left", (d3.event.pageX - 30) + "px").style("display", "block").style("opacity", "1");
        })
        .on("mouseout", function () {
            d3.select(this)
            	.style("fill", "steelblue");
            tooltip.style("opacity", 0);

        })
        .on('click', function(d) {
            const lineChart = document.querySelector('#brand-timeseries')
            if (lineChart.children.length) {
                lineChart.children[0].remove()
            }
            drawLineChart(d.brand, d.value.dates, '#brand-timeseries', 'brand')

        })
        .attr("width", xScale.bandwidth())
        .attr("height", function (d) {
            return height - yScale(Number(d.value.count));
        }).attr("fill","steelblue");
}


$(document).ready(function() {
    $("#autocomplete").on("keyup", function() {

        var value = $(this).val().toLowerCase();
        console.log("in search ", totalCurrentData);
        var newTotalData = []
        if (value != null && value.length != 0) {
            for (var index in totalCurrentData) {
                var iteratedData = totalCurrentData[index];
                if (iteratedData[selectedTab].toLowerCase().startsWith(value)) {
                    newTotalData.push(iteratedData);
                }
            }
            bubbleVisualization(newTotalData, selectedTab);
        } else {
            bubbleVisualization(totalCurrentData, selectedTab);
        }
    });
});
