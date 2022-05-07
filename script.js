class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.element = document.getElementById('grid');
        this.class = 'grid-tile';
    }

    clearAll () {
        let tiles = document.getElementsByClassName(this.class);

        for (let tile of tiles) {
            //test
            console.log(tile);
        }
    }
}

let gridWidth = 10;
let gridHeight = 10;
let grid = new Grid(gridWidth, gridHeight);

grid.clearAll();

for (let i = 0; i < grid.width; i++) {
    let element = document.createElement('div');
    element.classList.add(grid.class);
    element.innerHTML = i.toString();
}