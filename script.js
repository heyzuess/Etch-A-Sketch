class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.element = document.getElementById('grid');
        this.class = 'grid-obj';
    }

    clearAll () {
        let tiles = document.getElementsByClassName(this.class);

        for (let tile of tiles) {
            //test
            console.log(tile);
        }
    }

    buildGrid () {
        for (let i = 0; i < this.width; i++) {
            let col = document.createElement('div');
            col.classList.add(this.class);
            col.classList.add('container');
            col.classList.add('grid-col');
        
            for (let j = 0; j < this.height; j++) {
                let element = document.createElement('div');
                element.classList.add(this.class);
                element.classList.add('grid-tile');
                let widthStyle = `${this.width}px`;
                let heightStyle = `${this.height}px`;
                element.style.padding = `${widthStyle} ${heightStyle} ${widthStyle} ${heightStyle}`;
        
                //test
                //element.innerHTML = `Row: ${i}, Col: ${j}`;
        
                col.append(element);
            }
        
            this.element.append(col);
        }
    }
}

let gridWidth = 10;
let gridHeight = 10;
let grid = new Grid(gridWidth, gridHeight);

grid.clearAll();
grid.buildGrid();