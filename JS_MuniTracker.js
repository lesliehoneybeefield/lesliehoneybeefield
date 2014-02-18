var map = null;	
var lat = [];
var lon = [];
var id=[];
var trainLocations = {};
var markerLat; 
var markerLon;
var markerID;
var trainMarkerFunc = null;
var line = "22";
var timedMap;
var updateLastTime;
var updatingCars = {};
var agencyRoutes = {};


function initialize() {
  
  mapCenterLat = //lat[6];//
  37.78;
  mapCenterLon = //lon[6];//
  -122.42;
  mapOptions = {
   center: new google.maps.LatLng(mapCenterLat, mapCenterLon),
   maxZoom: 15,
   mapTypeId: google.maps.MapTypeId.ROADMAP,
   minZoom: 10
  };

   var bounds = new google.maps.LatLngBounds(
   new google.maps.LatLng(38.8, -123.00), 
   new google.maps.LatLng(38.7, -122.0)
  );
   bounds.extend(new google.maps.LatLng(mapCenterLat, mapCenterLon));


  map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions); 
   map.fitBounds(bounds);
  getUserLocation();
  //setLine();
  getAgencyRoutes();
  //getXMLdata();
  
  //buildRouteSelector();

  //continuousUpdate();
  //document.getElementById("title").innerHTML="The " + line;
  document.getElementById("title").innerHTML="Select a line";
};

function setLineWithButton(buttonLine){
  line = buttonLine;
  //document.getElementById("title").innerHTML="The " + line;
  
  if (agencyRoutes[line].visible == true)
    {
      agencyRoutes[line].visible = false;
      document.getElementById(line).setAttribute("style","width:50px;");
      document.getElementById(line).setAttribute("type","button");
      clearBusesFromMap(line);
      delete visibleLines[line];
      getVisibleLines();
    }
  else
    {
      agencyRoutes[line].visible = true;
      
      document.getElementById(line).setAttribute("style","width:50px; font-weight:bold; color:WHITE; background-color:purple;");
      getALinesLocations();
      getVisibleLines();

      //visibleLines.push(line);
    };
  //var carIDs = Object.keys(trainLocations);
 
   /*for (i=0;i<carIDs.length;i++) {
        trainLocations[carIDs[i]].setVisible(false); 
    }*/
  //document.getElementById("title").innerHTML=/*agencyRoutes[line]['title']*/ agencyRoutes[line].locations[1];
  //getXMLdata();
  //document.getElementById("title").innerHTML=Object.keys(visibleLines);

};

function getNewLineWithButton(buttonLine)
  {
    //buttonLine  = buttonLine
    setLineWithButton(buttonLine);
    //getALinesLocations();
    //getVisibleLines();

  };

var visibleLines = {};

function getVisibleLines() 
  {
    
    for (x in agencyRoutes)
    {
      if (agencyRoutes[x].visible)
      {
        visibleLines[x]=x;
      }
      else
      {
        delete visibleLines[x];
      }
    };
    //updateVisibleLines();
    if (Object.keys(visibleLines).length==0)
      { 
        document.getElementById("title").innerHTML="Select a line";
      }
    else 
    {
      document.getElementById("title").innerHTML="The " + Object.keys(visibleLines);
    }
    
  };

function updateVisibleLines()
  {
    for (x in visibleLines)
        { 
          line = visibleLines[x];
          //alert(line);
          updateLocationsData();
        };

    updatesActive = setInterval(function(){
      for (x in visibleLines)
        { 
          line = visibleLines[x];
          //alert(line);
          updateLocationsData();
        };
    }, 5000);
  };

function setLine(){
  line = prompt("Tell me again, mama?", line);
  document.getElementById("title").innerHTML=agencyRoutes[line]['title'];
  
  var carIDs = Object.keys(trainLocations);
 
   for (i=0;i<carIDs.length;i++) {
        trainLocations[carIDs[i]].setVisible(false); 
    }

  getNewLineWithButton(line);
};

