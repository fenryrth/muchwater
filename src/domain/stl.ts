export type StlUnit = 'mm' | 'cm' | 'm' | 'inch';

export interface StlAnalysis {
  format: 'binary' | 'ascii';
  triangleCount: number;
  volumeCm3: number;
  dimensionsMm: {
    x: number;
    y: number;
    z: number;
  };
  watertight: boolean;
  boundaryEdgeCount: number;
  nonManifoldEdgeCount: number;
}

interface Point3 {
  x: number;
  y: number;
  z: number;
}

interface MeshAccumulator {
  triangleCount: number;
  signedVolumeRaw: number;
  min: Point3;
  max: Point3;
  edgeCounts: Map<string, number>;
}

const UNIT_TO_MM: Record<StlUnit, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  inch: 25.4,
};

function createAccumulator(): MeshAccumulator {
  return {
    triangleCount: 0,
    signedVolumeRaw: 0,
    min: { x: Infinity, y: Infinity, z: Infinity },
    max: { x: -Infinity, y: -Infinity, z: -Infinity },
    edgeCounts: new Map<string, number>(),
  };
}

function updateBounds(acc: MeshAccumulator, point: Point3): void {
  acc.min.x = Math.min(acc.min.x, point.x);
  acc.min.y = Math.min(acc.min.y, point.y);
  acc.min.z = Math.min(acc.min.z, point.z);
  acc.max.x = Math.max(acc.max.x, point.x);
  acc.max.y = Math.max(acc.max.y, point.y);
  acc.max.z = Math.max(acc.max.z, point.z);
}

function vertexKey(point: Point3): string {
  const rounded = [point.x, point.y, point.z].map((value) => {
    const normalized = Math.abs(value) < 1e-9 ? 0 : value;
    return normalized.toFixed(6);
  });
  return rounded.join(',');
}

function addEdge(acc: MeshAccumulator, a: Point3, b: Point3): void {
  const first = vertexKey(a);
  const second = vertexKey(b);
  const key = first < second ? `${first}|${second}` : `${second}|${first}`;
  acc.edgeCounts.set(key, (acc.edgeCounts.get(key) ?? 0) + 1);
}

function addTriangle(acc: MeshAccumulator, a: Point3, b: Point3, c: Point3): void {
  updateBounds(acc, a);
  updateBounds(acc, b);
  updateBounds(acc, c);

  const crossX = b.y * c.z - b.z * c.y;
  const crossY = b.z * c.x - b.x * c.z;
  const crossZ = b.x * c.y - b.y * c.x;
  acc.signedVolumeRaw += (a.x * crossX + a.y * crossY + a.z * crossZ) / 6;
  acc.triangleCount += 1;

  addEdge(acc, a, b);
  addEdge(acc, b, c);
  addEdge(acc, c, a);
}

function pointFromView(view: DataView, offset: number): Point3 {
  return {
    x: view.getFloat32(offset, true),
    y: view.getFloat32(offset + 4, true),
    z: view.getFloat32(offset + 8, true),
  };
}

function parseBinary(buffer: ArrayBuffer): MeshAccumulator {
  const view = new DataView(buffer);
  const triangleCount = view.getUint32(80, true);
  const expectedLength = 84 + triangleCount * 50;

  if (expectedLength !== buffer.byteLength) {
    throw new Error('Den binære STL-fil har en ugyldig længde.');
  }

  const acc = createAccumulator();
  let offset = 84;

  for (let index = 0; index < triangleCount; index += 1) {
    const a = pointFromView(view, offset + 12);
    const b = pointFromView(view, offset + 24);
    const c = pointFromView(view, offset + 36);
    addTriangle(acc, a, b, c);
    offset += 50;
  }

  return acc;
}

function parseAscii(buffer: ArrayBuffer): MeshAccumulator {
  const text = new TextDecoder().decode(buffer);
  const vertexPattern = /vertex\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/g;
  const vertices: Point3[] = [];

  for (const match of text.matchAll(vertexPattern)) {
    vertices.push({
      x: Number(match[1]),
      y: Number(match[2]),
      z: Number(match[3]),
    });
  }

  if (vertices.length === 0 || vertices.length % 3 !== 0) {
    throw new Error('ASCII STL-filen indeholder ikke gyldige trekantdata.');
  }

  const acc = createAccumulator();
  for (let index = 0; index < vertices.length; index += 3) {
    addTriangle(acc, vertices[index], vertices[index + 1], vertices[index + 2]);
  }

  return acc;
}

function looksBinary(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 84) return false;
  const view = new DataView(buffer);
  const triangleCount = view.getUint32(80, true);
  return 84 + triangleCount * 50 === buffer.byteLength;
}

function finalize(acc: MeshAccumulator, unit: StlUnit, format: 'binary' | 'ascii'): StlAnalysis {
  if (acc.triangleCount < 4) {
    throw new Error('STL-filen indeholder for få trekanter til et lukket volumen.');
  }

  const mmPerUnit = UNIT_TO_MM[unit];
  const cmPerUnit = mmPerUnit / 10;
  const edgeCounts = [...acc.edgeCounts.values()];
  const boundaryEdgeCount = edgeCounts.filter((count) => count === 1).length;
  const nonManifoldEdgeCount = edgeCounts.filter((count) => count > 2).length;
  const watertight = edgeCounts.length > 0 && edgeCounts.every((count) => count === 2);

  return {
    format,
    triangleCount: acc.triangleCount,
    volumeCm3: Math.abs(acc.signedVolumeRaw) * cmPerUnit ** 3,
    dimensionsMm: {
      x: (acc.max.x - acc.min.x) * mmPerUnit,
      y: (acc.max.y - acc.min.y) * mmPerUnit,
      z: (acc.max.z - acc.min.z) * mmPerUnit,
    },
    watertight,
    boundaryEdgeCount,
    nonManifoldEdgeCount,
  };
}

export function analyzeStl(buffer: ArrayBuffer, unit: StlUnit): StlAnalysis {
  if (buffer.byteLength === 0) {
    throw new Error('STL-filen er tom.');
  }

  if (!(unit in UNIT_TO_MM)) {
    throw new Error('Ukendt STL-enhed.');
  }

  if (looksBinary(buffer)) {
    return finalize(parseBinary(buffer), unit, 'binary');
  }

  return finalize(parseAscii(buffer), unit, 'ascii');
}
