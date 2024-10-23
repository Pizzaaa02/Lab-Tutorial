// Initialize the map
function init() {
    var w = 800;  // Adjust the width
    var h = 600;  // Adjust the height

    // Create SVG container
    var svg = d3.select("#map-container")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    // Define Mercator projection centered on Victoria
    var projection = d3.geoMercator()
                       .center([145, -36.5])
                       .translate([w / 2, h / 2])
                       .scale(3000);

    var path = d3.geoPath().projection(projection);

    // Define the color scale for unemployment data
    var color = d3.scaleQuantize()
                    .range(["#cce7ff", "#99cfff", "#66b7ff", "#339fff", "#0077e6"]);

    // Load unemployment data
    d3.csv("VIC_LGA_unemployment.csv").then(function(unemploymentData) {
        // Convert unemployment data to numbers
        unemploymentData.forEach(function(d) {
            d.unemployed = +d.unemployed; // Convert to number
        });

        // Set the color domain based on unemployment data
        color.domain([
            d3.min(unemploymentData, d => d.unemployed),
            d3.max(unemploymentData, d => d.unemployed)
        ]);

        // Load GeoJSON data for LGAs
        d3.json("https://raw.githubusercontent.com/ChrisOng04/LabDataVis/refs/heads/main/Lab8/LGA_VIC.json").then(function(geojson) {
            // Merge unemployment data with GeoJSON
            unemploymentData.forEach(function(d) {
                var dataLGA = d.LGA; // Ensure this matches your CSV header
                var dataValue = d.unemployed;

                // Find the corresponding LGA in GeoJSON
                geojson.features.forEach(function(feature) {
                    if (feature.properties.LGA_name === dataLGA) { // Check this property name
                        feature.properties.unemployed = dataValue; // Assign the value
                    }
                });
            });

            // Draw the map
            svg.selectAll("path")
               .data(geojson.features)
               .enter()
               .append("path")
               .attr("d", path)
               .attr("fill", function(d) {
                   var value = d.properties.unemployed;
                   return value ? color(value) : "#ccc"; // Default color if no data
               })
               .attr("stroke", "#333")
               .attr("stroke-width", 0.5)
               .on("mouseover", function(event, d) {
                   var LGAName = d.properties.LGA_name;
                   var unemployed = d.properties.unemployed || "No data";
                   d3.select("#tooltip") // Assuming you have a tooltip element
                     .style("left", (event.pageX + 5) + "px")
                     .style("top", (event.pageY - 28) + "px")
                     .style("opacity", 1)
                     .html(`<strong>${LGAName}</strong><br>Unemployed: ${unemployed}`);
               })
               .on("mouseout", function() {
                   d3.select("#tooltip")
                     .style("opacity", 0);
               });

            // Optional: Load and plot city points (e.g., major cities)
            d3.csv("VIC_city.csv").then(function(cityData) {
                svg.selectAll("circle")
                   .data(cityData)
                   .enter()
                   .append("circle")
                   .attr("cx", d => projection([+d.lon, +d.lat])[0])
                   .attr("cy", d => projection([+d.lon, +d.lat])[1])
                   .attr("r", 5)
                   .style("fill", "blue")
                   .style("opacity", 0.75);
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

// Run the init function when the window loads
window.onload = init;
