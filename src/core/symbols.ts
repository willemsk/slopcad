export interface SymbolDefinition {
  name: string;
  category: string;
  svgPath: string; // SVG path data or symbol shape commands
  defaultWidth: number; // in meters
  defaultHeight: number; // in meters
}

export class SymbolRegistry {
  private static symbols: SymbolDefinition[] = [
    // Pre-populate with a couple of plumbing symbols just to test the plumbing
    {
      name: 'Chair',
      category: 'furniture',
      svgPath:
        'M -0.2 -0.2 L 0.2 -0.2 L 0.2 0.2 L -0.2 0.2 Z M -0.15 -0.15 L 0.15 -0.15 L 0.15 0.15 L -0.15 0.15 Z',
      defaultWidth: 0.45,
      defaultHeight: 0.45,
    },
    {
      name: 'Table',
      category: 'furniture',
      svgPath: 'M -0.4 -0.6 L 0.4 -0.6 L 0.4 0.6 L -0.4 0.6 Z',
      defaultWidth: 0.8,
      defaultHeight: 1.2,
    },
  ];

  static register(sym: SymbolDefinition) {
    this.symbols.push(sym);
  }

  static getByCategory(category: string): SymbolDefinition[] {
    return this.symbols.filter(s => s.category === category);
  }

  static getByName(name: string): SymbolDefinition | undefined {
    return this.symbols.find(s => s.name.toLowerCase() === name.toLowerCase());
  }

  static getAll(): SymbolDefinition[] {
    return this.symbols;
  }
}
