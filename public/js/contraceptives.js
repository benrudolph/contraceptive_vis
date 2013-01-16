(function(window) {
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

  var colorInterpolater = d3.interpolateHsl("#FFFFFF", "#000000")
  var details = detailsChart()

  /* World Map */
  countries.selectAll('path')
    .data(window.countries_data.features)
    .enter()
    .append('svg:path')
    .attr('d', path)
    .attr('fill', function(d) {
       return colorInterpolater(parseInt(d.properties.AnyMethod) / 100)
    })
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .on("mouseover", function(d) {
      details.data(d3.entries(d.properties))
      details()
    })

  function detailsChart(_data) {

    var width = 300;
    var height = 100;
    var data = _data

    var TRAD_METHODS = [
      "AnyTraditionalMethod",
      "Withdrawal",
      "Rhythm",
      "OtherTraditional"

    ]
    var MODERN_METHODS = [
      "AnyModernMethod",
      "Pill"
    ]

    var x = d3.scale.linear()
      .domain([0, 300])
      .range([0, width])

    var y = d3.scale.ordinal()
      .rangePoints([0, height], 1)
      .domain(TRAD_METHODS.concat(MODERN_METHODS))

    var container = d3.select("#details")
      .append("svg")
      .attr("class", "detailsContainer")

    container.append("svg")
      .attr("class", "barGraphContainer")

    function barGraph() {

      var svg = container.select(".barGraphContainer")
      var selection = svg.selectAll(".bar")
        .data(data.filter(function(d) {
          return (TRAD_METHODS.indexOf(d.key) !== -1 || MODERN_METHODS.indexOf(d.key) !== -1)
        }), function(d) { return d.key })

      selection.enter().append("rect")

      selection
          .attr("x", 0)
          .attr("y", function(d) {
            return y(d.key)
          })
          .attr("height", 20)
          .attr("width", function(d) {
            return x(d.value)
          })
          .attr("class", "bar")
          .style("fill", function(d) {
            if (TRAD_METHODS.indexOf(d.key) !== -1) {
              return "#FF0000"
            } else {
              return "#00FF00"
            }
          })

      selection.exit()
        .remove()
    }

    barGraph.data = function(_data) {
      if (!arguments.length) return data;
      data = _data
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
