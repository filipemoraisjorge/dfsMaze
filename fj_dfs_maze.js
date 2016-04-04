//// 0. Describe


window.onload=function(){

window.demoDescription = "implement DFS to create a maze";

//// 1. Define Space and Form
var colors = {
  a1: "#ff2d5d",
  a2: "#42dc8e",
  a3: "#2e43eb",
  a4: "#ffe359",
  b1: "#96bfed",
  b2: "#f5ead6",
  b3: "#f1f3f7",
  b4: "#e2e6ef"
};

var gridSizeX = 9;
var gridSizeY = 9;

//the space where the maze will be "printed"
var spaceGrid = new CanvasSpace("The grid of the completed maze", "#223").display();
var form = new Form(spaceGrid);
var bound = new Rectangle().to(spaceGrid.size);
var center = new Vector(spaceGrid.size.$divide(2));
var mouse = new Vector(spaceGrid.size.x / 2, spaceGrid.size.y / 1.35, 60);
var spaceSize = spaceGrid.size.magnitude() / 2;

//the space where we can see the DFS calculating the maze i.e. erasing walls and marking visited cells
var spaceDFS = new CanvasSpace("The DFS calculating the maze", "#223");
var formDFS = new Form(spaceGrid);



var grid = new Grid(spaceGrid.size.$multiply(0.1, 0.1)).to(spaceGrid.size.$multiply(0.9, 0.9)).init(gridSizeX, gridSizeY, "stretch", "stretch");
var gridFind = new Grid(spaceGrid.size.$multiply(0.1, 0.1)).to(spaceGrid.size.$multiply(0.9, 0.9)).init(gridSizeX, gridSizeY, "stretch", "stretch");
// Use grid.generate() to specify a callback function to render each grid cell
var map = new gridMap(grid, "make");
var findMap = new gridMap(gridFind, "find");


//debug
var debug = false;
var dL = spaceGrid.size.$multiply(0.0001).y //debug text start

//generate functions, how to draw each grid
grid.generate(function(size, position, row, column, type, isOccupied) {
  //var color = colors["a" + Math.ceil(Math.random() * 4)];
  var color = colors.a2;
  var cell = new Rectangle(position).resizeTo(size);
  var cellMap = map.map[row][column];
  var cellObj = [ //Paredes
    {
      line: cell.sides()[0], //N
      viewOn: cellMap.N
    }, {
      line: cell.sides()[2], //S
      viewOn: cellMap.S
    }, {
      line: cell.sides()[1], //E
      viewOn: cellMap.E
    }, {
      line: cell.sides()[3], //O
      viewOn: cellMap.O
    }
  ];
  //Draw it
  for (var i = 0; i < cellObj.length; i++) {
    if (cellObj[i].viewOn) {
      formDFS.stroke(color, 5).fill(color).line(cellObj[i].line)
    }
    form.stroke(false).fill(color).points(cell.toPointSet().points, halfsize = 2, isCircle = true)
  };
}.bind(grid));


/*
// only for debugging
gridFind.generate(function(size, position, row, column, type, isOccupied) {
  //var color = colors["a" + Math.ceil(Math.random() * 4)];

  var color = colors.a1;
  var cell = new Rectangle(position).resizeTo(size);
  var cellMap = findMap.map[row][column];
  var cellObj = [ //Paredes
    {
      line: cell.sides()[0], //N
      viewOn: cellMap.N
    }, {
      line: cell.sides()[2], //S
      viewOn: cellMap.S
    }, {
      line: cell.sides()[1], //E
      viewOn: cellMap.E
    }, {
      line: cell.sides()[3], //O
      viewOn: cellMap.O
    }
  ];
  //Draw it
  for (var i = 0; i < cellObj.length; i++) {
    if (cellObj[i].viewOn) {
      formDFS.stroke(color, 1).fill(color).line(cellObj[i].line)
    }
    form.stroke(false).fill(color).points(cell.toPointSet().points, halfsize = 2, isCircle = true)
    form.fill(colors.b1).font(9).text(position.$add(5, 12), row + ", " + column);
  };
}.bind(gridFind));
*/


gridFind.generate(function(size, position, row, column, type, isOccupied) {
  //var color = colors["a" + Math.ceil(Math.random() * 4)];
  var color = colors.a1;
  //var cellMap = findMap.map[row][column];
  //if (cellMap.visited) {
  //var cell = new Rectangle(position).resizeTo(size);
  //form.fill(color).stroke(false).rect(cell)
  //}
  var cell = new Rectangle(position).resizeTo(size);
  var cellMap = findMap.map[row][column];
  var cellObj = [ //Paredes
    {
      line: cell.sides()[0].getPerpendicular(0.5, len = size.$divide(2), reverse = false), //N
      viewOn: cellMap.N
    }, {
      line: cell.sides()[2].getPerpendicular(0.5, len = size.$divide(2), reverse = false), //S
      viewOn: cellMap.S
    }, {
      line: cell.sides()[1].getPerpendicular(0.5, len = size.$divide(2), reverse = false), //E
      viewOn: cellMap.E
    }, {
      line: cell.sides()[3].getPerpendicular(0.5, len = size.$divide(2), reverse = false), //O
      viewOn: cellMap.O
    }
  ];
  //Draw it
  for (var i = 0; i < cellObj.length; i++) {
    if (!cellObj[i].viewOn) {
      form.stroke(color, 2, "round").fill(color).line(cellObj[i].line)
    }
  };
  //form.fill(colors.b1).font(9).text(position.$add(5, 12), row + ", " + column);
}.bind(gridFind));


//**************************************************************************
// gridMap object
//  as an map array and a grid object to represent it
//**************************************************************************
function gridMap(aGrid, kind) {
  this.map = []; //2d array [row][columns]
  //fill this.map array with object {N,E,S,O,visited} -> cell walls as booleans
  for (var i = 0; i < aGrid.rows; i++) { //row
    var thisColumn = [];
    for (var j = 0; j < aGrid.columns; j++) { //column
      thisColumn.push({
        N: true,
        E: true,
        S: true,
        O: true,
        visited: false
      })
    }
    this.map.push(thisColumn);

  };

  this.grid = aGrid;

  this.kind = kind; //"make" or "find"

  this.rows = this.map.length; //aGrid.rows;

  this.columns = this.map[0].length; //aGrid.columns

  this.moveOptions = function(r, c, kind, mazeMap) {
    temp = [
      [c, r - 1], //N
      [c + 1, r], //E
      [c, r + 1], //S
      [c - 1, r] //O
    ];
    ns = []
    for (var i = 0; i < temp.length; i++) {
      var n = temp[i];

    switch (kind) {
        case "make":
          //options inside the limits and not visited
          var condition = (n[0] >= 0 && n[0] < this.columns && n[1] >= 0 && n[1] < this.rows) && !this.map[n[1]][n[0]].visited;

          //#####  debug
          if(debug) {console.log("cell "+ r+", " + c +" nextC "+ n[1] + ", " + n[0] + " | cond=" +condition);}

          break;

				case "find":
          //using options that aren't a wall in mazeMap and that were not visited in this map.
          var mapCell = mazeMap.map[r][c];
          var wall = "NESO".charAt(i);
          var condition = !mapCell[wall] && !this.map[n[1]][n[0]].visited;

      //#####  debug
     if(debug) {if(kind == "find") { console.log("cell "+ r+", " + c +" nextC "+ n[1] + ", " + n[0] + " | "+ wall + " " + mapCell[wall] +" | c=" + condition) }}

          break;
      }
   if (condition) {
        ns.push({
          row: n[1],
          col: n[0],
          NESO: "NESO".charAt(i)
        })
         };
      };
    if (debug) {console.log("--------------------------");}

    return ns;
  };

  this.drawGrid = function() {
    this.grid.create();
  };


};
//end gridMap

//DFS

//randomize startpoint, endpoint
var startRow = Math.floor(Math.random() * grid.rows);
var startCol = Math.floor(Math.random() * grid.columns);

var endRow = Math.floor(Math.random() * grid.rows);
var endCol = Math.floor(Math.random() * grid.columns);

//a rectangle representig the cell where we start, invisable
var startRectCell = map.grid.cellToRectangle(startCol, startRow);

//experiment: draw the find tracing route as a curve
var curvePoints = [];
var curveFind = new Curve(startRectCell.center.x, startRectCell.center.y);


//******************************************************************************************
//******************************************************************************************
//**                                                                                      **
//**   DFS function, recursive, diferent exit conditions to Make a maze and Find a path   **
//**                                                                                      **
//******************************************************************************************
//******************************************************************************************
function mazeDFS(thisMap, row, col, kind, stack, rowEnd, colEnd, mazeMap) {
if(debug) {console.log("\n"+ kind + " (" + row + ", " + col +") stack: " + stack.length);}

  //###########################
  //## the cell where we are ##
  //###########################
  var cell = thisMap.map[row][col]

  if (debug){
  //markers for debug
  if (cell.visited) {
    var colorMark = colors.a4 //yellow, as already been visited
    var widthMark = 1;
  } else {
    var colorMark = colors.b1 //ligth blue, visited for the first time
    var widthMark = 1;
  }; //a dif color for 1st or 2nd time pass

}
  //########################
  //##  mark as visited   ##
  //########################
  cell.visited = true; //mark as visited

  //######################
  //##   move options   ##
  //######################
  //wich way can we go?
  switch (kind) {
    case "make":
      {
        var moveOpt = thisMap.moveOptions(row, col, "make");
        break;
      }
    case "find":
      {
        var moveOpt = thisMap.moveOptions(row, col, "find", mazeMap);
        break;
      }
  }
if (debug){
  //markers for debug
  if ((moveOpt.length >= 2)) { // a dif color for archor (archor for the last cell visited with more than one route option)
    var colorMark = colors.a1;
    var widthMark = 1;
}
    //draw the markers
    //## ligth blue, visited only one time
    //## yellow, has already been visited
    //## pink, archor/shortcut cell
    rectCell = thisMap.grid.cellToRectangle(col, row) //rectangle of current cell
    if(cell.visited) { formDFS.fill(colors.b3).stroke(false).rect(rectCell.resizeCenterTo(rectCell.length() / 20))};
    formDFS.fill(false).stroke(colorMark, widthMark).circle(new Circle(rectCell.center).setRadius(rectCell.length() / 40)); //circle marking the cells visited
   }
   //######################################
   //## we reached a dead-end, move back ##
   //######################################
  if (moveOpt.length == 0) {

     var nextCell = stack.pop(); //last cell visited
     if(debug) {console.log ("mv: " + moveOpt.length + " poped: " + nextCell.row +", " + nextCell.col + " "+nextCell.NESO);}



   if (kind == "find") {
   //###########################
   //## rebuilding the walls  ##
   //###########################
   //each cell as walls so 2 walls to erase
      var nextCellMap = thisMap.map[nextCell.row][nextCell.col] //and the next cell wall too
      nextCellMap[nextCell.NESO] = true; //this cell wall
    	cell["SONE".charAt("NESO".indexOf(nextCell.NESO))] = true;

       //experiment drwa a cruve to trace the path
      //curve to trace path
      curvePoints.pop();
      curveFind.disconnect(1);

   }


  } else {
    //########################
    //##    move forward    ##
    //########################

    //choose randomly between our move options
    var nextCell = moveOpt[Math.ceil(Math.random() * moveOpt.length) - 1]

    //save on stackMap
    //only need to save when moveOptions.length >= 2, save stack memory for bigger mazes
    //moveOptions.length = 0  dead-end
    //moveOptions.length = 1  only one way, no need to saven
    //moveOptions.length >= 2 in this case we still have routes to explore

    //if (kind=="make" && (moveOpt.length >2)) {

        stack.push({row:row,col:col, NESO:nextCell.NESO});
        if(debug) {console.log ("mv: " + moveOpt.length + " pushed: " + row + ", " + col );}
    //} else { //find
     //   stack.push({row:row,col:col, NESO:nextCell.NESO});
     //push points to curve

      if(kind=="find"){
          var centerPoint = thisMap.grid.cellToRectangle(col, row).center;
          curvePoints.push(centerPoint);
          curveFind.to(centerPoint);
          console.log(centerPoint, curvePoints, curveFind)
      }
   //########################
   //## erasing the walls  ##
   //########################
   //each cell as walls so 2 walls to erase
      cell[nextCell.NESO] = false; //this cell wall
    	var nextCellMap = thisMap.map[nextCell.row][nextCell.col] //and the next cell wall too
    	nextCellMap["SONE".charAt("NESO".indexOf(nextCell.NESO))] = false;



   };


    //debug
    if (debug) {
      form.fill(colors.a1)
      //form.text(new Point(20, dL += 10), "stack: " + stackMap);
      form.text(new Point(20, dL += 10), "next: " + nextCell.row + ", " + nextCell.col + ", " + nextCell.NESO)
      }

  //recusive exit condition
  switch (kind) {
    case "make":
      {
        var condition = (stack.length == 0)
        break;
      }
    case "find":
      {
        var condition = ((nextCell.row == rowEnd) && (nextCell.col == colEnd))
        break;
      }
  }

  if (condition) {
    stack = []; //reset stack
    return
  }

  //###################################
  //##  call recursive to next cell  ##
  //###################################
  // not working with this metod of maps: setTimout for animation, velocity depends of the size of the grid.

  switch (kind) {
    case "make":
      {
        return mazeDFS(thisMap, nextCell.row, nextCell.col, "make", stack)
      }
    case "find":
      {


        return mazeDFS(thisMap, nextCell.row, nextCell.col, "find", stack, rowEnd, colEnd, mazeMap)

      }
  }
};


//draw the whole thing

spaceGrid.add({

  animate: function(time, fps, context) {

    //form.stroke(false).fill("#223").rect(bound)
    var stackMap = [];
    /*stackMap.push({
      row: startRow,
      col: startCol,
      NSEO: "?"
    })*/
    mazeDFS(map, startRow, startCol, "make", stackMap);

    form.fill(colors.a2).stroke(colors.a2).circle(new Circle(startRectCell.center).setRadius(startRectCell.length() / 8)); //start-point marker
    //form.fill("#999");
    //form.stroke(false).fill("#fff").rect(grid); // draw grid area
    //velocity = Math.ceil(map.grid.cell.size.magnitude())

  },

  onMouseAction: function(type, x, y, evt) {
    var isEndMarked = false;
    if (type == "move") {}

    if (type == "drag") {}

    if (type == "down") {
      if (!isEndMarked) {
        mouse.set(x, y);
        var cellMouse = grid.positionToCell(mouse);
        var endRectCell = grid.cellToRectangle(cellMouse.x, cellMouse.y);
        endRectMark = new Circle(endRectCell.center).setRadius(endRectCell.length() / 8)
        form.fill(colors.b1).stroke(colors.b1).circle(endRectMark); //end-point marker
        var stackFind = [];
        /*stackFind.push({
          row: startRow,
          col: startCol,
          NSEO: "?"
        })*/
        mazeDFS(findMap, startRow, startCol, "find", stackFind, cellMouse.y, cellMouse.x, map);
        isEndMarked = true;
      }
    }
    if (type == "up") {

      //draw experiment curve path

      var pts = curveFind.points
        //formDFS.fill(false).stroke(colors.a1, 2,"round").curve(new Curve().to(pts).catmullRom() );

      //formDFS.fill(false).stroke(colors.a1, 2, "round").curve(new Curve().to(pts).bspline());

      //console.log(curvePoints);
      //formDFS.fill(false).stroke(colors.a1, 2, "round").curve(new Curve().to(curvePoints).bspline());

      findMap.drawGrid();

    }
  }

});
spaceGrid.bindMouse();



//animate DFS constructing the maze
spaceDFS.add({
  animate: function(time, fps, context) {
    map.drawGrid(); // draw grid cells (via generate() callback)
  },
  onMouseAction: function(type, x, y, evt) {
    var isEndMarked = false;
    if (type == "move") {}

    if (type == "drag") {}

    if (type == "down") {}

    if (type == "up") {



    }
  }

});
spaceDFS.bindMouse();

// 4. Start playing

//.refresh(false);
spaceGrid.play();
spaceGrid.pause();

spaceDFS.play();
spaceDFS.pause();
}//]]> 