function clearBusesFromMap(line){
  for (each in agencyRoutes[line].locations)
      {
        agencyRoutes[line].locations[each].setVisible(false);
        //agencyRoutes[all].visible=false;
      }; 
};

function clearAll()
  {
    for (all in visibleLines)
    {
      for (each in agencyRoutes[all].locations)
      {
        agencyRoutes[all].locations[each].setVisible(false);
        //agencyRoutes[all].visible=false;
      };
     setLineWithButton(all);
    };
  };

function stopContinuousUpdate()
  {
    clearInterval(updatesActive);
  };

if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari
	  xmlhttp=new XMLHttpRequest();
  }
else
  {// code for IE6, IE5
   xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
	

function getUserLocation()
  {
    if (navigator.geolocation)
      {
      navigator.geolocation.getCurrentPosition(showPosition);
      }
    else{alert("Geolocation is not supported by this browser.");
      }
  };

function showPosition(position) 
  {
  var userMarker = new google.maps.Marker({ 
          position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
          title: 'Me!',
          map: map,
          icon: {
                  url: '/libraries/glyphicons_free/glyphicons/png/glyphicons_242_google_maps.png', 
                } 
    }); 
  };

function updateUserLocation()
  {
    {
    if (navigator.geolocation)
      {
      navigator.geolocation.getCurrentPosition(showPosition);
      }
    else{alert("Geolocation is not supported by this browser.");}
    }
  };

function updatePosition(position) 
  {
  userMarker.setPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  };

function getAgencyRoutes() 
  {
    xmlhttp.open("GET","http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni",false);
    xmlhttp.send();
    xmlDoc=xmlhttp.responseXML;
    agencyRoutesElements=xmlDoc.getElementsByTagName("route");
    
    //lemons = {hat: "legs", car: "milk"};
    //clearTheData();      
    for (i=0;i<agencyRoutesElements.length;i++)
      { 
        agencyRoutes[agencyRoutesElements[i].getAttribute("tag")]= {
          title: agencyRoutesElements[i].getAttribute("title"),
          visible: false,
          locations: {}
        };
      };
    buildRouteSelector();
  };

function getALinesLocations()
  {
    agencyRoutes[line].locations=getLocationsData();
  };


function getLocationsData()
  {
    storedCarLocations ={};  
    /*for (j=0; j<5; j++){
      testAReturnVariable[j]=j;
    }
    return testAReturnVariable;*/

      xmlhttp.open("GET","http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&r="+line+"&t=0",false);
      xmlhttp.send();
      xmlDoc=xmlhttp.responseXML;
      carLocations=xmlDoc.getElementsByTagName("vehicle");
      //document.getElementById("title").innerHTML=Number(carLocations[0].getAttribute("heading"));     
      for (i=0;i<carLocations.length;i++)
        { 
          if (carLocations[i].getAttribute("leadingVehicleId") == null) {
            //if (carLocations[i].getAttribute("dirTag") != null) {
            var id = carLocations[i].getAttribute("id");
            var fillColorByDirection;        
            if (carLocations[i].getAttribute("dirTag")==null)
              {fillColorByDirection = 'Orange';}
            else if (carLocations[i].getAttribute("dirTag").indexOf('IB')==-1)
              { fillColorByDirection = 'LightSkyBlue';}
            else
              { fillColorByDirection = 'blue';}; 
            storedCarLocations[carLocations[i].getAttribute("id")] = new google.maps.Marker({
              position: new google.maps.LatLng(carLocations[i].getAttribute("lat"), carLocations[i].getAttribute("lon")), 
              title: (carLocations[i].getAttribute("id")),
              map: map,
              icon: {
                      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, 
                      scale: 3,
                      strokeColor: 'black',
                      strokeWeight: 1,
                      rotation: Number(carLocations[i].getAttribute("heading")),
                      fillOpacity: 100,
                      fillColor:  fillColorByDirection
                    }  
              });
            //};*/
          }; 
        };
      return storedCarLocations;
  };

function updateLocationsData()
  {
    updateStoredCarLocations ={};  
    /*for (j=0; j<5; j++){
      testAReturnVariable[j]=j;
    }
    return testAReturnVariable;*/

      updatingCars = {};  
      xmlhttp.open("GET","http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&r="+line+"&t=0",false);
      xmlhttp.send();
      xmlDoc=xmlhttp.responseXML;
      locationUpdates=xmlDoc.getElementsByTagName("vehicle");
      updateLastTimeObject=xmlDoc.getElementsByTagName("lastTime");
      updateLastTime=updateLastTimeObject[0].getAttribute("time");
      //evaluate new data    
      for (i=0;i<locationUpdates.length;i++) {
      //trainLocations[1466].updated = "";
      //trainlocations[1466].updated = "No"; 
      //only leading vehicles
        if (locationUpdates[i].getAttribute("leadingVehicleId") == null) {
        //only those w direction
          //if (locationUpdates[i].getAttribute("dirTag") != null) {
          updatingCars[locationUpdates[i].getAttribute("id")]=true;
          //if the leading vehicles is already logged, update the location
          if (typeof agencyRoutes[line].locations[locationUpdates[i].getAttribute("id")] != 'undefined')
            {
             // trainLocations[1466].updated = "Yes";
              agencyRoutes[line].locations[locationUpdates[i].getAttribute("id")].setPosition(new google.maps.LatLng(locationUpdates[i].getAttribute("lat"), locationUpdates[i].getAttribute("lon")));
              agencyRoutes[line].locations[locationUpdates[i].getAttribute("id")].setVisible(true);
            }
          //if there is a new leading vehicle, add the leading vehicle to the map.        
          else if (typeof agencyRoutes[line].locations[locationUpdates[i].getAttribute("id")] == 'undefined')
            {
            var fillColorByDirection;
            document.getElementById("title").innerHTML=locationUpdates[i].getAttribute("dirTag").indexOf('IB');        
            if (locationUpdates[i].getAttribute("dirTag").indexOf('IB')==-1)
              { fillColorByDirection = 'orange';}
            else
              { fillColorByDirection = 'red';};
            agencyRoutes[line].locations[locationUpdates[i].getAttribute("id")] = new google.maps.Marker({
            position: new google.maps.LatLng(locationUpdates[i].getAttribute("lat"), locationUpdates[i].getAttribute("lon")), 
            title: (locationUpdates[i].getAttribute("id")),
            map: map,
            icon: {
                      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, 
                      scale: 3,
                      strokeColor: 'black',
                      strokeWeight: 1,
                      rotation: Number(locationUpdates[i].getAttribute("heading")),
                      fillOpacity: 100,
                      fillColor:  fillColorByDirection
                    }  
            });
            }
        //};
        };
      };
      //remove cars which are no longer reporting; 
      var carIDs = Object.keys(agencyRoutes[line].locations); 
       for (i=0;i<carIDs.length;i++) {
            //document.getElementById("title").innerHTML=Object.keys(updatingCars);
          if (typeof updatingCars[carIDs[i]] == 'undefined')
          {
            agencyRoutes[line].locations[carIDs[i]].setVisible(false);
          }  
        };

      //return updatetestAReturnVariable;
  };

function buildRouteSelector()
  {
    for (x in agencyRoutes) {

    para = document.getElementById("routeSelection");
    label = document.createElement("label");
    input = document.createElement("input");
    //var node=document.createTextNode("Hi");

    input.setAttribute("id", x);
    input.setAttribute("class","btn btn-block");
    input.setAttribute("type","button");
    input.setAttribute("onclick","getNewLineWithButton('"+x+"');");
    input.setAttribute("value", x);
    input.setAttribute("style", "width:50px;");
    
    para.appendChild(label);
    //para.appendChild(node);
    label.appendChild(input);
    //inputA.appendChild(node);
    };
  };
