import { describe, expect, it } from 'vitest';
import { analyzeStl } from './stl';

const tetrahedronAscii = `solid tetrahedron
facet normal 0 0 -1
  outer loop
    vertex 0 0 0
    vertex 0 10 0
    vertex 10 0 0
  endloop
endfacet
facet normal 0 -1 0
  outer loop
    vertex 0 0 0
    vertex 10 0 0
    vertex 0 0 10
  endloop
endfacet
facet normal -1 0 0
  outer loop
    vertex 0 0 0
    vertex 0 0 10
    vertex 0 10 0
  endloop
endfacet
facet normal 1 1 1
  outer loop
    vertex 10 0 0
    vertex 0 10 0
    vertex 0 0 10
  endloop
endfacet
endsolid tetrahedron`;

function asciiBuffer(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer as ArrayBuffer;
}

function binaryTetrahedron(): ArrayBuffer {
  const triangles = [
    [[0, 0, 0], [0, 10, 0], [10, 0, 0]],
    [[0, 0, 0], [10, 0, 0], [0, 0, 10]],
    [[0, 0, 0], [0, 0, 10], [0, 10, 0]],
    [[10, 0, 0], [0, 10, 0], [0, 0, 10]],
  ] as const;
  const buffer = new ArrayBuffer(84 + triangles.length * 50);
  const view = new DataView(buffer);
  view.setUint32(80, triangles.length, true);

  let offset = 84;
  for (const triangle of triangles) {
    offset += 12;
    for (const vertex of triangle) {
      for (const coordinate of vertex) {
        view.setFloat32(offset, coordinate, true);
        offset += 4;
      }
    }
    view.setUint16(offset, 0, true);
    offset += 2;
  }

  return buffer;
}

describe('analyzeStl', () => {
  it('calculates volume and dimensions from a watertight ASCII STL', () => {
    const result = analyzeStl(asciiBuffer(tetrahedronAscii), 'mm');

    expect(result.format).toBe('ascii');
    expect(result.triangleCount).toBe(4);
    expect(result.watertight).toBe(true);
    expect(result.volumeCm3).toBeCloseTo(1 / 6, 8);
    expect(result.dimensionsMm).toEqual({ x: 10, y: 10, z: 10 });
  });

  it('calculates the same result from binary STL', () => {
    const result = analyzeStl(binaryTetrahedron(), 'mm');

    expect(result.format).toBe('binary');
    expect(result.watertight).toBe(true);
    expect(result.volumeCm3).toBeCloseTo(1 / 6, 8);
  });

  it('applies the explicitly selected STL unit', () => {
    const result = analyzeStl(asciiBuffer(tetrahedronAscii), 'cm');

    expect(result.volumeCm3).toBeCloseTo(1000 / 6, 8);
    expect(result.dimensionsMm).toEqual({ x: 100, y: 100, z: 100 });
  });

  it('flags a cracked mesh as not watertight', () => {
    const crackedMesh = tetrahedronAscii.replace(
      'vertex 10 0 0\n    vertex 0 10 0\n    vertex 0 0 10\n  endloop\nendfacet\nendsolid',
      'vertex 10 0 0\n    vertex 0 10 0\n    vertex 0 0 11\n  endloop\nendfacet\nendsolid',
    );
    const result = analyzeStl(asciiBuffer(crackedMesh), 'mm');

    expect(result.watertight).toBe(false);
    expect(result.boundaryEdgeCount).toBeGreaterThan(0);
  });
});
