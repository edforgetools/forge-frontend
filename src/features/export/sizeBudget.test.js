import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { exportUnder2MB } from './sizeBudget';
const ctxStub = {
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    // @ts-expect-error runtime property not typed strictly
    imageSmoothingQuality: 'high',
};
let getContextSpy;
let toBlobSpy;
beforeAll(() => {
    getContextSpy = vi
        .spyOn(HTMLCanvasElement.prototype, 'getContext')
        .mockImplementation(() => ctxStub);
    toBlobSpy = vi
        .spyOn(HTMLCanvasElement.prototype, 'toBlob')
        .mockImplementation(function (callback, type, quality) {
        const q = typeof quality === 'number' ? quality : 0.9;
        const size = q > 0.75 ? 2400000 : 1500000;
        const blob = new Blob([new Uint8Array(size)], {
            type: type || 'image/jpeg',
        });
        callback(blob);
    });
});
afterAll(() => {
    getContextSpy.mockRestore();
    toBlobSpy.mockRestore();
});
describe('exportUnder2MB', () => {
    it('exports something (smoke)', async () => {
        const c = document.createElement('canvas');
        c.width = 1920;
        c.height = 1080;
        const ctx = c.getContext('2d');
        // @ts-expect-error fillStyle is fine at runtime
        ctx.fillStyle = '#123456';
        ctx.fillRect(0, 0, c.width, c.height);
        const blob = await exportUnder2MB(c, 'image/jpeg');
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.size).toBeLessThanOrEqual(2000000);
    });
});
