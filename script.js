class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

class Point {
    constructor(col, row) {
        this.col = col;
        this.row = row;
    }
}

class Grid {
    constructor(gridSize, tileSize) {
        this.size = gridSize;
        this.tileSize = tileSize;
        this.element = document.getElementById('grid');
        this.class = 'grid-obj';
        this.columns = [];
        this.paint = false;
    }

    clearAll () {
        this.forEachTile(tile => tile.clear());
    }

    buildGrid () {
        for (let i = 0; i < this.size.width; i++) {
            let col = new Column();

            for (let j = 0; j < this.size.height; j++) {
                let tile = new Tile(new Point(i, j), this.tileSize);
                tile.element.classList.add(this.class);
                tile.element.addEventListener('mouseover', (ev) => this.onTileHover(ev));
        
                //test
                //tile.element.innerHTML = `Col: ${i}, Row: ${j}`;
                //tile.element.style.color = 'black';

                col.element.append(tile.element);
                col.tiles.push(tile);
            }

            this.element.append(col.element);
            this.columns.push(col);
        }

        window.addEventListener('mousedown', ev => this.paint = true);
        window.addEventListener('mouseup', ev => this.paint = false);
        window.addEventListener('touchstart', ev => this.paint = true);
        window.addEventListener('touchend', ev => this.paint = false);
    }

    forEachTile (callback) {
        this.columns.forEach(col => {
            col.tiles.forEach(tile => callback(tile));
        });
    }

    onTileHover (ev) {
        if (!this.paint) return;
        ev.target.style.backgroundColor = 'blue';
    }

    actualSize() {
        let tileActualSize = this.columns[0].tiles[0].actualSize();
        return new Size(this.size.width * tileActualSize.width,
                        this.size.height * tileActualSize.height);
    }
}

class Column {
    constructor () {
        this.tiles = [];
        this.element = document.createElement('div');

        this.element.classList.add(this.class);
        this.element.classList.add('container');
        this.element.classList.add('grid-col');
    }
}

class Tile {
    constructor (tilePosition, tileSize) {
        this.position = tilePosition;
        this.size = tileSize;
        this.element = document.createElement('div');
        this.element.classList.add('grid-tile');

        let widthStyle = `${this.size.width}px`;
        let heightStyle = `${this.size.height}px`;
        this.element.style.padding = `${widthStyle} ${heightStyle} ${widthStyle} ${heightStyle}`;
    }

    clear() {
        this.element.remove();
    }

    actualSize () {
        let borderSize = this.borderSize();
        let width = (this.size.width * 2) + borderSize.width;
        let height = (this.size.height * 2) + borderSize.height;
        return new Size(width, height);
    }

    borderSize () {
        let style = element => window.getComputedStyle(element);
        let borderLeftWidth = style(this.element).borderLeftWidth.replace("px", "");
        let borderRightWidth = style(this.element).borderRightWidth.replace("px", "");
        let borderTopWidth = style(this.element).borderTopWidth.replace("px", "");
        let borderBottomWidth = style(this.element).borderBottomWidth.replace("px", "");

        let borderSizeWidth = (borderLeftWidth && borderLeftWidth !== "" ?
                                parseInt(borderLeftWidth) ?? 0
                                :
                                0)
                              +
                              (borderRightWidth && borderRightWidth !== "" ?
                                parseInt(borderRightWidth) ?? 0
                                :
                                0);
        let borderSizeHeight = (borderTopWidth && borderTopWidth !== "" ?
                                 parseInt(borderTopWidth) ?? 0
                                 :
                                 0)
                               +
                               (borderBottomWidth && borderBottomWidth !== "" ?
                                 parseInt(borderBottomWidth) ?? 0
                                 :
                                 0);
        
        return new Size(borderSizeWidth, borderSizeHeight);
    }
}

let grid = new Grid(new Size(20, 20), new Size(10, 10));
grid.clearAll();
grid.buildGrid();