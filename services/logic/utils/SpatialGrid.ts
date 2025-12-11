
export class SpatialHashGrid {
  private cells: Map<string, any[]> = new Map();
  private cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  // 清空网格（每帧调用）
  clear() {
    this.cells.clear();
  }

  // 将实体插入网格
  insert(item: any) {
    const key = this.getKey(item.x, item.y);
    if (!this.cells.has(key)) {
        this.cells.set(key, []);
    }
    this.cells.get(key)!.push(item);
  }

  // 批量插入
  insertAll(items: any[]) {
      for (const item of items) {
          this.insert(item);
      }
  }

  // 查询某点附近的实体 (当前格子 + 周围8个格子)
  query(x: number, y: number): any[] {
    const results: any[] = [];
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);

    // 检查 3x3 区域
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const key = `${cx + i},${cy + j}`;
        const cell = this.cells.get(key);
        if (cell) {
            for (let k = 0; k < cell.length; k++) {
                results.push(cell[k]);
            }
        }
      }
    }
    return results;
  }

  private getKey(x: number, y: number) {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  }
}
