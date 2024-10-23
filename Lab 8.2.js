function init() {
    var w = 800;
    var h = 600;

    var svg = d3.select("#map-container")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    var projection = d3.geoMercator()
                       .center([145, -36.5])
                       .translate([w / 2, h / 2])
                       .scale(3000);

    var path = d3.geoPath().projection(projection);

    var color = d3.scaleQuantize()
                    .range(["#cce7ff", "#99cfff", "#66b7ff", "#339fff", "#0077e6"]);

    d3.csv("VIC_LGA_unemployment.csv").then(function(unemploymentData) {
        unemploymentData.forEach(function(d) {
            d.unemployed = +d.unemployed;
        });

        color.domain([
            d3.min(unemploymentData, d => d.unemployed),
            d3.max(unemploymentData, d => d.unemployed)
        ]);

        d3.json("https://raw.githubusercontent.com/ChrisOng04/LabDataVis/refs/heads/main/Lab8/LGA_VIC.json").then(function(geojson) {
            unemploymentData.forEach(function(d) {
                var dataLGA = d.LGA;
                var dataValue = d.unemployed;

                geojson.features.forEach(function(feature) {
                    if (feature.properties.LGA_name === dataLGA) {
                        feature.properties.unemployed = dataValue;
                    }
                });
            });

            svg.selectAll("path")
               .data(geojson.features)
               .enter()
               .append("path")
               .attr("d", path)
               .attr("fill", function(d) {
                   var value = d.properties.unemployed;
                   return value ? color(value) : "#ccc";
               })
               .attr("stroke", "#333")
               .attr("stroke-width", 0.5)
               .on("mouseover", function(event, d) {
                   var LGAName = d.properties.LGA_name;
                   var unemployed = d.properties.unemployed || "No data";
                   d3.select("#tooltip")
                     .style("left", (event.pageX + 5) + "px")
                     .style("top", (event.pageY - 28) + "px")
                     .style("opacity", 1)
                     .html(`<strong>${LGAName}</strong><br>Unemployed: ${unemployed}`);
               })
               .on("mouseout", function() {
                   d3.select("#tooltip")
                     .style("opacity", 0);
               });

            d3.csv("VIC_city.csv").then(function(cityData) {
                svg.selectAll("circle")
                   .data(cityData)
                   .enter()
                   .append("circle")
                   .attr("cx", d => projection([+d.lon, +d.lat])[0])
                   .attr("cy", d => projection([+d.lon, +d.lat])[1])
                   .attr("r", 5)
                   .style("fill", "red")
                   .style("opacity", 0.75)
                   .on("mouseover", function(event, d) {
                       var cityName = d.city_name;
                       d3.select("#tooltip")
                         .style("left", (event.pageX + 5) + "px")
                         .style("top", (event.pageY - 28) + "px")
                         .style("opacity", 1)
                         .html(`<strong>${cityName}</strong>`);
                   })
                   .on("mouseout", function() {
                       d3.select("#tooltip")
                         .style("opacity", 0);
                   });
            }).catch(function(error) {
                console.error("Error loading city data: ", error);
            });

        }).catch(function(error) {
            console.error("Error loading the GeoJSON file: ", error);
        });
    }).catch(function(error) {
        console.error("Error loading the CSV file: ", error);
    });
}

window.onload = init;
