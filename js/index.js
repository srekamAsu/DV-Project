var totalCurrentData = {}
var selectedTab = "overall"
var element1 = document.getElementById("most-sells");
var element2 = document.getElementById("most-ratings");
var element3 = document.getElementById("top-ratings");
var element4 = document.getElementById("overall");
element1.className = "nav-link disabled"
element2.className = "nav-link disabled"
element3.className = "nav-link disabled"
element4.className = "nav-link active"
element1.onclick = function() {
    element1.className = "nav-link active"
    element2.className = "nav-link disabled"
    element3.className = "nav-link disabled"


};
element2.onclick = function() {
    element1.className = "nav-link disabled"
    element2.className = "nav-link active"
    element3.className = "nav-link disabled"

};
element3.onclick = function() {
    element1.className = "nav-link disabled"
    element2.className = "nav-link disabled"
    element3.className = "nav-link active"
    
};
