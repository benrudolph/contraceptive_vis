(function (window) {
  var data,
      xy = d3
            .geo
            .equirectangular()
            .scale($('#map_container').width())
            .translate([$('#map_container').width() / 2, $('#map_container').height() / 2]),
      path = d3
              .geo
              .path()
              .projection(xy),
      svg = d3
              .select('#map_container')
              .append('svg:svg')
              .call(d3.behavior.zoom().on("zoom", redraw))
              .append("svg:g"),
      countries = svg
                    .append('svg:g')
                    .attr('id', 'countries');

  var colorInterpolater = d3.interpolateHsl("#FFFFFF", "#00742a")
  var details = detailsChart()

  /* World Map */
  countries.selectAll('path')
      .data(window.countries_data.features)
      .enter()
      .append('svg:path')
      .attr('d', path)
      .attr('fill', function(d) {
        if (d.properties.AnyMethod) {
          return colorInterpolater(parseInt(d.properties.AnyMethod) / 100)
        }
        return "black"
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .on("mouseover", function(d) {
        d3.select(this).classed("over", true)
        details.data(d3.entries(d.properties))
        details()
      })
      .on("mouseout", function(d) {
        d3.select(this).classed("over", false)
      })

  var gradientWidth = 200

  var gradient = d3.select(".gradient .gradient-box")
      .append("svg")
      .attr("width", gradientWidth)
      .attr("height", 40)
      .selectAll("rect")
      .data(new Array(100))
      .enter()
      .append("rect")
      .attr("height", 40)
      .attr("width", gradientWidth / 100)
      .attr("x", function(d, i) {
        return i * (gradientWidth / 100)
      })
      .attr("y", 0)
      .style("fill", function(d, i) {
        return colorInterpolater(i / 100)
      })



  function detailsChart(_data) {

    var width = 370;
    var data = _data

    var margin = {
      top: 40,
      left: width / 2,
      right: 5,
      bottom: 5,
      between: 6
    }

    var TRAD_METHODS = [
      "AnyTraditionalMethod",
      "Rhythm",
      "Withdrawal",
      "OtherTraditional"

    ]
    var MODERN_METHODS = [
      "",
      "AnyModernMethod",
      "SterilizationFemale",
      "SterilizationMale",
      "Pill",
      "Injectable",
      "IUD",
      "MaleCondom",
      "VaginalBarrierMethods",
      "Implant",
      "OtherModernMethods",
    ]

    var barHeight = 20
    var height = (barHeight + margin.between) * (TRAD_METHODS.length + MODERN_METHODS.length)
    console.log(height)

    var x = d3.scale.linear()
      .domain([0, 100])
      .range([margin.left, width - margin.right])

    var y = d3.scale.ordinal()
      .rangePoints([margin.top, height - margin.bottom], 1)
      .domain(TRAD_METHODS.concat(MODERN_METHODS))

    var container = d3.select("#details")
      .append("svg")
      .attr("class", "detailsContainer")

    container.append("svg")
      .attr("class", "barGraphContainer")

    var data = []
    var country = ""
    var contraceptiveUse = 0.0
    var year = ""

    var labels = container.select(".barGraphContainer").selectAll(".label")
        .data(TRAD_METHODS.concat(MODERN_METHODS))

    labels.enter().append("text")
        .attr("x", margin.left - 5)
        .attr("y", function(d) {
          return y(d) + barHeight / 2
        })
        .attr("height", barHeight)
        .attr("width", margin.left)
        .style("font-size", "14px")
        .style("text-anchor", "end")
        .style("dy", ".35em")
        .text(String)

    function barGraph() {

      var svg = container.select(".barGraphContainer")

      var relevantData = data.filter(function(d) {
          return (TRAD_METHODS.indexOf(d.key) !== -1 || MODERN_METHODS.indexOf(d.key) !== -1)
        })

      var selection = svg.selectAll(".bar")
        .data(relevantData, function(d) { return d.key })

      var dataLabels = svg.selectAll(".data-label")
        .data(relevantData.filter(function(d) {
          return (d.key === "AnyTraditionalMethod" || d.key=== "AnyModernMethod")
        }))


      svg.selectAll(".title").remove()
      var title = svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("width", width)
        .attr("height", margin.top - 10)
        .attr("text-anchor", "middle")
        .attr("class", "title")
        .style("font-size", "20px")
        .text(country + " | " + year)

      var subtitle = svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", 35)
        .attr("width", width)
        .attr("height", margin.top - 10)
        .attr("text-anchor", "middle")
        .attr("class", "title")
        .style("font-size", "14px")
        .text("Total percentage using contraceptives: " + contraceptiveUse + "%")

      dataLabels.enter().append("text")

      dataLabels
          .attr("x", function(d) {
            return x(d.value) + 3
          })
          .attr("y", function(d) {
            return y(d.key) + (barHeight / 2) + 5
          })
          .attr("height", barHeight)
          .attr("width", 20)
          .attr("class", "data-label")
          .attr("text-anchor", "start")
          .style("font-size", "14px")
          .text(function(d) { if (d.value) { return d.value + "%" } })

      selection.enter().append("rect")

      selection
          .attr("x", margin.left)
          .attr("y", function(d) {
            return y(d.key)
          })
          .attr("height", barHeight)
          .attr("width", function(d) {
            return x(d.value) - margin.left
          })
          .attr("class", "bar")
          .style("fill", function(d) {
            if (TRAD_METHODS.indexOf(d.key) !== -1) {
              return "#FF0000"
            } else {
              return "steelblue"
            }
          })
          .style("fill-opacity", function(d) {
            if (d.key === "AnyTraditionalMethod" || d.key === "AnyModernMethod") {
              return 0.8
            } else {
              return 0.2
            }
          })

      selection.exit()
        .remove()

      dataLabels.exit()
        .remove()
    }

    barGraph.data = function(_data) {
      if (!arguments.length) return data;
      data = _data
      data.forEach(function(d) {
        if (d.key === "name") {
          country = d.value
        } else if (d.key === "AnyMethod") {
          contraceptiveUse = d.value
        } else if (d.key === "Year") {
          year = d.value
        }
      })
      return barGraph
    }

    return barGraph

  }

  function redraw() {
    console.log("here", d3.event.translate, d3.event.scale);
    svg.attr("transform",
        "translate(" + d3.event.translate + ")"
        + " scale(" + d3.event.scale + ")");
    svg.selectAll("g.node path")
      .attr("transform", "scale(1)")
  }
})(this);
