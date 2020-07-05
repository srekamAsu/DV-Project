var margin = 100;
var diameter = 600;
if (screen.width < 1300) {
    diameter = screen.width / 2 - 100;
}
var categoryToFilename = {"sports" : "data/sports_and_outdoors1.json"};
var defalutCategory = "sports";
var color = d3.scaleOrdinal(d3.schemeCategory10);
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", "0");


window.onload = function() {
    category = defalutCategory;
    d3.json(categoryToFilename[category], function(error, data) {
        if (error) {
            d3.select(".hello").text("error happended");
            return;
        }
        totalCurrentData = data["category"];
        totalBrandData = data["brands"];
        console.log(totalBrandData);
        bubbleVisualization(data["category"], "category")
    });
};

var totalCurrentData = {}
var selectedTab = "category"
var element1 = document.getElementById("most-sells");
var element2 = document.getElementById("most-ratings");
var element3 = document.getElementById("top-ratings");
var element4 = document.getElementById("overall");
element1.className = "nav-link disabled"
element2.className = "nav-link disabled"
element3.className = "nav-link disabled"
element4.className = "nav-link active"


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
            console.log("in clicked");
            $(".popup-overlay, .popup-content").addClass("active");
            $('.popup-overlay').fadeIn(300);
            const lineChart = document.querySelector('#lineChart')
            if (lineChart.children.length) {
                lineChart.children[0].remove()
            }
            getbarCharts(d.data.key, d.data.value.data)
            lineData(d.data.key, d.data.value.data)
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
