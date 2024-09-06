function init() {
    var w = 500;
    var h = 100;

    function barChart(wombatSightings) {
        var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        svg.selectAll("rect")
            .data(wombatSightings)
            .enter()
            .append("rect")
            .attr("x", function(d, i) {
                return i * (w / wombatSightings.length);
            })
            .attr("y", function(d) {
                return h - (+d.wombats * 4);
            })
            .attr("width", w / wombatSightings.length - 2)
            .attr("height", function(d) {
                return +d.wombats * 4;
            })
            .attr("fill", "blue");
    }

    d3.csv("task_2.4_data.csv").then(function(data) {
        console.log(data);
        var wombatSightings = data;

        barChart(wombatSightings);
    });
}

window.onload = init; 