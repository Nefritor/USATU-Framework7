function findPath(startLatlong, finLatlong) {
    var startXY = [{
        x: parseFloat(startLatlong[0]).toFixed(3),
        y: parseFloat(startLatlong[1]).toFixed(3)
    }];
    var finXY = [{
        x: parseFloat(finLatlong[0]).toFixed(3),
        y: parseFloat(finLatlong[1]).toFixed(3)
    }];
    /////////////////////////////////////////////////////////////////////////
    var index = 0;
    var open = [];
    var closed = [];
    var current = startXY;


    /////////////////////////////////////////////////////////////////////////
    var path = [];
    path.push({x: startLatlong[0], y: startLatlong[1]});
    path.push({x: finLatlong[0], y: finLatlong[1]});
    return path;
}

function getDistance(current, target) {

    var distX = Math.abs(current.x - target.x);
    var distY = Math.abs(current.y - target.y);

    if (distX > distY)
        return 0.00014 * distY + 10 * (distX - distY);
    else
        return 0.00014 * distX + 10 * (distY - distX);
}